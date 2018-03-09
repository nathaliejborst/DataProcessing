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

function Station(data) {
    this.name = name;
    this.values = values;
    this.date = date;
  }


window.onload = function() {
  // Specify file names for every weather station
  var files = ["KNMI_windsnelheid_2001_Bilt.json",
        "KNMI_windsnelheid_2001_Rotterdam.json",
        "KNMI_windsnelheid_2001_Eindhoven.json"];

  // Set dimensions for button svg
  var w = 1200;
  var h = 70;

  //Set colors for different button states
  var buttonColor = "#7777BB"
  var buttonPressColor = "#000077"

  // Set the text for the buttons
  var buttonText = ['de Bilt','Rotterdam','Eindhoven'];

  // Set specifications for the individual buttons
  var buttonWidth = 80;
  var buttonHeight = 25;
  var buttonSpace = 4;

  // Let user know what to do
  var chooseText = d3.select("body").append("text")
        .attr("id", "pleaseChoose")
        .style("fill", "black")
        .text("Please choose a city");

  // Add a svg element for the buttons
  var buttonSvg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("transform", "translate(" + 60 + ", 0)");

  // Add button groups
  var buttons = buttonSvg.selectAll(".button")
      .data(buttonText)
      .enter()
      .append("g")
      .attr("class","button")
      .style("cursor","pointer");

  // Add actual button
  buttons.append("rect")
    .attr("class","buttonRect")
    .attr("width", buttonWidth)
    .attr("height", buttonHeight)
    .attr("x",function(d,i) { return (buttonWidth + buttonSpace) * i; })
    .attr("y", 10)
    .attr("rx", 5)
    .attr("ry", 5)
    .style("fill", buttonColor);

  // Add label text to the button
  buttons.append("text")
    .attr("class","buttonText")
    .attr("x",function(d,i) {
        return ((buttonWidth + buttonSpace) * i) + (buttonWidth / 2);
    })
    .attr("y",10 + (buttonHeight / 2))
    .attr("text-anchor","middle")
    .attr("dominant-baseline","central")
    .style("fill","white")
    .text(function(d) {return d;})

  // Add interaction on click
  buttonSvg.selectAll(".buttonRect")
      .on("click",function(d,i) {
        // Change button color when clicked
        changeButtonColor(d3.select(this), buttonPressColor, buttonColor)

        // Get value from clicked button
        file = files[stationChoice(d3.select(this).datum())];

        // Remove text
        d3.select("#pleaseChoose").remove();

        // Show graph
        buttonClick(file);
      });

  // Changes the color of a button element
  function changeButtonColor (button, col, defaultCol) {
    buttonSvg.selectAll(".buttonRect")
                .style("fill", defaultCol);

    button.style("fill", col);
  }

  // Loads and shows data for a chosen weather station
  function buttonClick (file) {
    // First clear svg before adding things
    d3.select(".graph").remove();

    // Load the JSON from file
    d3.json(file, function(error, data) {
        if (error) return;

      // Set time format to convert string to date format
      formatTime = d3.time.format("%Y%m%d").parse;

      // Set color scale for the lines in the graph
      color = d3.scale.ordinal().range(["#009999",  "#ff0066",  "#99ccff"]);

      // Map variable names
      varNames = d3.keys(data[0]);

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
      margin = {top:15, right: 180, bottom: 65, left: 50};

      // Set dimensions
      width = 1200 - margin.left - margin.right;
      height = 600 - margin.top - margin.bottom;

      // Set scale for X-axis representing the dates
      var x = d3.time.scale()
          .domain(d3.extent(seriesData[0].values, function(d) {
            return d.date; }))
          .range([0, width]),
        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(d3.time.months)
          .tickFormat(d3.time.format("%b %y"))
          .outerTickSize(7);

      // Set scale for Y-axis representing windpower (in 0.1 m/s);
      var y = d3.scale.linear()
          .domain([0, d3.max(seriesData, function (c) { return d3.max(c.values,
             function (d) { return d.value; }); })])
          .range([height, 0]),
        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(15)
          .outerTickSize(1);

      // Add svg for the canvas of the graph
      svg = d3.select("body").append("svg")
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
    		.attr("class", function (d) { return d.name; })
    	  .attr("d", function (d) { return line(d.values); })
        .style("stroke", function (d) { return color(d.name); })
        .style("stroke-width", 1)
        .style("fill", "none")
        .on('mouseout', mouseOutListener)
        .on('mouseover', mouseOverListener);

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

        // Initialize legend
        setLegend();

        // Add overlay for interactive visualization of values
        var overlay = svg.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "white")
          .attr("opacity", 0);

        // Add vertical line to svg
        var verticalLine = svg.append("line")
          .attr("opacity", 0)
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("pointer-events", "none");

        // Add textfields to show x and y values
        var exactDate = svg.append("text")
          .attr("class", "exactDate")
          .attr("opacity", 0);

        // Append a text node for each variable
        var vars = svg.selectAll(".varValues")
              .data(varNames)
              .enter()
              .append("text")
              .attr("class", function(d) {return d;})
              .attr("opacity", 0);

        // Add interaction to vertical line by showing the x value for the mouse
        // x coordinate
        overlay.on("mousemove", function(){
          var x0 = x.invert(d3.mouse(this)[0]);
          mouse = d3.mouse(this);
          mousex = mouse[0];
          mousey = mouse[1];

          // Margin of text from line and y positions
          textMargin = 10;
          VarValueDetails = ["50", "35", "65"];

          // Show line and date
          verticalLine
            .attr("x1", mousex)
            .attr("x2", mousex)
            .attr("opacity", 1);
          exactDate
            .text(String(x0).substring(0,10))
            .attr('transform', 'translate(' + (mousex + textMargin) + ',' + 20 + ')')
            .attr("opacity", 1);

          // Get values for date
          varValues = findValues(seriesData, String(x0).substring(0,10));

          vars
          .text(function(d, i) { return varValues[i]; })
          .attr('transform', function(d, i) { return 'translate(' + (mousex +
            textMargin) + ',' + VarValueDetails[i] + ')'; })
          .attr("opacity", 1)
          .style("fill", function (d) { return color(d); });
          }).on("mouseout", function(){
          // Make line and values invisible
          verticalLine.attr("opacity", 0);
          exactDate.attr("opacity", 0);
          vars.attr("opacity", 0);
        });
    });
  }
}

