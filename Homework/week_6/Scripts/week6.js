window.onload = function() {

  var ISOdata;
  var EUdata;
  var EUjson;

  bubbleClicked = false;

  bubbleColor = d3.scale.ordinal().range(["#f48f42", "#249ee5"]);
  barColor = d3.scale.ordinal()
    .domain(["wine", "beer", "spirits"])
    .range(["#ceffc1", "#ffed68", "#3f83a3"]);

  // Add files to queue
  var q = d3.queue()
  .defer(d3.csv, "Data/Countries_code_EUmember.csv")
  .defer(d3.csv, "Data/EU_consumption_2013.csv")
  .defer(d3.json, "Data/European_alcohol_consumption.json")
  .await(loadData);

  function loadData(error, file1, file2, file3) {
    if (error) return;
    ISOdata = file1;
    EUdata = file2;
    EUjson = file3;

    EUaverage = getAverage(EUdata);

    // Source: http://bl.ocks.org/mmattozzi/7018021 - Mike Mattozzi 2016

    // Set dimensions for bubble chart
    var diameter = 350;
    var format = d3.format(",d")

    // Set dimensions for the barchart
    margin = {top: 80, right: 30, bottom: 35, left: 100};
    width = 500 - margin.left - margin.right;
    height = 350 - margin.top - margin.bottom;

    // Create a bubble node (global because used in update function)
    bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    // Add the svg for the bubble chart to the html (global because used in update function)
    svg = d3.select("body").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    // Add the svg for the barchart to the html (global because used in update function)
    svg_bar = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "details");



      ///////////////////////////////////////////////////////////////////////

        // Set dimensions for the barchart
        barHeight = 40;
        chartHeight = 120;
        chartWidth = 260;
        var bar;
        var rects;

        // Show chosen country as title
        svg_bar
          .append("text")
          .attr("class", "chosenCountry")
          .attr("x", margin.left - 50)
          .attr("y", 50)
          .text("")
          .style("font-family", "monospace")
          .style("font-size", "20px")
          .style("fill", "black");

        // Set Y-scale and -axis
        y = d3.scale.ordinal()
          .domain(["wine", "beer", "spirits"])
          .rangeRoundBands([0, chartHeight], .05);
        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .outerTickSize(2);

        // Set X-scale and -axis
        x = d3.scale.linear().range([0, chartWidth])
        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(10)
          .outerTickSize(2);

      ////////////////////////////////////////////////////////////////////





    // Add the tooltip, bur set to hidden
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip_css")
        .style("position", "absolute")
        .style("visibility", "hidden");

    // Append a bubblenode for every country
    var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(EUjson))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    // Add the bubbles to the svg
    var countryBubbles = node.append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("id", function(d) {return d.code;})
      .style("cursor","pointer")
      .style("fill", function(d) { return bubbleColor(d.packageName); });

    // Add interaction to bubbles
    countryBubbles.on("mouseover", function(d) {
        tooltip.text(d.className + ": " + (format(d.value) / 10) + "   litres per capita \ud83e\udd42");
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");

      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      })
      .on("click",function(d,i) {
        updateData(d.code);
        if (!bubbleClicked) {
        showBarchart(d.code, getBarData(d. code, EUdata));
      } else {
        updateBarChart(d.code, getBarData(d. code, EUdata));
      }
      });

    // Add the country codes as test to the bubbles
    node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .style("color", "white")
      .text(function(d) { return d.code.substring(0, d.r / 3); });

    d3.select(self.frameElement).style("height", diameter + "px");
  };





}

// Returns an ordered non-tree like structure off all countries
function classes(EUjson) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size, code: node.code});
  }

  recurse(null, EUjson);
  return {children: classes};
}

// Updates the bubbles
function updateData (country) {
  // Re-load data
  d3.json("Data/European_alcohol_consumption.json", function(error, newData) {
    if (error) return;

    // Loop over data and adjust bubble size for clicked country
    newData.children.forEach(function (European_Countries) {
      European_Countries.children.forEach(function (countries) {
        countries.children.forEach(function (d) {
          if (d.code === country) {
            d.size = 410;
          }
        })
      })
    })

  // Source: http://jsfiddle.net/CCRb5/

  // Re-append node with new data for every country
  var node = svg.selectAll(".node")
    .data(bubble.nodes(classes(newData)).filter(function (d){return !d.children;}),
    function(d) {return d.className} );

  // Re-append g nodes
  var nodeEnter = node.enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

  // Re-append circles
  nodeEnter
    .append("circle")
    .attr("r", function (d) {return d.r;});

  // Re-append text to bubbles
  nodeEnter
    .append("text")
    .text(function (d) { return d.className + ": " + format(d.value); });

  // Change bubbles with new size and opacity using a transition
  node.select("circle")
    .transition()
    .duration(900)
    .attr("r", function (d) { return d.r; })
    .style("opacity", 0.2)
    .style("fill", function(d) { return bubbleColor(d.packageName); });
    // .style("fill", "grey");

  // Re-arrange bubbles using transition
  node.transition()
    .duration(700)
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

  // Close and remove transition
  node.exit()
    .remove();

  // Set opicaty of clicked bubble to 100%
  svg.select("#" + country)
    .transition()
    .delay(700)
    .style("opacity", 1);
  })
}



