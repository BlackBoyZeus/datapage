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
            displayData();
        }

        function filterData(columnName, condition) {
            return data.filter(row => condition(row[columnName]));
        }

        function groupBy(columnName) {
            return d3.nest()
                .key(d => d[columnName])
                .entries(data);
        }

        function aggregateData(columnName, aggFunc) {
            const groupedData = groupBy(columnName);
            return groupedData.map(group => {
                return {
                    key: group.key,
                    value: aggFunc(group.values)
                };
            });
        }

        function displayData() {
            const ctx = document.getElementById('visualization');

            const margin = {top: 20, right: 20, bottom: 30, left: 40};
            const width = 500 - margin.left - margin.right; // Example width
            const height = 500 - margin.top - margin.bottom; // Example height

            const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
            const y = d3.scaleLinear().rangeRound([height, 0]);

            const svg = d3.select(ctx)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x.domain(data.map(d => d.label));
            y.domain([0, d3.max(data, d => d.value)]);

            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Value");

            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.label))
                .attr("y", d => y(d.value))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.value));
        }

        function displayFilteredData() {
            const filtered = filterData("value", val => val > 10);
            data = filtered;
            displayData();
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
