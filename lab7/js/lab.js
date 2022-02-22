/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/

// get input from user
function getUserName() {
  return prompt("Please enter your name:");
}
//split the string into an array, sort the array, join the array into a string.
function sortString(inputString) {
  return inputString.split('').sort().join('');
}
// print to the document
document.write(sortString(getUserName()));
