var width = 400;
var height = 400;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


d3.json("data/ages.json").then((data) => {
    

    data.forEach((d) => {
        d.age = +d.age;
    });

    console.log(data);


    var circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => (i + 1) * 50) 
        .attr("cy", height / 2)
        .attr("r", (d) => d.age * 2)
        .attr("fill", (d) => d.age > 10 ? "orange" : "skyblue");

}).catch((error) => {
    console.log("Error loading the data:", error);
});