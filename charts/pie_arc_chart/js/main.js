var margin = {top: 20, right: 300, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(d3.schemeCategory10);

// Create the arc generator
var arc = d3.arc()
    .innerRadius(radius * 0.5) // Donut chart with hole
    .outerRadius(radius * 0.9);

// Create the pie layout generator
var pie = d3.pie()
    .sort(null)
    .value(d => d.count);

d3.tsv("data/donut2.tsv").then((data) => {
    // Transform data to its proper format
    data.forEach(d => {
        d.count = +d.count;
        d.fruit = d.fruit.toLowerCase();
    });

    // Create the nest function to group by fruits
    var regionsByFruit = d3.nest()
        .key(d => d.fruit)
        .entries(data);

    console.log(regionsByFruit);

    var label = d3.select("form").selectAll("label")
        .data(regionsByFruit)
        .enter().append("label");

    // Dynamically add radio buttons to select the fruit
    label.append("input")
        .attr("type", "radio")
        .attr("name", "fruit")
        .attr("value", d => d.key)
        .on("change", update)
        .filter((d, i) => !i)
        .each(update)
        .property("checked", true);

    label.append("span")
        .attr("fill", "red")
        .text(d => d.key);

}).catch((error) => {
    console.log(error);
});

function update(region) {
    var path = g.selectAll("path");

    var data0 = path.data(),
        data1 = pie(region.values);

    // JOIN elements with new data
    path = path.data(data1, key);

    // EXIT old elements from the screen
    path.exit()
        .datum((d, i) => findNeighborArc(i, data1, data0, key) || d)
        .transition()
        .duration(750)
        .attrTween("d", arcTween)
        .remove();
    
    // UPDATE elements still on the screen
    path.transition()
        .duration(750)
        .attrTween("d", arcTween);

    // ENTER new elements in the array
    path.enter()
        .append("path")
        .each(function(d, i) { 
            this._current = findNeighborArc(i, data0, data1, key) || d; 
        })
        .attr("fill", d => color(d.data.region))
        .transition()
        .duration(750)
        .attrTween("d", arcTween);

    // ---- New code to add labels for each region ----
    // Bind the same data to text elements (using key so that labels correspond to arcs)
    var texts = g.selectAll("text.label")
        .data(data1, key);

    // EXIT old labels
    texts.exit()
        .transition()
        .duration(750)
        .attr("opacity", 0)
        .remove();

    // UPDATE existing labels
    texts.transition()
        .duration(750)
        .attr("transform", d => {
            // Calculate the mid-angle for proper positioning
            var midAngle = (d.startAngle + d.endAngle) / 2;
            // Place labels at an outer radius (here 0.95 * radius) so they appear outside
            var x = radius * 0.95 * Math.cos(midAngle);
            var y = radius * 0.95 * Math.sin(midAngle);
            return "translate(" + x + "," + y + ")";
        })
        .text(d => d.data.region);

    // ENTER new labels
    texts.enter()
        .append("text")
        .attr("class", "label")
        .attr("opacity", 0)
        .attr("transform", d => {
            var midAngle = (d.startAngle + d.endAngle) / 2;
            var x = radius * 0.95 * Math.cos(midAngle);
            var y = radius * 0.95 * Math.sin(midAngle);
            return "translate(" + x + "," + y + ")";
        })
        .text(d => d.data.region)
        .attr("text-anchor", d => {
            // Adjust the text anchor so that labels align well
            var midAngle = (d.startAngle + d.endAngle) / 2;
            return midAngle < Math.PI ? "start" : "end";
        })
        .attr("alignment-baseline", "middle")
        .transition()
        .duration(750)
        .attr("opacity", 1);
    // ---- End of added label code ----
}

function key(d) {
    return d.data.region;
}

function findNeighborArc(i, data0, data1, key) {
    var d;
    return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
        : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
        : null;
}

function findPreceding(i, data0, data1, key) {
    var m = data0.length;
    while (--i >= 0) {
        var k = key(data1[i]);
        for (var j = 0; j < m; ++j) {
            if (key(data0[j]) === k) return data0[j];
        }
    }
}

function findFollowing(i, data0, data1, key) {
    var n = data1.length, m = data0.length;
    while (++i < n) {
        var k = key(data1[i]);
        for (var j = 0; j < m; ++j) {
            if (key(data0[j]) === k) return data0[j];
        }
    }
}

function arcTween(d) {
    var i = d3.interpolate(this._current, d);
    this._current = i(1);
    return t => arc(i(t));
}
