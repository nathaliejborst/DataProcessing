window.onload = function() {
  // Initialize variables for axis-labels
  var labelsY = ["Dec", "Nov", "Oct", "Sep", "Aug", "Jul", "Jun", "May", "Apr", "Mar", "Feb", "Jan"];
  var labelsX = [];
  yearlyAverage = 0;

  // Get the json data from file
  d3.json("KNMI_vochtigheid_2015.json", function(data) {
    setUpGraph(getMonthlyRates(data), labelsY, data);
  });

function setUpGraph (dataX, dataY, jsonArray) {
  // Set up margins so there is room for the axis labels
  var margin = {
    top: 30,
    right: 25,
    bottom: 55,
    left: 70
  };

  console.log(yearlyAverage);


  // Set width, height and barheight
  width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom,
    barHeight = height / dataY.length

  // Set bounds for X-axis
  var x = d3.scale.linear()
    .domain([0, 100])
    .range([0, width]);

  // Set bounds for Y-axis
  var y = d3.scale.ordinal()
    .domain(dataY)
    .rangePoints([(barHeight * dataY.length) - (barHeight) , 0]);

  // Set dimensions for the graph
  var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 30)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set the dimensions for the each bar in barchart
  var bar = svg.selectAll("g").select("bars")
      .data(dataX)
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

  // Add bar with correct data to barchart
  bar.append("rect")
      .attr("width", 0)
      .attr("height", barHeight - 1)
      .attr("class", "bar")
      .attr("fill", "steelblue");

  // Add animation when loading the page
  bar.selectAll("rect")
  .transition()
  .duration(1200)
  .attr("width", x);

  svg.append("line")
    .attr("x1", x(yearlyAverage))
    .attr("y1", 0)
    .attr("x2", x(yearlyAverage))
    .attr("y2", height)
    .attr("stroke-width", 2)
    .style("stroke", "red");

   // Add text with yearly average and set textcolor to white
  svg.append("text")
  .attr("class","yearlyAverage")
  .attr("y", 0 - margin.top)
  .attr("x", x(yearlyAverage) - 70)
  .attr("dy", "1em")
  .text("Yearly average: " + yearlyAverage)
  .attr("fill", "white");

  // Add listeners on hover on line
  averageLine = svg.selectAll("line");
  averageLine.on("mouseover", lineOverListener);
  averageLine.on("mouseout", lineOutListener);

  // Set text 'visible' on hover, else 'invisble'
  function lineOverListener(d, i) {
    d3.select(".yearlyAverage")
      .transition()
      .attr("fill", "red");
  }
  function lineOutListener(d, i) {
    d3.select(".yearlyAverage")
      .transition()
      .duration(1700)
      .attr("fill", "white");
  }


  //Set Y-axis to show bar labels
  var yAxis = d3.svg.axis()
      .scale(y)
      .tickSize(0)
      .orient("left");
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (0) + "," + (barHeight / 2) + ")")
      .call(yAxis)

  // Manually add line for Y-axis
  svg.append("line")
    .attr("x1", x(0))
    .attr("y1", 0)
    .attr("x2", x(0))
    .attr("y2", height)
    .style("stroke", "black");

  //Set X-axis to show bar labels
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(20);
  svg.append("g")
    .attr("transform", "translate(" + 0 + "," + (barHeight * dataX.length) + ")")
    .attr("class","x axis")
    .call(xAxis);

  // Add label to the Y-axis
  svg.append("text")
    .attr("class","y label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Months 2015");

  // Add label to the X-axis
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
    .style("text-anchor", "middle")
    .text("Humidity (in %)");


  // Set all bars to unclicked by default
  barsClicked = new Array(dataY.length).fill(false);

  // Add interaction
  bar.on("mouseover", mouseOverListener)
      .on("mouseout", mouseOutListener)
      .on("click", barClickedListener);
}

// Changes color and shows data on mouse over
function mouseOverListener(d, i) {
  // Check first if bar is already clicked
  if(!barsClicked[i]) {
    d3.select(this)
    .append("text").style("pointer-events", "none")
      .attr("x", 2)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .style('fill', 'white')
      .text(function(d) { return d; });
    d3.select(this).select("rect")
    .transition()
    .attr("fill", "red");
    barClicked = false;
  }
}

// Changes color and shows data on click
function barClickedListener(d, i) {
  if(!barsClicked[i]) {
    // Set clicked bar to true
    barsClicked[i] = true;

    // Change stye and attributes of bar
    d3.select(this)
    .append("text").style("pointer-events", "none")
      .attr("x", 2)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .style('fill', 'white')
      .text(function(d) { return d; });
    d3.select(this).select("rect")
    .transition()
    .attr("fill", "red");
  } else {
    // Set clicked bar to false
    barsClicked[i] = false;

    d3.select(this)
    .select("text")
    .remove();
    d3.select(this).select("rect")
    .transition()
    .attr("fill", "steelblue");
    }
  }

// Changes bar style back to default on mouse over
function mouseOutListener(d, i) {
  if(!barsClicked[i]) {
    d3.select(this)
    .select("text").remove();
    d3.select(this).select("rect")
    .transition()
    .attr("fill", "steelblue");
    }
}

// Returns a list of the average humidity rate per month
function getMonthlyRates (jsonData) {
  // Set current month to first data point
  var currentMonth = 0;
  var monthHumidities = [];

  var dayCount = 0;
  var averageRate = 0;


  // Loop over all data values
  for(var i = 0; i < jsonData.length; i+= 1) {
    // Get month
    var month = String(jsonData[i].YYYYMMDD).substring(4,6);

    // Change values per day
    averageRate += parseInt(jsonData[i].UG);
    dayCount += 1;
    yearlyAverage += parseInt(jsonData[i].UG);

    // Check if new month
    if (currentMonth != month ) {
      // Add corresponding humidity rate to list
      monthHumidities.push(parseFloat((averageRate / dayCount)).toFixed(2));
      labelsX.push(parseFloat((averageRate / dayCount)).toFixed(2));

      // Reset average and daycount at beginning of new month
      averageRate = 0;
      dayCount = 0;

      // Change new month to current
      currentMonth = month;
    }
  }
  // Set total yearly average
  yearlyAverage = parseFloat((yearlyAverage / jsonData.length)).toFixed(2);
  return monthHumidities;
  }
}
