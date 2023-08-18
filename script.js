let data;

async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
@@ -20,12 +23,15 @@ async function processFile() {

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
@@ -130,7 +136,15 @@ function displayPieChart() {
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
@@ -159,10 +173,6 @@ document.getElementById('visualization').onmouseout = function() {
        .style("opacity", 0);
};





async function trainAndVisualize() {
    try {
        updateStatus("Initializing...");
        // Extracting and cleaning 'Total Revenue' data
        const totalRevenue = data.map(row => {
            let revenue = row['Total Revenue'];
            if (!revenue) return 0;
            if (revenue.includes('M+')) return parseFloat(revenue.replace('M+', '').replace('$', '')) * 1000000;
            return parseFloat(revenue.replace('$', '').replace(',', '')) || 0;
        });
        // Check for NaN values in the extracted data
        if (totalRevenue.includes(NaN)) {
            updateStatus("Invalid data detected in 'Total Revenue'. Ensure all values are numeric.", "error");
            return;
        }
        // Calculate average growth in revenue
        let growths = [];
        for (let i = 1; i < totalRevenue.length; i++) {
            growths.push((totalRevenue[i] - totalRevenue[i - 1]) / totalRevenue[i - 1]);
        }
        const avgGrowth = growths.reduce((acc, val) => acc + val, 0) / growths.length;
        // Forecast future revenue based on historical data and average growth
        const forecastData = totalRevenue.map(revenue => revenue * (1 + avgGrowth));
        updateStatus("Visualizing the data...");
        const ctxForecast = document.getElementById('forecast').getContext('2d');
        const labels = Array.from({ length: totalRevenue.length }, (_, i) => `Event ${i + 1}`);
        new Chart(ctxForecast, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
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
