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

