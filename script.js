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

        setTimeout(() => {
            messageElement.style.opacity = "0";
            setTimeout(() => messageElement.remove(), 500);
        }, 5000);
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

                const processedData = processDataWithTensorFlow(results.data);
                visualizeAll(processedData);
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

    function visualizeAll(data) {
        createD3BubbleChart(data);
        createChartJSLineChart(data);
        displayDataWithAgGrid(data);
    }

    function createD3BubbleChart(data) {
        displayMessage("Generating D3.js bubble chart...");

        const width = 500;
        const height = 500;

        const svg = d3.select("#d3js-container").append("svg").attr("width", width).attr("height", height);

        const bubble = d3.pack(data)
            .size([width, height])
            .padding(1.5);

        const nodes = d3.hierarchy({children: data})
            .sum(d => d.value1);

        const bubbles = svg.selectAll(".bubble")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(d => !d.children)
            .append("g")
            .attr("class", "bubble")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        bubbles.append("circle")
            .attr("r", d => d.r)
            .style("fill", "#FF5733");

        bubbles.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(d => d.data.date);
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
});

