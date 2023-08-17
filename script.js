function readFile(input) {
    let file = input.files[0];
    d3.csv(file).then(data => {
        // Handle the data here
        preprocessData(data);
    });
}

function preprocessData(data) {
    // Convert data to an array of arrays suitable for TensorFlow.js
    let tensorData = data.map(d => [parseFloat(d.x), parseFloat(d.y)]); // Assuming columns are 'x' and 'y'
    startClustering(tensorData);
}

function startClustering(tensorData) {
    let clusters = kMeans(tensorData, 3); // Let's assume 3 clusters for now
    visualizeData(clusters);
}

function visualizeData(clusters) {
    let ctx = document.getElementById('visualization').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: clusters.map((cluster, idx) => {
                return {
                    label: 'Cluster ' + idx,
                    data: cluster,
                    borderColor: getRandomColor(),
                    backgroundColor: 'transparent'
                };
            })
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
}
