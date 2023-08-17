// Global variable for data storage
let data;

async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        updateStatus("No file selected.", "error");
        return;
    }

    if (file.type !== "text/csv") {
        updateStatus("Please upload a valid CSV file.", "error");
        return;
    }

    if (file.size > 5000000) {  // limiting file size to 5MB
        updateStatus("File size is too large. Please upload a file smaller than 5MB.", "error");
        return;
    }

    try {
        updateStatus("Reading file...");
        const fileContent = await readFile(file);
        
        updateStatus("Processing CSV...");
        data = csvToJSON(fileContent);
        
        const segmentedData = segmentData();
        const metrics = computeMetrics();

        updateStatus("Visualizing data...");
        displaySegmentedData(segmentedData);
        displayMetrics(metrics);

        updateStatus("Visualization complete!", "success");
    } catch (error) {
        updateStatus("An error occurred: " + error.message, "error");
    }
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function updateStatus(message, type = "info") {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
}

function csvToJSON(csv) {
    const lines = csv.trim().split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        result.push(obj);
    }
    return result;
}

function segmentData() {
    const tfValues = tf.tensor(data.map(row => parseFloat(row['Event Breakdown'])));
    const mean = tfValues.mean().dataSync()[0];
    const std = Math.sqrt(tfValues.variance().dataSync()[0]);

    const highThreshold = mean + std;
    const lowThreshold = mean - std;

    return {
        highPerforming: data.filter(row => parseFloat(row['Event Breakdown']) > highThreshold),
        average: data.filter(row => parseFloat(row['Event Breakdown']) <= highThreshold && parseFloat(row['Event Breakdown']) >= lowThreshold),
        lowPerforming: data.filter(row => parseFloat(row['Event Breakdown']) < lowThreshold)
    };
}

function computeMetrics() {
    const revenues = data.map(row => parseFloat(row['Event Breakdown']));
    const cumulativeRevenues = revenues.map((val, idx, arr) => arr.slice(0, idx + 1).reduce((a, b) => a + b));

    return {
        cumulativeRevenues: cumulativeRevenues
    };
}

function displaySegmentedData(segmentedData) {
    const ctx = document.getElementById('visualization').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(row => row['Sponsors']),
            datasets: [
                {
                    label: 'High Performing Sponsors',
                    data: segmentedData.highPerforming.map(row => parseFloat(row['Event Breakdown'])),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Average Sponsors',
                    data: segmentedData.average.map(row => parseFloat(row['Event Breakdown'])),
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Low Performing Sponsors',
                    data: segmentedData.lowPerforming.map(row => parseFloat(row['Event Breakdown'])),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function displayMetrics(metrics) {
    const ctxMetrics = document.getElementById('metrics').getContext('2d');
    new Chart(ctxMetrics, {
        type: 'line',
        data: {
            labels: data.map(row => row['Sponsors']),
            datasets: [
                {
                    label: 'Cumulative Revenue',
                    data: metrics.cumulativeRevenues,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// D3.js Tooltip for extra information on hover
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

document.getElementById('visualization').onmousemove = function(event) {
    const index = Math.floor(event.offsetX / 100);
    if (data[index]) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`
            Sponsors: ${data[index]['Sponsors']}<br>
            Venue: ${data[index]['Venue']}<br>
            Total Revenue: ${data[index]['Total Revenue']}
        `)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    }
};

document.getElementById('visualization').onmouseout = function() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
};
