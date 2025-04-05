var margin = { top: 50, right: 200, bottom: 50, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


var controls = d3.select("#chart-area").append("div").attr("id", "controls");

controls.append("button").attr("id", "play-button").text("Play");
controls.append("button").attr("id", "reset-button").text("Reset");
controls.append("span").text("    Year: ");
controls.append("span").attr("id", "year-value").text("1800");
controls.append("input")
    .attr("id", "year-slider")
    .attr("type", "range")
    .attr("min", 1800)
    .attr("max", 2020)
    .attr("step", 1);
controls.append("select").attr("id", "continent-filter");


var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
var x = d3.scaleLog().domain([142, 150000]).range([0, width]);
var y = d3.scaleLinear().domain([0, 90]).range([height, 0]);
var area = d3.scaleLinear().domain([2000, 1400000000]).range([25 * Math.PI, 1500 * Math.PI]);
var color = d3.scaleOrdinal(d3.schemePastel1);

// Axes
var xAxis = d3.axisBottom(x).tickValues([400, 4000, 40000]).tickFormat(d => `$${d}`);
var yAxis = d3.axisLeft(y);

svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`).call(xAxis);
svg.append("g").attr("class", "y-axis").call(yAxis);

// Axis labels
svg.append("text").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text("GDP Per Capita ($)");
svg.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -60).attr("text-anchor", "middle").text("Life Expectancy (Years)");

// Year label
var yearLabel = svg.append("text").attr("x", width + 100).attr("y", height - 20).attr("text-anchor", "end").attr("font-size", "40px").attr("fill", "gray");

d3.json("data/data.json").then(data => {
    var formattedData = data.map(year => {
        return {
            year: year.year,
            countries: year.countries.filter(c => c.income && c.life_exp && c.continent)
        };
    });


    const allContinents = Array.from(new Set(formattedData.flatMap(d => d.countries.map(c => c.continent)))).sort();


    const dropdown = d3.select("#continent-filter");
    dropdown.append("option").text("All").attr("value", "All");
    dropdown.selectAll("option.continent")
        .data(allContinents)
        .enter()
        .append("option")
        .attr("class", "continent")
        .attr("value", d => d)
        .text(d => d);

    let yearIndex = 0;
    let interval;

    function update(dataForYear) {
        const selectedContinent = d3.select("#continent-filter").property("value");
        let countries = dataForYear.countries;

        if (selectedContinent !== "All") {
            countries = countries.filter(d => d.continent === selectedContinent);
        }

        yearLabel.text(dataForYear.year);
        d3.select("#year-slider").property("value", dataForYear.year);
        d3.select("#year-value").text(dataForYear.year);

        const circles = svg.selectAll("circle").data(countries, d => d.country);

        circles.exit().transition().attr("r", 0).remove();

        circles.enter().append("circle")
            .attr("fill", d => color(d.continent))
            .attr("cx", d => x(d.income))
            .attr("cy", d => y(d.life_exp))
            .attr("r", 0)
            .merge(circles)
            .transition()
            .duration(300)
            .attr("cx", d => x(d.income))
            .attr("cy", d => y(d.life_exp))
            .attr("r", d => Math.sqrt(area(d.population) / Math.PI));
    }

    function step() {
        yearIndex = (yearIndex + 1) % formattedData.length;
        update(formattedData[yearIndex]);
    }

    d3.select("#play-button").on("click", function() {
        if (interval) {
            clearInterval(interval);
            interval = null;
            d3.select(this).text("Play");
        } else {
            interval = setInterval(step, 1000);
            d3.select(this).text("Pause");
        }
    });

    d3.select("#reset-button").on("click", function() {
        clearInterval(interval);
        interval = null;
        yearIndex = 0;
        update(formattedData[yearIndex]);
        d3.select("#play-button").text("Play");
    });

    d3.select("#year-slider").on("input", function() {
        yearIndex = +this.value - 1800;
        update(formattedData[yearIndex]);
    });

    d3.select("#continent-filter").on("change", function() {
        update(formattedData[yearIndex]);
    });

    update(formattedData[0]);

        // Leyenda (legend)
    var legend = svg.append("g")
    .attr("transform", `translate(${width + 40}, 20)`);

    allContinents.forEach((continent, i) => {
    const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

    legendRow.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", color(continent));

    legendRow.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .attr("text-anchor", "start")
        .style("text-transform", "capitalize")
        .text(continent);
    });

    
});
