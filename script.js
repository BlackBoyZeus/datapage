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
    // Validate and parse data
    let validData = true;
    const totalRevenue = data.reduce((acc, row) => {
        const revenue = parseFloat(row['Total Revenue'] || 0);
        if (isNaN(revenue)) {
            validData = false;
            console.error("Invalid data in 'Total Revenue':", row);
        }
        return acc + revenue;
    }, 0);
    
    const averageEventBreakdown = data.reduce((acc, row) => {
        const breakdown = parseFloat(row['Event Breakdown'] || 0);
        if (isNaN(breakdown)) {
            validData = false;
            console.error("Invalid data in 'Event Breakdown':", row);
        }
        return acc + breakdown;
    }, 0) / data.length;

    if (validData) {
        document.getElementById('aggregateMetrics').innerHTML = `
            <strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}<br>
            <strong>Average Event Breakdown:</strong> $${averageEventBreakdown.toFixed(2)}
        `;
    } else {
        document.getElementById('aggregateMetrics').innerHTML = `
            <strong>Error:</strong> Invalid data detected. Check the console for more details.
        `;
    }
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

function trainAndVisualize() {
    // Extract numeric values from 'Total Revenue' and calculate average growth rate
    const totalRevenues = data.map(row => parseFloat(row['Total Revenue'].replace(/,/g, '').replace(/M\+/g, '000000') || 0));
    
    let growths = [];
    for (let i = 1; i < totalRevenues.length; i++) {
        if (totalRevenues[i - 1] !== 0) {
            growths.push((totalRevenues[i] - totalRevenues[i - 1]) / totalRevenues[i - 1]);
        }
    }
    const avgGrowth = growths.reduce((acc, val) => acc + val, 0) / growths.length;

    // Forecast future revenue based on historical data and average growth
    const forecastData = totalRevenues.map(revenue => revenue * (1 + avgGrowth));

    const ctxForecast = document.getElementById('forecast').getContext('2d');
    const labels = Array.from({ length: totalRevenues.length }, (_, i) => `Event ${i + 1}`);

    new Chart(ctxForecast, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Historical Revenue ($)',
                data: totalRevenues,
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
}
