/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/


// Function to tell if the input is actually a whole number
function checkIfInt(num) {
  if(parseInt(num) == num) {
    return true
  } else {
    return false;
  }
}
//
//functioning fizzbuzz
function Vehicle(make, model, year, color, details) {
  this.make = make;
  this.model = model;
  this.year = year;
  this.color = color;
  this.details = details;
  this.info = function() {
    return "Make: " + this.make + "<br>Model: " + this.model + "<br>Year: " + this.year +
    "<br>Color: " + this.color + "<br>Details: " + this.details;
  }
}

var jetta =     new Vehicle("Volkswagen", "Jetta", 2014, "Blue", "Heated seats");
var cherokee =  new Vehicle("Jeep", "Cherokee", 1999, "Red", "Cracked windshield");
var accord =    new Vehicle("Honda", "Accord", 2006, "Gray", "N/A");
var beetle =    new Vehicle("Volkswagen", "Beetle", 2010, "Pink", "Fuzzy steering wheel");
var bus=        new Vehicle("Volkswagen", "Bus", 2014, "Blue", "Heated seats");

$("#output").html(jetta.info() + "<br>------------------<br>" + cherokee.info() +
"<br>------------------<br>" + accord.info() + "<br>------------------<br>"
+ beetle.info() + "<br>------------------<br>" + bus.info())
