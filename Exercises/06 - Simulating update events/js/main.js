var margin = { left: 100, right: 10, top: 10, bottom: 100 };
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var flag = true;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var x = d3.scaleBand().range([0, width]).padding(0.2);
var y = d3.scaleLinear().range([height, 0]);

var xAxisGroup = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")");

var yAxisGroup = svg.append("g")
    .attr("class", "y axis");

var yLabel = svg.append("text")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue");

d3.json("data/revenues.json").then((data) => {
    data.forEach(d => {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(() => {
        update(data);
        flag = !flag;
    }, 1000);

    update(data);
}).catch(error => console.log(error));

function update(data) {
    var value = flag ? "revenue" : "profit";

    x.domain(data.map(d => d.month));
    y.domain([0, d3.max(data, d => d[value])]);

    var xAxisCall = d3.axisBottom(x);
    var yAxisCall = d3.axisLeft(y).ticks(5).tickFormat(d => "$" + d);

    xAxisGroup.transition().duration(500).call(xAxisCall);
    yAxisGroup.transition().duration(500).call(yAxisCall);

    var bars = svg.selectAll("rect").data(data);

    bars.exit().remove();

    bars.transition().duration(500)
        .attr("x", d => x(d.month))
        .attr("y", d => y(d[value]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[value]));

    bars.enter().append("rect")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d[value]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[value]))
        .attr("fill", "yellow")
        .merge(bars)
        .transition().duration(500)
        .attr("y", d => y(d[value]))
        .attr("height", d => height - y(d[value]));

    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);
}
