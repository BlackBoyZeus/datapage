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

// Function to visualize the uploaded data using a bar chart
function visualizeData() {
    const ctx = document.getElementById('visualization').getContext('2d');

    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Data',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to run earnings forecast simulation and visualize it
function earnings_forecast_simulation_millions() {
    const ctx = document.getElementById('metrics').getContext('2d');

    // Generate random forecasted earnings for simplicity
    const labels = [...Array(12).keys()].map(d => `Month ${d+1}`);
    const values = labels.map(() => Math.random() * 1000); // Random earnings in millions

    new Chart(ctx, {
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
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

