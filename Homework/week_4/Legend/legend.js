window.onload = function() {

  // Set margins
  var margin = {top:20, right: 10, bottom: 10, left: 10, text: 35};

  // Specify data for the legend
  legendData = ["0-1", "1-2", "2-3", "3-4", "4-5", ">5"];
  colorData = ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"];

  // Set width and height of legend
  width = 150;
  height = 250;
  rectSize = (height - margin.top - margin.bottom) / (legendData.length * 2);

  // Create svg
  svg = d3.select("#legend").append("svg")
    .data(legendData)
    .attr("width", width)
    .attr("height", height);

  // Add box for each legend item
  var legend = svg.selectAll('.legend')
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var x = 0;
      var y = i * ((height - margin.top - margin.bottom)/legendData.length) + margin.top;
      return 'translate(' + x + ',' + y + ')';
      });

  // Add colobox for legend item
  legend.append('rect')
    .attr('width', rectSize)
    .attr('height', rectSize)
    .attr('x', 0)
    .attr('y', 0)
    .attr("transform", "translate(" + 0 + "," + 0 + ")")
    .style('fill', function(d, i) { return colorData[i]; });

  // Add corresponding text for legend item
  legend.insert('text')
    .attr("transform", "translate(" + margin.text + "," + (rectSize * (3/4)) + ")")
    .text(function(d) { return d; });
}
