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
                const processedData = processDataWithTensorFlow(data);

                // Further visualizations and processing here...

            },
            header: true,
            skipEmptyLines: true
        });
    });

    function processDataWithTensorFlow(data) {
        displayMessage("Processing data with TensorFlow.js...");

        // Assuming data has columns 'value1', 'value2'
        const values1 = data.map(row => parseFloat(row.value1));
        const values2 = data.map(row => parseFloat(row.value2));

        const tensor1 = tf.tensor(values1);
        const tensor2 = tf.tensor(values2);

        // Example: Normalize tensors
        const normalizedTensor1 = tensor1.sub(tensor1.min()).div(tensor1.max().sub(tensor1.min()));
        const normalizedTensor2 = tensor2.sub(tensor2.min()).div(tensor2.max().sub(tensor2.min()));

        // Convert tensors back to arrays
        const normalizedValues1 = normalizedTensor1.arraySync();
        const normalizedValues2 = normalizedTensor2.arraySync();

        // Return processed data
        return data.map((row, index) => ({
            ...row,
            normalizedValue1: normalizedValues1[index],
            normalizedValue2: normalizedValues2[index]
        }));
    }


                          // D3.js Visualization: Bar Chart
function createD3BarChart(data) {
    displayMessage("Generating D3.js bar chart...");

    const svg = d3.select("#d3js-container").append("svg").attr("width", 500).attr("height", 500);
    
    // Assuming 'value1' is the column to visualize
    svg.selectAll("rect")
       .data(data)
       .enter().append("rect")
       .attr("x", (d, i) => i * 45)
       .attr("y", d => 500 - d.value1 * 10)
       .attr("width", 40)
       .attr("height", d => d.value1 * 10)
       .attr("fill", "#FF5733");
}

// Chart.js Visualization: Line Chart
function createChartJSLineChart(data) {
    displayMessage("Generating Chart.js line chart...");

    const ctx = document.getElementById("chartjs-container").getContext("2d");
    new Chart(ctx, {
        type: 'line',
        data: {
            // Assuming 'date' is a column in your data
            labels: data.map(row => row.date),
            datasets: [{
                label: 'Value 1',
                // Assuming 'value1' is the column to visualize
                data: data.map(row => row.value1),
                borderColor: "#FF5733",
                fill: false
            }]
        }
    });
}

// Ag-Grid: Data Presentation in Table Format
function displayDataWithAgGrid(data) {
    displayMessage("Displaying data using Ag-Grid...");

    const gridOptions = {
        columnDefs: Object.keys(data[0]).map(key => ({headerName: key, field: key})),
        rowData: data
    };
    
    const gridDiv = document.querySelector("#ag-grid-container");
    new agGrid.Grid(gridDiv, gridOptions);
}

// Lodash: Data Manipulation (e.g., Filter)
function filterDataWithLodash(data) {
    displayMessage("Filtering data using Lodash...");
    
    // Placeholder: Filter out rows where 'value1' is below a threshold
    return _.filter(data, row => row.value1 > 50);
}

// Date-fns: Formatting Dates
function formatDatesWithDataFns(data) {
    displayMessage("Formatting dates using Date-fns...");

    // Placeholder: Format the date from 'YYYY-MM-DD' to 'MMMM dd, yyyy'
    return data.map(row => {
        row.date = dateFns.format(new Date(row.date), 'MMMM dd, yyyy');
        return row;
    });
}

// Math.js: Calculating Mean of 'value1'
function calculateMeanWithValue(data) {
    displayMessage("Calculating mean of 'value1' using Math.js...");

    const values = data.map(row => parseFloat(row.value1));
    return math.mean(values);
}

// Simple-statistics: Calculate Correlation Coefficient
function calculateCorrelationCoefficient(data) {
    displayMessage("Computing correlation coefficient using Simple-statistics...");

    const xValues = data.map(row => parseFloat(row.value1));
    const yValues = data.map(row => parseFloat(row.value2));

    return simpleStats.sampleCorrelation(xValues, yValues);
}
