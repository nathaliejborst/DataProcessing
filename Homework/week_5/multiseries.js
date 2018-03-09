// Nathalie Borst
// Data Processing - week 5


  // BRON: KONINKLIJK NEDERLANDS METEOROLOGISCH INSTITUUT (KNMI)
  // Opmerking: door stationsverplaatsingen en veranderingen in waarneemmethodieken zijn deze tijdreeksen van dagwaarden mogelijk inhomogeen! Dat betekent dat deze reeks van gemeten waarden niet geschikt is voor trendanalyse. Voor studies naar klimaatverandering verwijzen we naar de gehomogeniseerde reeks maandtemperaturen van De Bilt <http://www.knmi.nl/kennis-en-datacentrum/achtergrond/gehomogeniseerde-reeks-maandtemperaturen-de-bilt> of de Centraal Nederland Temperatuur <http://www.knmi.nl/kennis-en-datacentrum/achtergrond/centraal-nederland-temperatuur-cnt>.
  //
  //
  // STN      LON(east)   LAT(north)     ALT(m)  NAME
  // 260:         5.180       52.100       1.90  DE BILT
  // 344:         4.447       51.962      -4.30  ROTTERDAM
  // 380:         5.762       50.906     114.30  MAASTRICHT
  //
  // YYYYMMDD = Datum (YYYY=jaar MM=maand DD=dag);
  // FG       = Etmaalgemiddelde windsnelheid (in 0.1 m/s);
  // FHX      = Hoogste uurgemiddelde windsnelheid (in 0.1 m/s);
  // FHN      = Laagste uurgemiddelde windsnelheid (in 0.1 m/s);
  // FXX      = Hoogste windstoot (in 0.1 m/s);
window.onload = function() {
  // Load the JSON from file
  d3.json("KNMI_windsnelheid_2001_Bilt.json", function(error, data) {
      if (error) return;

    // Set time format to convert string to date format
    formatTime = d3.time.format("%Y%m%d").parse;

    // Set color scale for the lines in the graph
    var color = d3.scale.ordinal().range(["#009999",  "#ff0066",  "#99ccff", "#72C39B"]);

    // Map variable names
    var labelVar = "windspeed";
    var varNames = d3.keys(data[0])
        .filter(function (key) { return key !== labelVar;});

    // Only keep the relevant variables from the JSON
    varNames.splice(0, 2);
    varNames.splice(3,3);

    // Connect colors with variables
    color.domain(varNames);

    // Map the values to the variables
    var seriesData = varNames.map(function (name) { //D
      return {
        name: name,
        values: data.map(function (d) {
          return {date: formatTime(d.YYYYMMDD), value: +d[name]};
        })
      };
    });

    // Set margins
    margin = {top:40, right: 30, bottom: 65, left: 50};

    // Set dimensions
    width = 1200 - margin.left - margin.right;
    height = 600 - margin.top - margin.bottom;

    // Set scale for X-axis representing the dates
    var x = d3.time.scale()
        .domain(d3.extent(seriesData[0].values, function(d) { return d.date; }))
        .range([0, width]),
      xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.months)
        .tickFormat(d3.time.format("%b %y"))
        .outerTickSize(7);

    // Set scale for Y-axis representing windpower (in 0.1 m/s);
    var y = d3.scale.linear()
        .domain([0, d3.max(seriesData, function (c) { return d3.max(c.values, function (d) { return d.value; }); })])
        .range([height, 0]),
      yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(15)
        .outerTickSize(1);

    // Add svg for the canvas of the graph
    var svg = d3.select("body").append("svg")
      .attr("class", "graph")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create lines with corresponding x and y values
    var line = d3.svg.line()
    .x(function (d) {  return x(d.date)})
    .y(function (d) {  return y(d.value); })
    .interpolate("basis");

    // Append line to svg
    svg.selectAll(".line")
      .data(seriesData)
      .enter()
      .append("path")
  		.attr("class", "line")
  	  .attr("d", function (d) { return line(d.values); })
      .style("stroke", function (d) { return color(d.name); })
      .style("stroke-width", 1)
      .style("fill", "none");

    // Add the X Axis
  	svg.append("g")
  		.attr("class", "x axis")
  		.attr("transform", "translate(0," + height + ")")
  		.call(xAxis)
      .style({ "stroke": "black", "fill": "none", "stroke-width": "1px"});;

    // Add label to the X-axis
    svg.append("text")
      .attr("class","x label")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 15) + ")")
      .style("text-anchor", "middle")
      .text("months (2001)");

  	// Add the Y Axis
  	svg.append("g")
  		.attr("class", "y axis")
  		.call(yAxis)
      .style({ "stroke": "black", "fill": "none", "stroke-width": "1px"});

    // Add label to the Y-axis
    svg.append("text")
      .attr("class","y label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("windspeed (in 0.1 m/s)");


  });
}

// Returns stationname as string for station number as parameter
function stationName (d) {
  switch(d) {
    case "  260":
      return "de Bilt";
    case "  344":
      return "Maastricht";
    case "  380":
      return "Rotterdam";
    }
}

function monthlyData (data) {
  var newData = JSON.parse(JSON.stringify(data));
    newData.forEach(function(d, i) {
    });
}
