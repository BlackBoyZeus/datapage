// Global variable to store the processed data.
let data;

/**
 * Main function to process the uploaded file.
 */
async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    // Check if a file was uploaded.
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
        await displayData();  // Ensure the visualization completes before updating status
        updateStatus("Visualization complete!", "success");
    } catch (error) {
        updateStatus("An error occurred: " + error.message, "error");
    }
}

/**
 * Reads the content of a file.
 * @param {File} file - The file to be read.
 * @returns {Promise} - A promise that resolves with the file content.
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * Updates the status display on the web page.
 * @param {string} message - The message to display.
 * @param {string} [type="info"] - The type of message (info, error, success).
 */
function updateStatus(message, type = "info") {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
}

/**
 * Converts a CSV string to a JSON object.
 * @param {string} csv - The CSV string.
 * @returns {Array} - The converted JSON data.
 */
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

/**
 * Visualizes the processed data using Chart.js and TensorFlow.js.
 * @returns {Promise} - A promise that resolves when the visualization is complete.
 */
function displayData() {
    return new Promise((resolve) => {
        const labels = data.map(row => row['Sponsors'] || 'Unknown');
        const values = data.map(row => {
            const value = (row['Event Breakdown'] || '').replace(/,/g, '');
            return isNaN(parseInt(value)) ? 0 : parseInt(value);
        });

        // TensorFlow.js operations for computing mean and standard deviation.
        const tfValues = tf.tensor(values);
        const moments = tf.moments(tfValues);
        const meanValue = moments.mean.dataSync()[0];
        const stdValue = Math.sqrt(moments.variance.dataSync()[0]);
        const upperBound = meanValue + stdValue;
        const lowerBound = meanValue - stdValue;

        const ctx = document.getElementById('visualization').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Event Breakdown ($)',
                        data: values,
                        backgroundColor: values.map(value => (value > upperBound || value < lowerBound) ? 'rgba(255, 99, 132, 0.5)' : 'rgba(75, 192, 192, 0.2)'),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Average Event Breakdown ($)',
                        data: Array(values.length).fill(meanValue),
                        type: 'line',
                        fill: '-1',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 2,
                        pointRadius: 0
                    },
                    {
                        label: 'Std Deviation',
                        data: Array(values.length).fill(upperBound),
                        type: 'line',
                        fill: false,
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        pointRadius: 0
                    },
                    {
                        data: Array(values.length).fill(lowerBound),
                        type: 'line',
                        fill: false,
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
            onComplete: () => {
                resolve();
            }
        });
    });
}

// D3.js Tooltip for extra information on hover.
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
