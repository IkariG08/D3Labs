var width = 500;
var height = 500;
var margin = { top: 20, right: 20, bottom: 80, left: 50 };
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;


var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


d3.json("data/buildings.json").then((data) => {
    
    
    data.forEach((d) => {
        d.height = +d.height;
    });

    console.log(data);

    
    var x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, innerWidth])
        .paddingInner(0.4)
        .paddingOuter(0.4);

    
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.height)])
        .range([innerHeight, 0]);

    
    var colorScale = d3.scaleOrdinal(d3.schemeSet3);

    
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.height))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.height))
        .attr("fill", d => colorScale(d.name));

    
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x(d.name) + x.bandwidth() / 2)
        .attr("y", innerHeight + 15)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("transform", (d, i) => `rotate(-45, ${x(d.name) + x.bandwidth() / 2}, ${innerHeight + 15})`)
        .text(d => d.name);

}).catch((error) => {
    console.log("Error loading the data:", error);
});