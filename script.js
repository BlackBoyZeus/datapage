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
    const result = [];
    const rows = csv.trim().split('\n');
    
    // Extract headers from the first row
    const headers = rows[0].split(',').map(header => header.trim());

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const values = [];
        
        // Use regex to split by commas not within double quotes
        const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
        const splitValues = row.split(regex);
        
        splitValues.forEach(value => {
            // Remove double quotes and trim spaces
            values.push(value.replace(/^"|"$/g, '').trim());
        });
        
        if (values.length !== headers.length) {
            // Skip rows with inconsistent number of values
            continue;
        }
        
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            const value = values[j];
            obj[headers[j]] = headers[j] === 'Event Breakdown' || headers[j] === 'Total Revenue' 
                              ? parseFloat(value.replace(/,/g, '')) 
                              : value;
        }
        
        // Only add rows where key columns have values
        if (obj['Sponsors'] && obj['Event Breakdown'] && obj['Venue']) {
            result.push(obj);
        }
    }
    return result;
}


function displayBarChart() {
    const ctx = document.getElementById('visualization').getContext('2d');
    const labels = data.map(row => row['Sponsors']);
    const values = data.map(row => row['Event Breakdown']);
    
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
    const totalRevenue = data.reduce((acc, row) => {
        // Ensure the 'Total Revenue' value is a string before using replace
        const revenueValue = parseFloat((String(row['Total Revenue']) || "0").replace(/,/g, ''));
        return acc + revenueValue;
    }, 0);
    
    const averageEventBreakdown = data.reduce((acc, row) => {
        // Ensure the 'Event Breakdown' value is a string before using replace
        const eventBreakdownValue = parseFloat((String(row['Event Breakdown']) || "0").replace(/,/g, ''));
        return acc + eventBreakdownValue;
    }, 0) / data.length;
    
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
            Total Revenue: $${(data[index]['Total Revenue'] || 0).toLocaleString()}
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
