/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/
var buttonEl = $("<button></button>");
buttonEl.html("Press me for cool things");
buttonEl.click(function() {
  alert("No it wasnt anything cool it was just an alert. sorry");
});
buttonEl.css("background-color", "green");
buttonEl.css("color", "lightblue");
buttonEl.css("width", "20%");
buttonEl.css("margin", "50px");
$("#js-output").append(buttonEl);