function getBarData (countryCode, barData) {
  var barValues = [];
  var currentCountry;

  // Loop over all the data to get specific details for chosen country
  barData.forEach(function (d, i) {
    // Find country in EU dataset
    if (countryCode === d.Code) {
      // Get full namd of country
      currentCountry = d.Country_name;
      totalConsumption = d.Total;

      var countryValues = d3.values(d);
      countryValues.splice(0, 3);
      countryValues.splice(3, 3);

      barValues = countryValues;
    }
  })

  // Update barchart title to chosen country
  svg_bar.select(".chosenCountry")
    .text(currentCountry);

  return barValues;
}

function updateBarChart (countryCode, barValues) {
  // Re-scale both axes with new data
  x.domain([0, (Math.ceil(d3.max(d3.values(barValues))))]); // Get highest value and round to the integer

  // Change the X-axis
  svg_bar.select(".x.axis")
      .call(xAxis);

  // Change the bar data with new values
  bar.data(barValues);

  // Change bars to new width
  bar.select("rect")
    .transition()
    .duration(800)
    .attr("width", function(d) { return x(d);});
}

function showBarchart (countryCode, barValues) {
  bubbleClicked = true;

  // Specifiy variables
  var Ydomain = ["wine", "beer", "spirits"]

  // // Show chosen country as title
  // svg_bar.selectAll(".chosenCountry")
  //   .data(countryCode)
  //   .enter()
  //   .append("text")
  //   .attr("class", "chosenCountry")
  //   .attr("x", margin.left - 50)
  //   .attr("y", 50)
  //   .text(country)
  //   .style("font-family", "monospace")
  //   .style("font-size", "20px")
  //   .style("fill", "black");

  x.domain([0, (Math.ceil(d3.max(d3.values(barValues))))]); // Get highest value and round to the integer

  // Add axes to the svg
  svg_bar.append("g")
    .attr("transform", "translate("+ margin.left + "," + margin.top + ")")
    .attr("class", "y axis")
    .call(yAxis);
  svg_bar.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate("+ margin.left + "," + (chartHeight + margin.top) + ")")
    .call(xAxis)

  // Add label to the X-axis
  svg_bar.append("text")
    .attr("class","x label")
    .attr("transform", "translate(" + (margin.left + (chartWidth / 2)) + " ," + (chartHeight + margin.top + margin.bottom) + ")")
    .style("text-anchor", "middle")
    .text("Litres per capita in 2013");

  // Set the dimensions for the each bar in barchart
  bar = svg_bar.selectAll("g").select("bars")
    .data(barValues)
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate("+ margin.left + "," + ((i * barHeight) + margin.top) + ")"; });

  // Add bar with correct data to barchart
  rects = bar.append("rect")
    // .attr("width", function(d) { return x(d); })
    .attr("width", function(d) { return 0; })
    .attr("height", barHeight - 1)
    .attr("class", "bar")
    .style("cursor","pointer")
    .style("fill", function(d, i) { return barColor(d); });

  // Add animation when clicking the country bubble
  rects
    .transition()
    .duration(1000)
    .delay(function(d, i) { return (i * 200); })
    .attr("width", function(d) { return x(d); });

  // Show exact data on hover
  bar.on("mouseover", function(d) {
    // Change opacity of other bars
    bar.selectAll("rect")
      .style("opacity", 0.6);

    // Set selected bar to full opacity
    d3.select(this).select("rect")
  	 .style("opacity", 1);

    // Show exact value for selected bar
    d3.select(this)
      .append("text")
      .style("cursor","none")
      .attr("class", "barvalue")
      .attr("transform", function(d, i) { return "translate(" + 6 + "," + ((i * barHeight) + (barHeight / 2) + 5) + ")"; })
      .text(function(d) { return d; })
  });

  bar.on("mouseout", function(d) {
    // Set all bars back to their original color
    bar.selectAll("rect")
      .style("opacity", 1)
      .style("fill", function(d, i) { return barColor(d); });

    // Delete text
    bar.selectAll("text")
      .remove();
  });
}

// Returns the average total alcohol consumption
function getAverage(data) {
  EUaverage = 0;

  data.forEach(function(d) {
    EUaverage += Number(d.TOTAL);
  })
  return EUaverage /= data.length;
}
