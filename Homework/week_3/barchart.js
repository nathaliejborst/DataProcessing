window.onload = function() {

  var data = [4, 8, 15, 16, 23, 42];

  var div = document.createElement("div");
  div.innerHTML = "This is a test";
  document.body.appendChild(div);

  var data; // a global
  d3.json("KNMI_vochtigheid_2015.json", function(error, json) {
  if (error) return console.warn(error);
  data = json;
  visualizeit();
});

console.log("test")

}
