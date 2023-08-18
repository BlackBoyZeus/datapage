// Function to process the uploaded CSV file
function processFile() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('status');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const csv = event.target.result;
            const data = parseCSV(csv);
            // TODO: Further processing or visualization of the data

            // Update the status div
            statusDiv.innerHTML = "File successfully processed!";
        };

        reader.onerror = function() {
            statusDiv.innerHTML = "Error reading the file.";
        };

        reader.readAsText(file);
    } else {
        statusDiv.innerHTML = "No file selected.";
    }
}

// Helper function to parse CSV into an array of objects
function parseCSV(csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(",");

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j].trim();
        }

        result.push(obj);
    }

    return result;
}

// Helper function to preprocess the data
function preprocessData(data) {
    return data.map(item => {
        return {
            ...item,
            'Event Breakdown': stringToNumber(item['Event Breakdown']),
            'Total Revenue': stringToNumber(item['Total Revenue'])
        };
    });
}

// Helper function to convert a string containing numbers and other characters into a number
function stringToNumber(str) {
    if (!str) return null;
    const num = parseFloat(str.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? null : num;
}

c function clusterData(data) {
    // Convert data into TensorFlow tensors
    const tensors = data.map(item => [item['Event Breakdown'], item['Total Revenue']]);
    const dataset = tf.tensor2d(tensors);

    // KMeans clustering
    const kmeans = new tf.KMeans(dataset);
    const clusters = await kmeans.cluster(3); // Assuming 3 clusters, this can be changed

    // Attach cluster label to the data
    for (let i = 0; i < data.length; i++) {
        data[i].cluster = clusters[i];
    }

    return data;
}


function visualizeClusters(data) {
    const ctx = document.getElementById('visualization').getContext('2d');
    const scatterData = {
        datasets: [{
            label: 'Cluster 1',
            data: data.filter(item => item.cluster === 0).map(item => ({ x: item['Event Breakdown'], y: item['Total Revenue'] })),
            backgroundColor: 'red'
        }, {
            label: 'Cluster 2',
            data: data.filter(item => item.cluster === 1).map(item => ({ x: item['Event Breakdown'], y: item['Total Revenue'] })),
            backgroundColor: 'blue'
        }, {
            label: 'Cluster 3',
            data: data.filter(item => item.cluster === 2).map(item => ({ x: item['Event Breakdown'], y: item['Total Revenue'] })),
            backgroundColor: 'green'
        }]
    };

    new Chart(ctx, {
        type: 'scatter',
        data: scatterData,
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                }
            }
        }
    });
}

async function onClusterDataClick() {
    const data = parseCSV(document.getElementById('fileInput').value);
    const preprocessedData = preprocessData(data);
    const clusteredData = await clusterData(preprocessedData);
    visualizeClusters(clusteredData);
}

