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
            
            // Update the status div
            statusDiv.innerHTML = "File successfully processed!";
            
            // Call any additional functions here if needed
            manipulateDataWithTFJS(preprocessData(data));
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

// Function to demonstrate tensor creation and manipulation using TensorFlow.js
function manipulateDataWithTFJS(data) {
    // Convert data into TensorFlow tensors
    const eventBreakdownTensor = tf.tensor(data.map(item => item['Event Breakdown']));
    const totalRevenueTensor = tf.tensor(data.map(item => item['Total Revenue']));

    // Example operation: Adding tensors (just for demonstration purposes)
    const sumTensor = tf.add(eventBreakdownTensor, totalRevenueTensor);

    // Convert tensor back to JavaScript array and log to console
    sumTensor.array().then(array => console.log(array));
}

// Cluster and visualize data
async function onClusterDataClick() {
    const data = parseCSV(document.getElementById('fileInput').value);
    const preprocessedData = preprocessData(data);
    // ... [Any clustering or visualization functions can be added here]
    manipulateDataWithTFJS(preprocessedData);
}

