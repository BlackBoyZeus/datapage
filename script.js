document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const messageContainer = document.getElementById("messageContainer");

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
                const processedData = processDataWithTensorFlow(data);

                // Triggering visualizations and processing
                createD3BarChart(processedData);
                createChartJSLineChart(processedData);
                displayDataWithAgGrid(processedData);
                const filteredData = filterDataWithLodash(processedData);
                const dateFormattedData = formatDatesWithDataFns(filteredData);
                const meanValue = calculateMeanWithValue(dateFormattedData);
                const correlationCoefficient = calculateCorrelationCoefficient(dateFormattedData);

                displayMessage(`Mean of value1: ${meanValue}`);
                displayMessage(`Correlation Coefficient between value1 and value2: ${correlationCoefficient}`);
            },
            header: true,
            skipEmptyLines: true
        });
    });

    function processDataWithTensorFlow(data) {
        displayMessage("Processing data with TensorFlow.js...");

        const values1 = data.map(row => parseFloat(row.value1));
        const values2 = data.map(row => parseFloat(row.value2));

        const tensor1 = tf.tensor(values1);
        const tensor2 = tf.tensor(values2);

        const normalizedTensor1 = tensor1.sub(tensor1.min()).div(tensor1.max().sub(tensor1.min()));
        const normalizedTensor2 = tensor2.sub(tensor2.min()).div(tensor2.max().sub(tensor2.min()));

        const normalizedValues1 = normalizedTensor1.arraySync();
        const normalizedValues2 = normalizedTensor2.arraySync();

        return data.map((row, index) => ({
            ...row,
            normalizedValue1: normalizedValues1[index],
            normalizedValue2: normalizedValues2[index]
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

    function filterDataWithLodash(data) {
        displayMessage("Filtering data using Lodash...");
        return _.filter(data, row => row.value1 > 50);
    }

    function formatDatesWithDataFns(data) {
        displayMessage("Formatting dates using Date-fns...");
        return data.map(row => {
            row.date = dateFns.format(new Date(row.date), 'MMMM dd, yyyy');
            return row;
        });
    }

    function calculateMeanWithValue(data) {
        displayMessage("Calculating mean of 'value1' using Math.js...");
        const values = data.map(row => parseFloat(row.value1));
        return math.mean(values);
    }

    function calculateCorrelationCoefficient(data) {
        displayMessage("Computing correlation coefficient using Simple-statistics...");
        const xValues = data.map(row => parseFloat(row.value1));
        const yValues = data.map(row => parseFloat(row.value2));
        return simpleStats.sampleCorrelation(xValues, yValues);
    }
});

