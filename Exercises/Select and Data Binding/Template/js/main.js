var data = [25, 20, 15, 10, 5];

var svg = d3.select("#chart-area").append("svg")

	.attr("width", 400)

	.attr("height", 400);

var rects = svg.selectAll("rect") 
    .data(data) 
    .enter()
    .append("rect")
    .attr("x", function(d, i) { 
        return i * 75;
    })
    .attr("y", function(d) {
        return 300 - d;
    })
    .attr("width", 40)
    .attr("height", function(d) {
        return d;
    })
    .attr("fill", "red");