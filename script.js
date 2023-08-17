async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        updateStatus("No file selected.", "error");
        return;
    }

    try {
        updateStatus("Reading file...");
        const fileContent = await readFile(file);
        
        updateStatus("Processing CSV...");
        data = csvToJSON(fileContent);
        if (!data || data.length === 0) {
            updateStatus("Error processing the CSV file.", "error");
            return;
        }

        updateStatus("Visualizing data...");
        displayBarChart();
        displayPieChart();
        displayAggregateMetrics();

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

function displayBarChart() {
    const ctx = document.getElementById('visualization').getContext('2d');
    const labels = data.map(row => row['Sponsors'] || 'Unknown');
    const values = data.map(row => parseFloat(row['Event Breakdown'] || 0));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Event Breakdown ($)',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    },
                    zoom: {
                        enabled: true,
                        mode: 'xy'
                    }
                }
            }
        }
    });
}

function displayPieChart() {
    const ctxMetrics = document.getElementById('metrics').getContext('2d');
    const venues = [...new Set(data.map(row => row['Venue']))];
    const venueCounts = venues.map(venue => data.filter(row => row['Venue'] === venue).length);

    new Chart(ctxMetrics, {
        type: 'pie',
        data: {
            labels: venues,
            datasets: [{
                data: venueCounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

function displayAggregateMetrics() {
    const totalRevenue = data.reduce((acc, row) => acc + parseFloat(row['Total Revenue'] || 0), 0);
    const averageEventBreakdown = data.reduce((acc, row) => acc + parseFloat(row['Event Breakdown'] || 0), 0) / data.length;

    document.getElementById('aggregateMetrics').innerHTML = `
        <strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}<br>
        <strong>Average Event Breakdown:</strong> $${averageEventBreakdown.toFixed(2)}
    `;
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

async function trainAndVisualize() {
    try {
        updateStatus("Initializing...");
        
        // Preprocess data
        const totalRevenues = data.map(row => {
            return parseFloat(row['Total Revenue'].replace(/,/g, '').replace(/M\+/g, '000000')) || 0;
        });

        if (totalRevenues.length === 0) {
            throw new Error("No valid 'Total Revenue' data found.");
        }

        updateStatus("Converting data into tensors...");
        const totalRevenuesTensor = tf.tensor(totalRevenues).expandDims(1);

        // Create labels for classification
        updateStatus("Generating labels...");
        const labels = totalRevenues.map(revenue => {
            if (revenue > 50000000) return 2;
            else if (revenue > 10000000) return 1;
            else return 0;
        });
        const labelsTensor = tf.tensor(labels);

        // Model creation
        updateStatus("Setting up the model...");
        const model = tf.sequential();
        model.add(tf.layers.dense({units: 10, activation: 'relu', inputShape: [1]}));
        model.add(tf.layers.dense({units: 3, activation: 'softmax'}));

        // Compile the model
        updateStatus("Compiling the model...");
        model.compile({
            loss: 'sparseCategoricalCrossentropy',
            optimizer: tf.train.adam(),
            metrics: ['accuracy']
        });

        // Train the model
        updateStatus("Training the model. Please wait...");
        await model.fit(totalRevenuesTensor, labelsTensor, {
            epochs: 100,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    updateStatus(`Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}`);
                }
            }
        });

        // Visualization
        updateStatus("Visualizing the data...");
        const ctxForecast = document.getElementById('forecast').getContext('2d');
        const eventLabels = Array.from({ length: totalRevenues.length }, (_, i) => `Event ${i + 1}`);
        const predictions = model.predict(totalRevenuesTensor).argMax(1).dataSync();

        new Chart(ctxForecast, {
            type: 'bar',
            data: {
                labels: eventLabels,
                datasets: [{
                    label: 'Actual Revenue ($)',
                    data: totalRevenues,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }, {
                    label: 'Predicted Category',
                    data: predictions,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        updateStatus("Visualization complete!", "success");
    } catch (error) {
        updateStatus("An error occurred: " + error.message, "error");
    }
}



