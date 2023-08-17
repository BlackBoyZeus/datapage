document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const messageContainer = document.createElement("div");
    document.body.appendChild(messageContainer);

    function displayMessage(message, isError = false) {
        console.log(message);
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
                displayMessage("File successfully parsed. Initiating data processing...");

                try {
                    processDataWithTensorFlow(data);
                    visualizeWithD3(data);
                    visualizeWithChartJS(data);
                    displayWithAgGrid(data);
                    filterDataUsingLodash(data);
                    formatDateUsingDateFns(data);
                    calculateMeanUsingMathJs(data);
                    calculateCorrelationCoefficient(data, "someXColumnName", "someYColumnName");
                } catch (error) {
                    displayMessage(`Error processing data: ${error.message}`, true);
                }
            },
            header: true,
            skipEmptyLines: true
        });
    });

    function processDataWithTensorFlow(data) {
        displayMessage("Processing data with TensorFlow.js...");
        // Placeholder: Assume numeric data and normalize it
        const tensor = tf.tensor(data.map(row => parseFloat(row["someColumnName"])));
        const normalizedTensor = tf.div(tf.sub(tensor, tf.min(tensor)), tf.sub(tf.max(tensor), tf.min(tensor)));
        const normalizedData = normalizedTensor.dataSync();
        data.forEach((row, index) => {
            row["normalizedColumnName"] = normalizedData[index];
        });
    }

    function visualizeWithD3(data) {
        displayMessage("Generating D3.js visualization...");
        // Placeholder: Simple bar chart with D3.js
        const svg = d3.select("#d3js-container").append("svg").attr("width", 500).attr("height", 500);
        svg.selectAll("rect")
           .data(data)
           .enter().append("rect")
           .attr("x", (d, i) => i * 45)
           .attr("y", d => 500 - d.someColumnName * 10)
           .attr("width", 40)
           .attr("height", d => d.someColumnName * 10)
           .attr("fill", "#FF5733");
    }

    function visualizeWithChartJS(data) {
        displayMessage("Generating Chart.js visualization...");
        // Placeholder: Line chart with Chart.js
        const ctx = document.getElementById("chartjs-container").getContext("2d");
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(row => row["dateColumnName"]),
                datasets: [{
                    label: 'Some Data Label',
                    data: data.map(row => row["someColumnName"]),
                    borderColor: "#FF5733",
                    fill: false
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'series'
                    }]
                }
            }
        });
    }

    function displayWithAgGrid(data) {
        displayMessage("Presenting data using Ag-Grid...");
        const gridOptions = {
            columnDefs: Object.keys(data[0]).map(key => ({headerName: key, field: key})),
            rowData: data,
            domLayout: 'autoHeight',
        };
        const gridDiv = document.querySelector("#ag-grid-container");
        new agGrid.Grid(gridDiv, gridOptions);
    }

    function filterDataUsingLodash(data) {
        displayMessage("Filtering data using Lodash...");
        return _.filter(data, row => parseFloat(row.someColumnName) > 50);
    }

    function formatDateUsingDateFns(data) {
        displayMessage("Formatting dates using Date-fns...");
        data.forEach(row => {
            row.dateColumnName = dateFns.format(new Date(row.dateColumnName), 'MMMM dd, yyyy');
        });
    }

    function calculateMeanUsingMathJs(data) {
        displayMessage("Calculating mean using Math.js...");
        const values = data.map(row => parseFloat(row.someColumnName));
        return math.mean(values);
    }

    function calculateCorrelationCoefficient(data, xColumn, yColumn) {
        displayMessage("Computing correlation coefficient using Simple-statistics...");
        const xValues = data.map(row => parseFloat(row[xColumn]));
        const yValues = data.map(row => parseFloat(row[yColumn]));
        return simpleStats.sampleCorrelation(xValues, yValues);
    }
});
