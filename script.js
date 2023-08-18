// Global variable for data storage
let data;

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

async function earnings_forecast_simulation_millions() {
    if (!data || data.length === 0) {
        updateStatus("No data available for simulation.", "error");
        return;
    }

    // Extract the 'Total Revenue' column and convert it into a tensor
    const revenues = data.map(row => parseFloat(row['Total Revenue'] || 0));
    const dataTensor = tf.tensor(revenues);

    // Define the Generator
    const generator = tf.sequential();
    generator.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [100] }));
    generator.add(tf.layers.dense({ units: 1, activation: 'linear' }));

    // Define the Discriminator
    const discriminator = tf.sequential();
    discriminator.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [1] }));
    discriminator.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    // Define loss functions and optimizers
    const generatorOptimizer = tf.train.adam(0.0001);
    const discriminatorOptimizer = tf.train.adam(0.0001);

    // Training loop (simplified for demonstration)
    for (let i = 0; i < 1000; i++) {
        // This is a very basic training loop and might not be optimal
        // Train discriminator
        const realData = dataTensor;
        const fakeData = generator.predict(tf.randomNormal([dataTensor.shape[0], 100]));
        const combinedData = realData.concat(fakeData, 0);
        const labels = tf.tensor([...Array(dataTensor.shape[0]).fill([1]), ...Array(dataTensor.shape[0]).fill([0])]);
        discriminatorOptimizer.minimize(() => {
            const predictions = discriminator.predict(combinedData);
            const loss = tf.losses.sigmoidCrossEntropy(labels, predictions);
            return loss;
        });

        // Train generator
        const noise = tf.randomNormal([dataTensor.shape[0], 100]);
        generatorOptimizer.minimize(() => {
            const generated = generator.predict(noise);
            const discPrediction = discriminator.predict(generated);
            const loss = tf.losses.sigmoidCrossEntropy(tf.onesLike(discPrediction), discPrediction);
            return loss;
        });
    }

    // Once trained, run Monte Carlo Simulation
    let simulated_revenues = [];
    for (let i = 0; i < 10000; i++) {
        // Generate synthetic data using the GAN's generator
        const noise = tf.randomNormal([1, 100]);
        let synthetic_revenue = generator.predict(noise).dataSync()[0];
        
        // Apply random variation
        let variation = (Math.random() * 0.20) - 0.10;  // Random number between -0.10 and 0.10
        let simulated_value = synthetic_revenue * (1 + variation);
        
        simulated_revenues.push(simulated_value / 1e6);
    }

    // Visualize the results
    displayGANResults(simulated_revenues);  // A new function to visualize the GAN results

    updateStatus("Simulation complete!", "success");
}

function displayGANResults(revenues) {
    // Use a JavaScript charting library (e.g., Chart.js) to visualize the results
    // This is a placeholder and assumes you've set up a canvas with id 'ganResults'
    const ctx = document.getElementById('ganResults').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: revenues.length}, (_, i) => i + 1),
            datasets: [{
                label: 'Simulated Revenue (in millions $)',
                data: revenues,
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
}

