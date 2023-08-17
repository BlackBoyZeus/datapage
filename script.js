document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const messageContainer = document.getElementById("messageContainer");

    function displayMessage(message, isError = false) {
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        if (isError) {
            messageElement.style.color = "red";
        }
        messageContainer.appendChild(messageElement);
    }

    uploadButton.addEventListener("click", function() {
        const file = fileInput.files[0];
        if (!file) {
            displayMessage("Error: Please select a file first.", true);
            return;
        }

        Papa.parse(file, {
            complete: function(results) {
                if (results.errors.length > 0) {
                    displayMessage(`Error parsing CSV: ${results.errors[0].message}`, true);
                    return;
                }

                const data = results.data;
                const processedData = processDataWithTensorFlow(data);

                // Calculations and feedback
                calculateStatistics(processedData);

                // Visualization
                createD3BarChart(processedData);
                createChartJSLineChart(processedData);

                // Tabular data presentation
                displayDataWithAgGrid(processedData);
            },
            header: true,
            skipEmptyLines: true
        });
    });

    function processDataWithTensorFlow(data) {
        displayMessage("Processing data with TensorFlow.js...");
        const values1 = data.map(row => parseFloat(row.value1));
        const tensor1 = tf.tensor(values1);

        const normalizedTensor1 = tensor1.sub(tensor1.min()).div(tensor1.max().sub(tensor1.min()));
        const normalizedValues1 = normalizedTensor1.arraySync();

        return data.map((row, index) => ({
            ...row,
            normalizedValue1: normalizedValues1[index]
        }));
    }

    function createD3BarChart(data) {
        displayMessage("Generating D3.js bar chart...");
        const svg = d3.select("#d3js-container").append("svg").attr("width", 500).attr("height", 500);
        svg.selectAll("rect")
           .data(data)
           .enter().append("rect")
           .attr("x", (d, i) => i * 45)
           .attr("y", d => 500 - d.value1 * 10)
           .attr("width", 40)
           .attr("height", d => d.value1 * 10)
           .attr("fill", "#FF5733");
    }

    function createChartJSLineChart(data) {
        displayMessage("Generating Chart.js line chart...");
        const ctx = document.getElementById("chartjs-container").getContext("2d");
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(row => row.date),
                datasets: [{
                    label: 'Value 1',
                    data: data.map(row => row.value1),
                    borderColor: "#FF5733",
                    fill: false
                }]
            }
        });
    }

    function displayDataWithAgGrid(data) {
        displayMessage("Displaying data using Ag-Grid...");
        const gridOptions = {
            columnDefs: Object.keys(data[0]).map(key => ({headerName: key, field: key})),
            rowData: data
        };
        
        const gridDiv = document.querySelector("#ag-grid-container");
        new agGrid.Grid(gridDiv, gridOptions);
    }

    function calculateStatistics(data) {
        const meanValue1 = math.mean(data.map(row => parseFloat(row.value1)));
        const stdDevValue1 = simpleStats.standardDeviation(data.map(row => parseFloat(row.value1)));
        const correlation = simpleStats.sampleCorrelation(data.map(row => parseFloat(row.value1)), data.map(row => parseFloat(row.value2)));

        displayMessage(`Mean of value1: ${meanValue1}`);
        displayMessage(`Standard Deviation of value1: ${stdDevValue1}`);
        displayMessage(`Correlation between value1 and value2: ${correlation}`);
    }
});
