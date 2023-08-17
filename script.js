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
                createD3BarChart(data, 'Event Breakdown', 'd3js-container');
                createD3BarChart(data, 'Gate', 'd3js-container');
                createD3BarChart(data, 'PPV', 'd3js-container');
                listUniqueValues(data, 'Sponsors', 'd3js-container');
            },
            header: true,
            skipEmptyLines: true
        });
    });

    function createD3BarChart(data, column, containerId) {
        const svg = d3.select(`#${containerId}`).append("svg").attr("width", 500).attr("height", 500);
        svg.selectAll("rect")
           .data(data)
           .enter().append("rect")
           .attr("x", (d, i) => i * 45)
           .attr("y", d => 500 - d[column] * 10)
           .attr("width", 40)
           .attr("height", d => d[column] * 10)
           .attr("fill", "#FF5733");
    }

    function listUniqueValues(data, column, containerId) {
        const uniqueValues = [...new Set(data.map(row => row[column]))];
        const container = d3.select(`#${containerId}`);
        uniqueValues.forEach(value => {
            container.append("p").text(value);
        });
    }
});


