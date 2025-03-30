var margin = { left: 100, right: 10, top: 10, bottom: 100 };
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// Load the data
 d3.json("data/revenues.json").then(function(data) {
    data.forEach(d => {
        d.revenue = +d.revenue;
    });

    var x = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([0, width])
        .padding(0.3);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.revenue)])
        .range([height, 0]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => "$" + d);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d.revenue))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.revenue))
        .attr("fill", "red");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 70)
        .attr("text-anchor", "middle")
        .text("Month");

    svg.append("text")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Revenue ($)");
}).catch(error => console.log(error));
