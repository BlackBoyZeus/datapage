dodocument.getElementById('fileInput').addEventListener('change', function(event) {
    console.log("File input change detected");  // Debugging log
    
    const file = event.target.files[0];
    if (!file) {
        console.error("No file selected");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = e.target.result;
        console.log("File read successfully");  // Debugging log

        try {
            df = new pd.DataFrame(data);
            console.log("DataFrame created successfully:", df);  // Debugging log
        } catch (error) {
            console.error("Error creating DataFrame:", error);
        }
        
        // Optionally, you can start the initial analysis immediately after file upload
        // analyzeData();
    }

    reader.onerror = function(error) {
        console.error("Error reading file:", error);
    }

    reader.readAsText(file);
});


document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = e.target.result;

        try {
            df = new pd.DataFrame(data);
            console.log("DataFrame created successfully:", df);  // Debugging log
        } catch (error) {
            console.error("Error creating DataFrame:", error);
        }
        
        // Optionally, you can start the initial analysis immediately after file upload
        // analyzeData();
    }

    reader.onerror = function(error) {
        console.error("Error reading file:", error);
    }

    reader.readAsText(file);
});

function analyzeData() {
    preprocessData();
    visualizeData();

    // Send data to worker for heavy computations
    worker.postMessage({
        type: 'startAnalysis',
        data: df // Note: In a real-world scenario, you'd need to serialize the DataFrame or send raw data
    });
}

function preprocessData() {
    // Convert 'Event Breakdown' to integers
    df['Event Breakdown'] = df['Event Breakdown'].str.replace(',', '').astype('int');

    // Handle missing values, for example by filling with defaults or removing rows
    df = df.dropna();
}

function visualizeData() {
    // Use D3.js to create initial visualizations
    const svg = d3.select("#visualization");
    const x = d3.scaleBand().domain(df['Event Breakdown']).range([0, 500]);
    const y = d3.scaleLinear().domain([0, d3.max(df['Total Revenue'])]).range([500, 0]);

    svg.selectAll('rect')
       .data(df)
       .enter().append('rect')
       .attr('x', d => x(d['Event Breakdown']))
       .attr('y', d => y(d['Total Revenue']))
       .attr('width', x.bandwidth())
       .attr('height', d => 500 - y(d['Total Revenue']));
}

function updateRevenuePredictionVisualization(data) {
    const svg = d3.select("#visualization");
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    // Combine historical and predicted data
    const combinedData = df.concat(data);

    const x = d3.scaleBand()
                .domain(combinedData.map(d => d['Event Breakdown']))
                .range([margin.left, width - margin.right])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(combinedData, d => d['Total Revenue'])])
                .range([height - margin.bottom, margin.top]);

    // Clear previous visualizations
    svg.selectAll("*").remove();

    // Create bars
    svg.selectAll('rect')
       .data(combinedData)
       .enter()
       .append('rect')
       .attr('x', d => x(d['Event Breakdown']))
       .attr('y', d => y(d['Total Revenue']))
       .attr('width', x.bandwidth())
       .attr('height', d => height - margin.bottom - y(d['Total Revenue']))
       .attr('fill', d => 'predicted' in d ? 'orange' : 'blue') // Color predicted bars differently
       .on('mouseover', function(d) {
           // Display revenue details on hover
           const tooltip = svg.append('text')
                              .text(`Event: ${d['Event Breakdown']}, Revenue: ${d['Total Revenue']}`)
                              .attr('x', d => x(d['Event Breakdown']))
                              .attr('y', d => y(d['Total Revenue']) - 10)
                              .attr('font-size', '12px')
                              .attr('font-weight', 'bold')
                              .attr('fill', 'black');
       })
       .on('mouseout', function(d) {
           // Remove tooltip on mouseout
           svg.selectAll('text').remove();
       });

    // Axes
    svg.append('g')
       .attr('transform', `translate(0, ${height - margin.bottom})`)
       .call(d3.axisBottom(x));

    svg.append('g')
       .attr('transform', `translate(${margin.left}, 0)`)
       .call(d3.axisLeft(y));

    // Legends
    const legend = svg.append('g')
                      .attr('transform', `translate(${width - margin.right - 150}, ${margin.top})`);

    legend.append('rect')
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', 'blue');

    legend.append('text')
          .text('Historical Data')
          .attr('x', 30)
          .attr('y', 15)
          .attr('font-size', '12px');

    legend.append('rect')
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', 'orange')
          .attr('y', 25);

    legend.append('text')
          .text('Predicted Revenue')
          .attr('x', 30)
          .attr('y', 40)
          .attr('font-size', '12px');
}


