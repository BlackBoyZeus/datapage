let data = [];

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

        cleanData();
        visualizeData();
    } catch (error) {
        updateStatus("An error occurred: " + error.message, "error");
    }
}

function cleanData() {
    data.forEach(row => {
        row['Brand Sponsorship fee'] = convertToNumeric(extractNumeric(row['Brand Sponsorship fee']));
        row['PPV'] = convertToNumeric(extractNumeric(row['PPV']));
        row['Total Revenue'] = convertToNumeric(extractNumeric(row['Total Revenue']));
    });
}

function extractNumeric(value) {
    if (!value) return;
    const numbers = value.match(/(\d+(\.\d+)?)/g);
    if (!numbers) return;
    const avg = numbers.reduce((acc, val) => acc + parseFloat(val), 0) / numbers.length;
    return avg;
}

function convertToNumeric(value) {
    if (!value) return;
    if (value.includes("K")) {
        return parseFloat(value.replace("K", "")) * 1e3;
    } else if (value.includes("M")) {
        return parseFloat(value.replace("M", "")) * 1e6;
    } else {
        return parseFloat(value);
    }
}

function visualizeData() {
    updateStatus("Visualizing data...");
    
    // Display Bar Chart for Venue vs Revenue
    displayVenueRevenueBarChart();

    // Scatter plots for relationships
    displayPPVRevenueScatterPlot();
    displaySponsorshipRevenueScatterPlot();

    updateStatus("Visualization complete!", "success");
}

function displayVenueRevenueBarChart() {
    const venues = [...new Set(data.map(row => row['Venue']))];
    const venueRevenue = {};

    venues.forEach(venue => {
        const revenues = data.filter(row => row['Venue'] === venue).map(row => row['Total Revenue']);
        const avgRevenue = revenues.reduce((acc, val) => acc + (val || 0), 0) / revenues.length;
        venueRevenue[venue] = avgRevenue;
    });

    // Logic to display bar chart using Chart.js
    const ctx = document.getElementById('visualization').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(venueRevenue),
            datasets: [{
                label: 'Average Revenue by Venue',
                data: Object.values(venueRevenue),
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
            }
        }
    });
}

function displayPPVRevenueScatterPlot() {
    const ctxMetrics = document.getElementById('metrics').getContext('2d');
    new Chart(ctxMetrics, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'PPV vs Total Revenue',
                data: data.map(row => ({ x: row['PPV'], y: row['Total Revenue'] })),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
}

function displaySponsorshipRevenueScatterPlot() {
    const ctxAggregate = document.getElementById('aggregateMetrics').getContext('2d');
    new Chart(ctxAggregate, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Sponsorship Fee vs Total Revenue',
                data: data.map(row => ({ x: row['Brand Sponsorship fee'], y: row['Total Revenue'] })),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
}

// ... [Rest of the functions you provided]
