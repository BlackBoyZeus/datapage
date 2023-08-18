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
        
        if (!fileContent || fileContent.trim().length === 0) {
            updateStatus("File is empty or unreadable.", "error");
            return;
        }

        updateStatus("Determining file type...");
        let data;
        if (file.name.endsWith('.csv')) {
            updateStatus("Processing CSV...");
            data = csvToJSON(fileContent);
        } else if (file.name.endsWith('.json')) {
            updateStatus("Processing JSON...");
            data = JSON.parse(fileContent);
        } else {
            updateStatus("Unsupported file type.", "error");
            return;
        }

        if (!data || data.length === 0) {
            updateStatus("Error processing the file.", "error");
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
    const delimiter = detectDelimiter(lines[0]); // Improved handling for different delimiters
    const headers = lines[0].split(delimiter).map(field => field.trim().replace(/^"|"$/g, ''));

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(delimiter).map(field => field.trim().replace(/^"|"$/g, ''));
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        result.push(obj);
    }
    return result;
}

function detectDelimiter(line) {
    const delimiters = [',', ';', '\t'];
    for (let delimiter of delimiters) {
        if (line.includes(delimiter)) {
            return delimiter;
        }
    }
    return ','; // default to comma if no known delimiter is found
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
