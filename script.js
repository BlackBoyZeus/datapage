// Global variable to store the data from the uploaded CSV
let data = [];

// Function to process the uploaded file and visualize it
function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const csv = event.target.result;
        d3.csvParse(csv, function(d) {
            // Assuming the CSV has columns 'label' and 'value' for simplicity
            return {
                label: d.label,
                value: +d.value // Convert the value to a number
            };
        }).then(function(parsedData) {
            data = parsedData;
            visualizeData();
        });
    };

    reader.readAsText(file);
}

// Function to visualize the uploaded data using a dynamic line chart
function visualizeData() {
    const ctx = document.getElementById('visualization').getContext('2d');

    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Data',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            animation: {
                duration: 2000,
                easing: 'easeInOutQuad'
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Animate the chart data in
    setTimeout(() => {
        chart.update();
    }, 500);
}

// Function to run earnings forecast simulation and visualize it with random spikes
function earnings_forecast_simulation_millions() {
    const ctx = document.getElementById('metrics').getContext('2d');

    // Generate random forecasted earnings with spikes for dramatic effect
    const labels = [...Array(12).keys()].map(d => `Month ${d+1}`);
    const baseValue = Math.random() * 500;
    const values = labels.map(() => baseValue + (Math.random() - 0.5) * 200); // Random earnings in millions with spikes

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Forecasted Earnings (in millions)',
                data: values,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            animation: {
                duration: 2000,
                easing: 'easeInOutQuad'
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Animate the forecast data in
    setTimeout(() => {
        chart.update();
    }, 500);
}
