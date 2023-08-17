let df; // global variable to store the pandas-js dataframe

// Event listener for file input
document.getElementById('fileInput').addEventListener('change', previewData);

function previewData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = e.target.result;
        df = pd.read_csv(data);
        
        // Display first few rows of the data
        document.getElementById('visualization').innerText = df.head().to_string();
    };

    reader.readAsText(file);
}

async function startClustering() {
    if (!df) {
        alert("Please upload a file first!");
        return;
    }

    const features = df[['feature1', 'feature2']]; // Adjust based on your dataset's columns
    const tensorData = tf.tensor2d(features.values);

    // Here, we'd perform k-means clustering. 
    // However, as of my last update, TensorFlow.js does not have a direct k-means function.
    // So, you'd either use a library like KMeansJS or implement k-means yourself.
    // For simplicity, let's assume we've done clustering and have cluster labels for each data point.
    const clusters = mockCluster(tensorData); // Placeholder function

    visualizeClusters(tensorData.arraySync(), clusters);
}

function mockCluster(data) {
    // Placeholder function that just returns random cluster labels
    return Array(data.length).fill().map(() => Math.floor(Math.random() * 3)); // 3 clusters as an example
}

function visualizeClusters(data, clusters) {
    // Clear previous visualizations
    const container = document.getElementById('visualization');
    container.innerHTML = '';

    const width = 500;
    const height = 500;

    // Create SVG container
    const svg = d3.select('#visualization').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create scales for x and y axes
    const xScale = d3.scaleLinear().domain([0, d3.max(data, d => d[0])]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d[1])]).range([height, 0]);

    // Create circles for each data point
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 5)
        .attr('fill', (d, i) => ["red", "green", "blue"][clusters[i]]);
}

document.getElementById('startAnalysisButton').addEventListener('click', startClustering);
