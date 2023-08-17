let currentData = []; // This will hold the data from the CSV

// Read the uploaded CSV
function readFile(input) {
    console.log("Reading file...");
    let file = input.files[0];
    d3.csv(file).then(data => {
        console.log("File read successfully.");
        preprocessData(data);
    });
}

// Convert the data into a format suitable for clustering
function preprocessData(data) {
    console.log("Preprocessing data...");
    currentData = data.map(d => [parseFloat(d.x), parseFloat(d.y)]); 
    console.log("Data preprocessed.");
}

// Start clustering and visualization
function startClustering() {
    console.log("Starting clustering...");
    let clusters = kMeans(currentData, 3); 
    console.log("Clustering completed.");
    visualizeData(clusters);
}

// K-means clustering
function kMeans(data, k = 3) {
    // Initialize k centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(data[Math.floor(Math.random() * data.length)]);
    }

    let previousCentroids;
    let iterations = 0;
    while (!isEqual(centroids, previousCentroids) && iterations < 10) {
        iterations++;
        console.log(`Iteration ${iterations}...`);

        // Assign each data point to the nearest centroid
        let clusters = assignDataToCentroids(data, centroids);

        // Recalculate centroids
        previousCentroids = centroids.slice();
        centroids = recalculateCentroids(clusters);
    }

    return clusters;
}

function assignDataToCentroids(data, centroids) {
    return data.reduce((clusters, point) => {
        let closestCentroidIdx = centroids.map(centroid => 
            euclideanDistance(point, centroid)).indexOf(Math.min(...centroids.map(centroid => 
                euclideanDistance(point, centroid))));
        clusters[closestCentroidIdx].push(point);
        return clusters;
    }, Array.from({ length: centroids.length }, () => []));
}

function recalculateCentroids(clusters) {
    return clusters.map(cluster => {
        let sumX = 0, sumY = 0;
        cluster.forEach(point => {
            sumX += point[0];
            sumY += point[1];
        });
        return [sumX / cluster.length, sumY / cluster.length];
    });
}

// Euclidean distance between two points
function euclideanDistance(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
}

// Check if two sets of points are equal
function isEqual(pointsA, pointsB) {
    if (!pointsA || !pointsB) return false;
    if (pointsA.length !== pointsB.length) return false;
    for (let i = 0; i < pointsA.length; i++) {
        if (pointsA[i][0] !== pointsB[i][0] || pointsA[i][1] !== pointsB[i][1]) return false;
    }
    return true;
}

// Visualize the data using Chart.js
function visualizeData(clusters) {
    console.log("Visualizing data...");
    let ctx = document.getElementById('visualization').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: clusters.map((cluster, idx) => {
                return {
                    label: 'Cluster ' + idx,
                    data: cluster.map(point => ({ x: point[0], y: point[1] })),
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
    console.log("Visualization completed.");
}

// Get a random color
function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
