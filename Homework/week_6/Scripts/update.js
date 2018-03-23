/**
  * Updates the bubble position and size
  * Source: http://jsfiddle.net/CCRb5/
  */
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

  // Re-append node with new data for every country
  var node = svg.selectAll(".node")
    .data(bubble.nodes(classes(newData)).filter(function (d){return !d.children;}),
    function(d) {return d.className} );

  // Re-append g nodes
  var nodeEnter = node.enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y +
      ")"; });

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
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y +
      ")"; });

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

/**
  * Returns specific countrydata in simple array-format
  */
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

/**
  * Updates the barchart with new data
  */
function updateBarChart (countryCode, barValues) {
  // // Get highest value and round to the integer to get new X-domain
  x.domain([0, (Math.ceil(d3.max(d3.values(barValues))))]);

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
    .attr("transform", function(d, i) { return "translate(" + (x(d) + 6) + ","
      + ((i * barHeight) + (barHeight / 2) + 5) + ")"; })
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
