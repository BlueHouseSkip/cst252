/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/


var outputEl = document.getElementById('output');

var oneEl = document.createElement('button');
var twoEl = document.createElement('button');

oneEl.innerHTML = "button 1";
twoEl.innerHTML = "button 2";
oneEl.id = "button1";
twoEl.id = "button2";
oneEl.style.color = "red";
twoEl.style.color = "yellow";
oneEl.style.backgroundColor = "black";
twoEl.style.backgroundColor = "red";

outputEl.appendChild(oneEl);
outputEl.appendChild(twoEl);
