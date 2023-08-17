// Global variables
let data;

function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        console.error("No file selected");
        return;
    }

    // Read the file
    const reader = new FileReader();
    reader.onload = function(event) {
        const fileContent = event.target.result;

        // Convert the CSV content to JSON
        data = csvToJSON(fileContent);
        if (!data) {
            console.error("Error processing the CSV file.");
            return;
        }

        // Visualize the data
        displayData();
    };
    reader.onerror = function() {
        console.error("Error reading the file.");
    };
    reader.readAsText(file);
}

function csvToJSON(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length <= 1) return null;  // No data rows available

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

function displayData() {
    const labels = data.map(row => row['Sponsors'] || 'Unknown');
    const values = data.map(row => {
        const value = (row['Event Breakdown'] || '').replace(/,/g, '');
        return isNaN(parseInt(value)) ? 0 : parseInt(value);
    });

    const ctx = document.getElementById('visualization').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Event Breakdown ($)',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// D3.js Tooltip for extra information on hover
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

document.getElementById('visualization').onmousemove = function(event) {
    const index = Math.floor(event.offsetX / 100);  // Assuming each bar has a width of 100px
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