// Returns an array of the value per variable for a certain date
function findValues(stationData, lineDate) {
  var YValues = [];

  // Loop trough data to find values for each variable for given lineDate
  stationData.forEach(function(d) {
    d.values.forEach(function(c) {
      if (String(c.date).substring(0, 10) === lineDate) {
        // Add value to array if date matches
        YValues.push(c.value);
      }
    })
  })
  return YValues;
}

// Initializes the legend for the plot
function setLegend () {
  var fullVarNames = ["Daily average", "Highest hourly average",
                      "Lowest hourly average"]

  // Set dimensions for legend
  legendWidth = 210;
  legendHeight = 100;

  // Define the size of the color block rectangle
  rectSize = (legendHeight) / (varNames.length * 1.5);

  // Append box for legend
  var legend = svg.append('svg')
    .attr('class', 'legend')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('transform', 'translate(' + (width + margin.left + margin.right
      - legendWidth) + ',' + 25 + ')');

  // Add a g element for every legend item
  var item = legend.selectAll('.legend')
      .data(varNames)
      .enter()
      .append('g')
      .attr('transform', function(d, i) {
        var x = 0;
        var y = (i * rectSize * 1.5);
        return 'translate('+ x + ',' + y + ')'; });

  // Add colorbox for legend item and add listeners for interactivity
  item.append('rect')
    .attr('width', rectSize)
    .attr('height', rectSize)
    .attr('transform', 'translate(0,0)')
    .attr('class', function(d, i) { return varNames[i]; })
    .style('fill', function (d, i) { return color(d); });

  // Add corresponding text for legend item
  item.append('text')
    .attr('transform', function(d, i) {
    var x = 35;
    var y = rectSize * (3/4);
    return 'translate('+ x + ',' + y + ')'; })
    .text(function(d, i) { return fullVarNames[i]; });
}
