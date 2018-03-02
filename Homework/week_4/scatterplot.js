// Nathalie Borst
// Data Processing - week 4

window.onload = function() {
  // Set data for the legend
  legendData = [  'Americas', 'Asia Pacific', 'Europe', 'Middle East and North Africa', 'Post-communist', 'Sub Saharan Africa'];
  colorScheme = [ '#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'];

  // Read csv file
  d3.csv('data_week4_csv.csv', function(error, data) {
    // Error checking
    if (error) throw error;

    // Add all data variables to columnNames array and set data
    columnNames = [];
    data.forEach(function(d) {
      columnNames = Object.keys(d);

      // Set details for each data item
      d.country = d[columnNames[0]];
      d.avLife = d[columnNames[1]];
      d.hpi = d[columnNames[2]];
      d.ppp = formatPPP(d);
      d.region = d[columnNames[4]];
      d.color = setColor(d.region);
    });

    // Set margins
    margin = {top:40, right: 300, bottom: 65, left: 70, legend:30};

    // Set dimensions
    width = 1000 - margin.left - margin.right;
    height = 600 - margin.top - margin.bottom;

    // Set scale for X-axis using the GDP/capita ($PPP)
    // Range starts at 2 so dots don't overlap with the axis
    var x = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.ppp; })])
          .range([2, width]),
        xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .outerTickSize(1);

    // Set scale for Y-axis using the Happy Planet Index
    var y = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.hpi; })])
          .range([height, 0]),
        yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .outerTickSize(1);

    // Set dimensions for the plot
    svg = d3.select('body').append('svg')
      .attr('class', 'scatter')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Add tooltip to html
    toolt = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    alDetails = d3.select('body').append('div')
      .attr('class', 'avlife')
      .style('opacity', 0);

    // Add X-axis to plot
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('stroke-width', 0)
      .call(xAxis);

    // Add label to the X-axis
    svg.append("text")
      .attr("class","x label")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 15) + ")")
      .style("text-anchor", "middle")
      .text("GDP/per capita ($PPP)");

    // Add Y-axis to plot
    svg.append('g')
      .attr('class', 'y axis')
      .attr('stroke-width', 0)
      .call(yAxis);

    // Add label to the Y-axis
    svg.append("text")
      .attr("class","y label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Happy Planet Index (HPI)");

    // Add dots at right position to plot
    dot = svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .on('mouseover', dotMouseOverListener)
      .on('mouseout', dotMouseOutListener)
        .attr('class', function(d) { return d.region; })
        .attr('r', function(d) { return ((d.avLife / 43) * 2.9); })
        .attr('cx', function(d) { return x(d.ppp); })
        .attr('cy', function(d) { return y(d.hpi); })
        .style('fill', function(d) { return d.color; });

    // Initialize legend
    setLegend();

    // Add name at bottom
    d3.select('body').append('text')
      .text("Nathalie Borst")
      .attr('transform, translate('+ 5 + ',' + height + ')');
    });
}

// Returns color for every of the 6 regions
function setColor (d) {
  switch(d) {
    case 'Americas':
      return colorScheme[0];
    case 'Asia Pacific':
      return colorScheme[1];
    case 'Europe':
      return colorScheme[2];
    case 'Middle East and North Africa':
      return colorScheme[3];
    case 'Post-communist':
      return colorScheme[4];
    case 'Sub Saharan Africa':
      return colorScheme[5];
    }
}

// Initializes the legend for the plot
function setLegend () {
  // Set dimensions for legend
  legendWidth = 320;
  legendHeight = 180;

  // Define the size of the color block rectangle
  rectSize = (legendHeight) / (legendData.length * 1.5);

  // Append box for legend
  var legend = svg.append('svg')
    .attr('class', 'legend')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('transform', 'translate(' + (width + margin.left + margin.right
      - legendWidth) + ',' + 25 + ')');

  // Add a g element for every legend item
  var item = legend.selectAll('.legend')
      .data(legendData)
      .enter()
      .append('g')
      .attr('transform', function(d, i) {
        var x = 0;
        var y = (i * rectSize * 1.5);
        return 'translate('+ x + ',' + y + ')'; });

  // Add colobox for legend item and add listeners for interactivity
  item.append('rect')
    .attr('width', rectSize)
    .attr('height', rectSize)
    .attr('transform', 'translate(0,0)')
    .attr('class', function(d, i) { return legendData[i]; })
    .style('fill', function(d, i) {return colorScheme[i]; })
    .on('mouseover', legendMouseOverListener)
    .on('mouseout', legendMouseOutListener);

  // Add corresponding text for legend item
  item.append('text')
    .attr('transform', function(d, i) {
    var x = margin.legend;
    var y = rectSize * (3/4);
    return 'translate('+ x + ',' + y + ')'; })
    .text(function(d) { return d; });

  // Add title to legend
  svg.append("text")
    .attr("class","legend label")
    .attr("transform", "translate(" + (width + (legendWidth / 2) + " , 0)"))
    .style("text-anchor", "middle")
    .text("Region");
}

// Returns the GDP/per capita in integer format
function formatPPP (d) {
  var ppp;

  // Check if value is a multiple of thousand
  if(!d[columnNames[3]].includes('.')) {
    ppp = parseInt(d[columnNames[3]].replace('$', ''));
  } else {
    ppp = parseInt(d[columnNames[3]].replace('$', '').replace('.', ''));
  }
  return ppp;
}

// Shows details of selected dot using tooltip
function dotMouseOverListener (d, i) {
  // Show country when mouse is hovered over dot
  toolt.transition()
    .style('opacity', .9);
  toolt	.html(d.country)
    .style('left', (d3.event.pageX) + 'px')
    .style('top', (d3.event.pageY - 28) + 'px');

  // Show average life expectancy when mouse is hovered over dot
  alDetails.transition()
    .style('opacity', .9);
  alDetails.html("Average life expectancy:  " + String(d.avLife))
    .style('left', width + 127 + 'px')
    .style('top', (332) + 'px');
}
// fades out tooltip boxes
function dotMouseOutListener (d, i) {
  toolt.transition()
    .duration(200)
    .style('opacity', 0);
  alDetails.transition()
    .duration(1500)
    .style('opacity', 0);
}

// Changes color of dots of one region
function legendMouseOverListener (d, i) {
  // Get class from item
  var region = (this.getAttribute('class')).replace(/\s/g,'.');

  // Change all dots to grey
  svg.selectAll('circle')
    .style('fill', '#6d6d6d');

  // Set dots that match region to red
  svg.selectAll('.' + region)
    .transition()
    .style('fill', 'red');
}

// Changes every dot and legend items back to it's original color
function legendMouseOutListener (d, i) {
  // Change color of the dots
  svg.selectAll('circle')
    .style('fill', function(d,i) { return d.color; });

  // Change colors of the rectangles in the legend
  rects = svg.selectAll('rect')
      .style('fill', function(d,i) { return colorScheme[i]; });
}
