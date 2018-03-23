window.onload = function() {
  // Add files to queue
  d3.queue()
    .defer(d3.csv, "Data/EU_consumption_2013.csv")
    .defer(d3.json, "Data/European_alcohol_consumption.json")
    .await(loadData);
}
