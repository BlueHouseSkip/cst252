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
function fizzBuzz(topNum) {
  let returnArray = Array();
  for(let i=1;i<=topNum;i++) {
    let outStr = "";
    if(i % 3 == 0) outStr += "Fizz";
    if(i % 5 == 0) outStr += "Buzz";
    if(i % 7 == 0) outStr += "Boom";
    if(i % 10== 0) outStr += "Bang";
    outStr == "" ? returnArray.push(i) : returnArray.push(outStr + "!");
  }
  return returnArray;
}

// the printing of the fizzbuzz
$("#go-button").click(function() {
  let fizzInput = $("#fizz-input").val();
  let fizzOutput = fizzBuzz(fizzInput);
  if(checkIfInt(fizzInput)) {
    let outputStr = "";
    for(var i=0;i<fizzOutput.length;i++) {
      outputStr += fizzOutput[i];
      if(i < fizzOutput.length-1) outputStr += "<br>";
    }
    $("#fizzbuzz").html(outputStr);
  } else {
    $("#fizzbuzz").html("That is not a whole number, try again!");
  }
});
