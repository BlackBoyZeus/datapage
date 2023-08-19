
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
                label: 'Forecasted Earnings (in thousands)',
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

// GAN simulation results display function
function displayGanSimulationResults() {
    const ganData = Array.from({length: data.length}, () => Math.floor(Math.random() * 100));

    const ctx = document.getElementById('ganResults').getContext('2d');
    const labels = data.map(row => row.label);

    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'GAN Simulation Results',
                data: ganData
            }]
        }
    });
}
