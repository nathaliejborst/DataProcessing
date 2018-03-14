window.onload = function() {

  var ISOdata;
  var EUdata;
  var EUjson;

  bubbleColor = d3.scale.ordinal().range(["#f48f42", "#249ee5"]);

  console.log("color", bubbleColor(0))
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
    margin = {top: 10, right: 30, bottom: 10, left: 50};
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
        showBarchart(d.code, EUdata);
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

  function showBarchart (countryCode, barData) {

    var barHeight = 25;
    var countryDetails = {};
    var country;
    var chartHeight = 100;

    var testArray = [];

    barData.forEach(function (d) {
      // Find country in EU dataset
      if (countryCode === d.Code) {
        // Get full namd of country
        country = d.Country_name;

        // Add alcohol details of country to data array
        countryDetails = {
          "wine": d.Wine,
          "beer": d.Beer,
          "spirits": d.Spirits,
          "total": d.Total
        };
      }
    })

    console.log(countryDetails);


    // Show chosen country as title
    svg_bar.selectAll(".chosenCountry")
      .data(countryCode)
      .enter()
      .append("text")
      .attr("class", ".chosenCountry")
      .attr("x", margin.left)
      .attr("y", 50)
      .text(country)
      .style("font-family", "monospace")
      .style("font-size", "20px")
      .style("fill", "black");

    var Ydomain = ["wine", "beer", "spirits"]

    var y = d3.scale.ordinal()
      .domain(["wine", "beer", "spirits"])
      .rangeRoundBands([0, chartHeight], .05);
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .outerTickSize(2);

    svg_bar.append("g")
    .attr("transform", "translate(100, 100)")
    .attr("class", "y axis")
    .call(yAxis);



    var barDataa = ["2", "3.2", "0.7", "5"];

    // // Set the dimensions for the each bar in barchart
    // var bar = svg_bar.selectAll("g").select("bars")
    //   .data(barDataa)
    //   .enter()
    //   .append("g")
    //   .attr("x", margin.left)
    //   .attr("transform", function(d, i) { return "translate(" + margin.left + "," + ((i * barHeight) + margin.top) + ")"; });
    //
    // // Add bar with correct data to barchart
    // bar.append("rect")
    //   .attr("width", function(d, i) { return (d * 15); })
    //   .attr("height", barHeight - 2)
    //   .attr("class", "bar")
    //   .attr("fill", "steelblue");


  }


  // Returns the average total alcohol consumption
  function getAverage(data) {
    EUaverage = 0;

    data.forEach(function(d) {
      EUaverage += Number(d.TOTAL);
    })
    return EUaverage /= data.length;
  }
}
