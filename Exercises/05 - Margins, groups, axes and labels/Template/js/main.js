// Define canvas dimensions
var width = 600;
var height = 400;
var margin = { top: 10, right: 10, bottom: 100, left: 100 };
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

// Create the SVG canvas
var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create group element considering margins
var g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data from JSON file
d3.json("data/buildings.json").then((data) => {
    
    // Parse data
    data.forEach((d) => {
        d.height = +d.height;
    });

    console.log(data);

    // Define a scale band for x-axis
    var x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, innerWidth])
        .paddingInner(0.4)
        .paddingOuter(0.4);

    // Define a linear scale for y-axis (flipped range)
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.height)])
        .range([innerHeight, 0]);

    // Define an ordinal color scale
    var colorScale = d3.scaleOrdinal(d3.schemeSet3);

    // Bind data to rectangles
    var rects = g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.height))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.height))
        .attr("fill", d => colorScale(d.name));

    // Create bottom axis
    var xAxis = d3.axisBottom(x);
    g.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Create left axis with formatting
    var yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `${d}m`);
    g.append("g").call(yAxis);

    // X-axis label
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 100)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("The world's tallest buildings");

    // Y-axis label
    g.append("text")
        .attr("x", -innerHeight / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("transform", "rotate(-90)")
        .text("Height (m)");

}).catch((error) => {
    console.log("Error loading the data:", error);
});
