// Define canvas dimensions
var width = 600;
var height = 800;
var barWidth = 50;
var barSpacing = 10;

// Create the SVG canvas
var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load data from JSON file
d3.json("data/buildings.json").then((data) => {
    
    // Parse data
    data.forEach((d) => {
        d.height = +d.height;
    });

    console.log(data);

    // Define a scale for the heights
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.height)])
        .range([0, height - 50]);


    // Bind data to rectangles
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * (barWidth + barSpacing)) // Stagger bars
        .attr("y", d => height - yScale(d.height)) // Align bars at bottom
        .attr("width", barWidth)
        .attr("height", d => yScale(d.height)) // Scaled height
        .attr("fill", "teal");

    // Add building names as angled labels
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * (barWidth + barSpacing) + barWidth / 2) // Center text
        .attr("y", d => height - yScale(d.height) - 10) // Position above bars
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("transform", (d, i) => `rotate(-45, ${i * (barWidth + barSpacing) + barWidth / 2}, ${height - yScale(d.height) - 10})`)
        .text(d => d.name);

}).catch((error) => {
    console.log("Error loading the data:", error);
});
