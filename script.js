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
        trainAndVisualize();
        updateStatus("Visualization complete!", "success");
    } catch (error) {
        updateStatus("An error occurred: " + error.message, "error");
document.getElementById('visualization').onmouseout = function() {
};


function trainAndVisualize() {
    // 1. Data extraction and cleaning
    const totalRevenues = data.map(row => {
        let revenue = row['Total Revenue'];
        if (!revenue) return 0;
        if (revenue.includes('M+')) return parseFloat(revenue.replace('M+', '').replace('$', '')) * 1000000;
        return parseFloat(revenue.replace('$', '').replace(',', '')) || 0;
    });
async function trainAndVisualize() {
    try {
        updateStatus("Initializing...");

    const sponsors = data.map(row => row['Sponsors'] || 'Unknown');
    const venues = [...new Set(data.map(row => row['Venue']))];
    const venueCounts = venues.map(venue => data.filter(row => row['Venue'] === venue).length);
        // Extracting and cleaning 'Total Revenue' data
        const totalRevenues = data.map(row => {
        const totalRevenue = data.map(row => {
            let revenue = row['Total Revenue'];
            if (!revenue) return 0;
            if (revenue.includes('M+')) return parseFloat(revenue.replace('M+', '').replace('$', '')) * 1000000;
            return parseFloat(revenue.replace('$', '').replace(',', '')) || 0;
        });

    // 2. Bar chart: Total Revenue vs Sponsors
    const ctxBar = document.getElementById('barChart').getContext('2d');
        // Convert data into tensor
        const tensorData = tf.tensor2d(totalRevenues, [totalRevenues.length, 1]);

    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: sponsors,
            datasets: [{
                label: 'Total Revenue ($)',
                data: totalRevenues,
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
        // Define a simple model
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 3, inputShape: [1], activation: 'softmax' }));
        model.compile({ loss: 'sparseCategoricalCrossentropy', optimizer: tf.train.adam(), metrics: ['accuracy'] });

        // Generate labels for clustering
        const maxRevenue = Math.max(...totalRevenues);
        const minRevenue = Math.min(...totalRevenues);
        const midRevenue = (maxRevenue + minRevenue) / 2;

        const labels = totalRevenues.map(rev => {
            if (rev <= midRevenue) return 0; // Low
            else if (rev > midRevenue && rev <= (midRevenue + maxRevenue) / 2) return 1; // Medium
            else return 2; // High
        });

        const tensorLabels = tf.tensor2d(labels, [labels.length, 1]);
        // Check for NaN values in the extracted data
        if (totalRevenue.includes(NaN)) {
            updateStatus("Invalid data detected in 'Total Revenue'. Ensure all values are numeric.", "error");
            return;
        }

        updateStatus("Training the model...");
        await model.fit(tensorData, tensorLabels, {
            epochs: 10,
            shuffle: true
        });
        // Calculate average growth in revenue
        let growths = [];
        for (let i = 1; i < totalRevenue.length; i++) {
            growths.push((totalRevenue[i] - totalRevenue[i - 1]) / totalRevenue[i - 1]);
        }
        const avgGrowth = growths.reduce((acc, val) => acc + val, 0) / growths.length;

        const predictions = model.predict(tensorData).argMax(-1).dataSync();
        // Forecast future revenue based on historical data and average growth
        const forecastData = totalRevenue.map(revenue => revenue * (1 + avgGrowth));

        updateStatus("Visualizing the data...");

        // Visualizing the clusters
        const colors = predictions.map(pred => {
            if (pred === 0) return 'rgba(75, 192, 192, 0.2)'; // Low
            if (pred === 1) return 'rgba(255, 206, 86, 0.2)'; // Medium
            if (pred === 2) return 'rgba(255, 99, 132, 0.2)'; // High
        });

        const borderColors = predictions.map(pred => {
            if (pred === 0) return 'rgba(75, 192, 192, 1)';
            if (pred === 1) return 'rgba(255, 206, 86, 1)';
            if (pred === 2) return 'rgba(255, 99, 132, 1)';
        });
        const ctxForecast = document.getElementById('forecast').getContext('2d');
        const labels = Array.from({ length: totalRevenue.length }, (_, i) => `Event ${i + 1}`);

        const ctx = document.getElementById('visualization').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
        new Chart(ctxForecast, {
            type: 'line',
            data: {
                labels: data.map((_, index) => 'Event ' + (index + 1)),
                labels: labels,
                datasets: [{
                    label: 'Total Revenue ($)',
                    data: totalRevenues,
                    backgroundColor: colors,
                    borderColor: borderColors,
                    label: 'Historical Revenue ($)',
                    data: totalRevenue,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Forecasted Revenue ($)',
                    data: forecastData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
async function trainAndVisualize() {
                    }]
                }
            }
        }
    });

    // 3. Pie chart: Events per Venue
    const ctxPie = document.getElementById('pieChart').getContext('2d');
        });

    new Chart(ctxPie, {
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
        updateStatus("Visualization complete!", "success");
    } catch (error) {
        updateStatus("An error occurred: " + error.message, "error");
    }
}






// This function remains unchanged
function updateStatus(message, type = "info") {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
}

// New function to handle the button click
async function onClusterDataClick() {
    await processFile();
    trainAndVisualize();
}
