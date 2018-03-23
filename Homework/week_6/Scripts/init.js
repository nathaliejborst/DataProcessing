/**
* Specify all the global variables for dimensions and aesthetics
*/
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

legendBubbledia = 10;

barHeight = 40;
chartHeight = 120;
chartWidth = 260;

/**
 * Adds svg's to html
 */
function initSVGs () {
  /**
   * Add the svg for the bubble chart to the html (global because used in init
   * function)
   */
  svg_legend = d3.select("body").append("g").append("svg")
    .attr("width", width + margin.left + margin.right + 300)
    .attr("height", (height / 8))
    .attr("class", "legend");

  // Add svg to show charts under legend
  svg_chart =  d3.select("body").append("g").append("svg")
    .attr("width", 1000)
    .attr("height", diameter + margin.top + margin.bottom);

  /**
   * Add the svg for the bubble chart to the html (global because used in init
   * and update function)
   */
  svg = svg_chart.append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

  /**
   * Add the svg for the bubble chart to the html (global because used in init
   * and update function)
   */
   svg_bar = svg_chart.append("svg")
    .attr("x", diameter + margin.right)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "details");
}

/**
 * SHows source and name
 */
function initCredits () {
  // Data to be shown
  var creditText = ["Nathalie Borst", "Data Processing", "week 7", "Datasource: WHO European Data Warehouse"];

  // Add svg to html
  var svg_credits = svg_chart.append("svg")
   .attr("x", 10)
   .attr("y", diameter + margin.bottom)
   .attr("width", 250)
   .attr("height", 75)
   .attr("class", "credits");

  // Append text to html
  var cr = svg_credits.selectAll(".iets")
    .data(creditText)
    .enter().append("g")
    .attr("class", "legendBubble")
    .attr("transform", function(d, i) { return "translate(" +
      5 + "," + ((10 * i) + 10) + ")"; });
  cr.append("text")
    .text(function(d) { return d;});
}

/**
 * Initializes and shows bubble chart with correct data
 */
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

/**
 * Shows legend
 */
function initLegend () {
  var legendColors = ["#f48f42", "#249ee5"];
  var legendText = ["EU-members", "non EU-members"]

  var g = svg_legend.selectAll(".legendBubble")
    .data(legendColors)
    .enter().append("g")
    .attr("class", "legendBubble")
    .attr("transform", function(d, i) { return "translate(" +
      ((i * 150) + 30) + "," + 10 + ")"; });

  // Add circles with right color
  g.append("circle")
    .attr("r", legendBubbledia)
    .style("cursor","pointer")
    .style("fill", function(d, i) { return legendColors[i]; })
    .on("mouseover", function(f, i) {
      // Make non-selected circles less opaque on hover
      svg.selectAll("circle").each(function(d){
        if (d.packageName == "EU_members") {
          if (i == 1) {
            (d3.select(this)).attr("opacity", 0.3);
          }
        }
        if (d.packageName == "non-EU_members") {
          if (i == 0) {
            (d3.select(this)).attr("opacity", 0.3);
          }
        }
      });
    })
    .on("mouseout", function(f, i) {
      // Change bubbles to full opacity on mouse out
      svg.selectAll("circle").each(function(d){
        (d3.select(this)).attr("opacity", 1);
      });
    });

  // Add text to circles
  g.append("text")
    .attr("x", 20)
    .attr("y", (legendBubbledia / 2))
    .text(function(d, i) { return legendText[i]; });
}

/**
  * Initializes barchart but does not make it visible yet
  */
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
