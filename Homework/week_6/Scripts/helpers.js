/**
* Loads country data from json and csv-files
*/
function loadData(error, file1, file2) {
  if (error) return;
  EUdata = file1;
  EUjson = file2;

  // Initialize both charts and svg's
  initSVGs();
  initCredits();
  initLegend();
  initBubblechart();
  initBarchart();


  // Set actions for button click
  var highestConsumers = getHighestConsumers();
  handleButtonClick(highestConsumers);

};

/**
* Returns an ordered non-tree like structure off all countries
*/
function classes(EUjson) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size, code: node.code});
  }
  recurse(null, EUjson);

  return {children: classes};
}

/**
 * Selects the right country for each button when clicked
 */
function handleButtonClick (highestConsumers) {
  // Get buttons from html
  var buttons = d3.selectAll(".btn-primary");
  var countryCode;

  // Select right country
  buttons.on("click",function(d,i) {
    var category = (d3.select(this)).attr("id");

    switch (category) {
      case "wine":
        countryCode = highestConsumers[0]
        break;
      case "beer":
        countryCode = highestConsumers[1]
        break;
      case "spirits":
        countryCode = highestConsumers[2]
        break;
    }

    updateData(countryCode);
    updateBarChart(countryCode, getBarData(countryCode, EUdata));

  });

}




/**
 * Returns array with countries with the highest consumption of wine, beer and
 * spirits
 */
function getHighestConsumers () {
  // Initialize variables to find countries with highest consumption
  highestConsumers = new Array(3);
  var wine = 0;
  var beer = 0;
  var spirits = 0;

  // Loop over all the data to get the highest consumer for each category
  EUdata.forEach(function (d) {
    if (d.Wine > wine) {
      wine = d.Wine;
      highestConsumers[0] = d.Code;
    }
    if (d.Beer > beer) {
      beer = d.Beer;
      highestConsumers[1] = d.Code;
    }
    if (d.Spirits > spirits) {
      spirits = d.Spirits;
      highestConsumers[2] = d.Code;
    }
  })
  return highestConsumers;
}
