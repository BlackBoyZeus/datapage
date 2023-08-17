// Global variables
let data;
let tfData;

async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        updateStatus("No file selected.", "error");
        return;
    }

    updateStatus("Reading file...");
    const fileContent = await readFile(file);

    updateStatus("Processing CSV...");
    data = csvToJSON(fileContent);
    preprocessData(data);

    tfData = tf.tensor(data.map(row => parseFloat(row['Event Breakdown'] || '0')));

    updateStatus("Computing statistics...");
    const stats = computeBasicStats(tfData);
    displayStats(stats);

    updateStatus("Visualizing data...");
    displayData();

    updateStatus("Applying advanced TensorFlow.js operations...");
    applyTFJSOperations(tfData);

    updateStatus("Rocketing to Mars... Complete!", "success");
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
            obj[headers[j]] = isNaN(currentLine[j]) ? currentLine[j] : parseFloat(currentLine[j]);
        }
        result.push(obj);
    }
    return result;
}

function preprocessData(data) {
    // Fill missing values with the median of the column
    const breakdowns = data.map(row => parseFloat(row['Event Breakdown'] || '0')).sort();
    const median = breakdowns[Math.floor(breakdowns.length / 2)];

    data.forEach(row => {
        if (!row['Event Breakdown']) {
            row['Event Breakdown'] = median;
        }
    });
}

function computeBasicStats(tensorData) {
    const mean = tensorData.mean().arraySync();
    const stdDev = tensorData.std().arraySync();
    const min = tensorData.min().arraySync();
    const max = tensorData.max().arraySync();

    return { mean, stdDev, min, max };
}

function displayStats(stats) {
    // Display the stats on the web page
    const statsDiv = document.createElement('div');
    statsDiv.innerHTML = `
        <strong>Statistics</strong>
        <p>Mean: ${stats.mean}</p>
        <p>Standard Deviation: ${stats.stdDev}</p>
        <p>Min: ${stats.min}</p>
        <p>Max: ${stats.max}</p>
    `;

    document.body.appendChild(statsDiv);
}

function displayData() {
    // Display the data using Chart.js
    // We'll display a bar chart using sponsors as labels and event breakdown as values
    const labels = data.map(row => row['Sponsors'] || 'Unknown');
    const values = data.map(row => parseFloat(row['Event Breakdown'] || '0'));

    const ctx = document.getElementById('visualization').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Event Breakdown',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
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

function applyTFJSOperations(tensorData) {
    // For this sample, let's normalize the data
    const normalizedData = tensorData.sub(tensorData.min()).div(tensorData.max().sub(tensorData.min()));
    // You can then use this normalized data for further operations, such as clustering, neural networks, etc.
}



