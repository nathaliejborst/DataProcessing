window.onload = function() {
  var ISOdata;
  var EUdata;
  var EUjson;

  bubbleColor = d3.scale.ordinal().range(["#f48f42", "#249ee5"]);
  barColor = d3.scale.ordinal()
    .domain(["wine", "beer", "spirits"])
    .range(["#ceffc1", "#ffed68", "#3f83a3"]);


  // Set dimensions for bubble chart
  diameter = 350;
  format = d3.format(",d")

  // Set dimensions for the barchart
  margin = {top: 80, right: 30, bottom: 35, left: 100};
  width = 500 - margin.left - margin.right;
  height = 350 - margin.top - margin.bottom;

  barHeight = 40;
  chartHeight = 120;
  chartWidth = 260;

  // Add files to queue
  var q = d3.queue()
    .defer(d3.csv, "Data/EU_consumption_2013.csv")
    .defer(d3.json, "Data/European_alcohol_consumption.json")
    .await(loadData);
}

function loadData(error, file1, file2) {
  if (error) return;
  EUdata = file1;
  EUjson = file2;

  // Source: http://bl.ocks.org/mmattozzi/7018021 - Mike Mattozzi 2016

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

  initBubblechart();

  initBarchart();
};

function initBubblechart () {
  // Create a bubble node (global because used in update function)
  bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(3);

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
      // Update bubble data and size and update barchart
      updateData(d.code);
      updateBarChart(d.code, getBarData(d. code, EUdata));
    });

  // Add the country codes as test to the bubbles
  node.append("text")
    .attr("dy", ".3em")
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .style("color", "white")
    .text(function(d) { return d.code.substring(0, d.r / 3); });

  d3.select(self.frameElement).style("height", diameter + "px");
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

function getHighestConsumers (data) {

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

// Returns specific countrydata in simple array-format
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

      // Only keep relevant data in array
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

// Initializes barchart but does not make it visible yet
function initBarchart () {
  // Set dimensions for the barchart
  var bar;
  var rects;

  // Set the domain
  var Ydomain = ["wine", "beer", "spirits"];
  // Give non-relevant values to initialize barchart
  barValues = [ "0.1", "0.2", "0.3" ];

  // Show chosen country as title
  svg_bar
    .append("text")
    .attr("class", "chosenCountry")
    .attr("x", margin.left - 50)
    .attr("y", 50)
    .text("");

  // Set Y-scale and -axis
  y = d3.scale.ordinal()
    .domain(Ydomain)
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

  // Add axes to the svg
  svg_bar.append("g")
    .attr("transform", "translate("+ margin.left + "," + margin.top + ")")
    .attr("class", "y axis");
    // .call(yAxis);
  svg_bar.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate("+ margin.left + "," + (chartHeight + margin.top) + ")");
    // .call(xAxis);

  // Set the dimensions for the each bar in barchart
  var bar = svg_bar.selectAll("g").select("bars")
    .data(barValues)
    .enter().append("g")
    .attr("class", "barContainer")
    .attr("opacity", 0)
    .attr("transform", function(d, i) { return "translate("+ margin.left + "," + ((i * barHeight) + margin.top) + ")"; });

  // Add bar with correct data to barchart
  bar.append("rect")
    .attr("width", function(d) { return 0; })
    .attr("height", barHeight - 1)
    .attr("class", "bar")
    .style("cursor","pointer")
    .style("fill", function(d, i) { return barColor(d); });

  // Add label to the X-axis
  svg_bar.append("text")
    .attr("class","x label")
    .attr("transform", "translate(" + (margin.left + (chartWidth / 2)) + " ," + (chartHeight + margin.top + margin.bottom) + ")")
    .attr("opacity", 0)
    .style("text-anchor", "middle")
    .text("Litres per capita in 2013");
}

// Updates the barchart with new data
function updateBarChart (countryCode, barValues) {
  // Re-scale both axes with new data
  x.domain([0, (Math.ceil(d3.max(d3.values(barValues))))]); // Get highest value and round to the integer

  // Change X-axis and show both axes in svg
  svg_bar.select(".x.axis")
    .call(xAxis);
  svg_bar.select(".y.axis")
    .call(yAxis);

  // Show label X-axis
  svg_bar.select(".x.label")
    .attr("opacity", 1);

  // Show bars
  var bar = svg_bar.selectAll(".barContainer")
        .attr("opacity", 1);

  // Change the bar data with new values
  bar.data(barValues);

  // Change bars to new width
  bar.select("rect")
    .transition()
    .duration(800)
    .attr("width", function(d) { return x(d);});

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
    .attr("transform", function(d, i) { return "translate(" + (x(d) + 6) + "," + ((i * barHeight) + (barHeight / 2) + 5) + ")"; })
    .text(function(d) { return d; })
  });

  //
  bar.on("mouseout", function(d) {
    // Set all bars back to their original color
    bar.selectAll("rect")
      .style("opacity", 1);

    // Delete text
    bar.selectAll("text")
      .remove();
  });
}

function onClicked(button) {

  var countryCode;

  switch (button) {
    case "wine":
      countryCode = "FRA";
      console.log("wine");
      break;
    case "beer":
      countryCode = "CZE";
      console.log("beer");
      break;
    case "spirits":
      countryCode = "BLR";
      console.log("spirits");
      break;
  }
}
