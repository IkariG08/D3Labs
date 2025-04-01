/*
*    main.js
*/

var margin = { top: 20, right: 300, bottom: 30, left: 50 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Time parser for x-scale
var parseDate = d3.timeParse('%Y');
var formatNumber = d3.format(".1f"),
    formatBillion = (x) => formatNumber(x / 1e9);

// Scales
var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);
var color = d3.scaleOrdinal(d3.schemeSpectral[11]);

// Axis generators
var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft().tickFormat(formatBillion);

// Area generator
var area = d3.area()
    .x(d => x(d.data.date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

var yAxis = g.append("g")
    .attr("class", "y axis");

// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Billions of liters");

// Legend group
var legend = g.append("g")
    .attr("transform", "translate(" + (width + 150) + "," + (height - 210) + ")");

d3.csv('data/stacked_area2.csv').then((data) => {
    
    var keys = d3.keys(data[0]).filter(key => key !== 'date');
    color.domain(keys);
    
    data.forEach(d => { d.date = parseDate(d.date); });
    
    var stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    
    var stackedData = stack(data);
    
    var maxDateVal = d3.max(stackedData[stackedData.length - 1], d => d[1]);
    
    x.domain(d3.extent(data, d => d.date));
    y.domain([0, maxDateVal]);
    
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));
    
    var category = g.selectAll(".category")
        .data(stackedData)
        .enter().append("g")
        .attr("class", "category");
    
    category.append("path")
        .attr("class", "area")
        .attr("d", area)
        .style("fill", d => color(d.key));
    
    // Create legend
    var legendItem = legend.selectAll(".legendItem")
        .data(keys)
        .enter().append("g")
        .attr("class", "legendItem")
        .attr("transform", (d, i) => "translate(0," + (i * 20) + ")");
    
    legendItem.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color);
    
    legendItem.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d);
    
}).catch(error => console.log(error));