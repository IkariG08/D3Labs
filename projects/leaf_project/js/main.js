var margin = { top: 50, right: 200, bottom: 50, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


var x = d3.scaleLog().domain([142, 150000]).range([0, width]);
var y = d3.scaleLinear().domain([0, 90]).range([height, 0]);
var area = d3.scaleLinear().domain([2000, 1400000000]).range([25 * Math.PI, 1500 * Math.PI]);
var color = d3.scaleOrdinal(d3.schemePastel1);


var xAxis = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d => `$${d}`);

var yAxis = d3.axisLeft(y);

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);


svg.append("text")
    .attr("class", "x-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");

svg.append("text")
    .attr("class", "y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .text("Life Expectancy (Years)");


var yearLabel = svg.append("text")
    .attr("class", "year-label")
    .attr("x", width + 100)
    .attr("y", height - 20)
    .attr("text-anchor", "end")
    .attr("font-size", "40px")
    .attr("fill", "gray");


var continentLabelsGroup = svg.append("g")
    .attr("class", "legend-labels")
    .attr("transform", `translate(${width + 100}, ${height - 160})`);


d3.json("data/data.json").then(data => {
    var formattedData = data.map(year => {
        return {
            year: year.year,
            countries: year["countries"].filter(country => country.income && country.life_exp)
                .map(country => {
                    country.income = +country.income;
                    country.life_exp = +country.life_exp;
                    return country;
                })
        };
    });

    
    var continents = Array.from(
        new Set(formattedData.flatMap(d => d.countries.map(c => c.continent)))
    );

    var legendRow = continentLabelsGroup.selectAll(".legend-row")
    .data(continents)
    .enter()
    .append("g")
    .attr("class", "legend-row")
    .attr("transform", (d, i) => `translate(0, ${i * 25})`);

	
	legendRow.append("rect")
		.attr("x", 10)
		.attr("y", -10)
		.attr("width", 18)
		.attr("height", 18)
		.attr("fill", d => color(d));

	
	legendRow.append("text")
		.attr("x", 35)
		.attr("y", 4)
		.attr("text-anchor", "start")
		.attr("fill", "black")
		.attr("font-size", "14px")
		.text(d => d);


    let yearIndex = 0;

    function update(dataForYear) {
        var t = d3.transition().duration(1000);

        var circles = svg.selectAll("circle").data(dataForYear.countries, d => d.country);

        circles.exit()
            .transition(t)
            .attr("r", 0)
            .remove();

        circles.enter()
            .append("circle")
            .attr("fill", d => color(d.continent))
            .attr("cx", d => x(d.income))
            .attr("cy", d => y(d.life_exp))
            .attr("r", 0)
            .merge(circles)
            .transition(t)
            .attr("cx", d => x(d.income))
            .attr("cy", d => y(d.life_exp))
            .attr("r", d => Math.sqrt(area(d.population) / Math.PI));

        
        yearLabel.text(dataForYear.year);
    }

    
    d3.interval(() => {
        yearIndex = (yearIndex + 1) % formattedData.length;
        update(formattedData[yearIndex]);
    }, 1000);

    
    update(formattedData[0]);
});
