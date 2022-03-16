/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/


//
//non-copyright infinging names
function sortingCap(name) {
  let nameMod = name.length % 4;
  let houseStr;
  if        (nameMod == 0) {
    houseStr = "Sphinxian";
  } else if (nameMod == 1) {
    houseStr = "Chimeratan";
  } else if (nameMod == 2) {
    houseStr = "Mantichore";
  } else if (nameMod == 3) {
    houseStr = "Kelpiasht";
  }
  return houseStr;
}

$("#go-button").click(function() {
  console.log("clicked");
  let home = sortingCap($("#name-input"));
  $("#home-output").text(home);
});

//Changes the color of the buttons to match the background color of the page every 50 miliseconds.
