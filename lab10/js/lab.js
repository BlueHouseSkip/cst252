/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/

var nameEl = document.getElementById("name-text");
var buttonEl = document.getElementById("fix-button");
var inputEl = document.getElementById("name-input");

buttonEl.addEventListener("click", function () {
    let tempName = inputEl.value;
    tempName = tempName.split('').sort().join('');
    console.log(tempName);
    nameEl.innerHTML = tempName;
});
