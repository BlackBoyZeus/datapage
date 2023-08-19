let data;

function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const contents = event.target.result;
        parseCSVData(contents);
    };

    reader.readAsText(file);
}

function parseCSVData(csvData) {
    data = d3.csvParse(csvData);
    visualizeData();
}

function visualizeData() {
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#visualization")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(data.map(function(d) { return d["Event Breakdown"]; }));
    y.domain([0, d3.max(data, function(d) { return +d["Total Revenue"].replace('M+', '') * 1e6 || 0; })]);

    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x))
       .selectAll("text")
       .attr("transform", "translate(-10,0)rotate(-45)")
       .style("text-anchor", "end");

    svg.append("g")
       .call(d3.axisLeft(y));

    svg.selectAll("bars")
       .data(data)
       .enter()
       .append("rect")
       .attr("x", function(d) { return x(d["Event Breakdown"]); })
       .attr("y", function(d) { return y(+d["Total Revenue"].replace('M+', '') * 1e6 || 0); })
       .attr("width", x.bandwidth())
       .attr("height", function(d) { return height - y(+d["Total Revenue"].replace('M+', '') * 1e6 || 0); })
       .attr("fill", "#69b3a2");
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
