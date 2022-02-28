/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/

var a = [123,12,5,26,1,46,341,753,8,9,548,2,65,7,46,3,512,5,31,23,534,45,6,456,31,5,4,344,7,4,5,32];

function mathPow2(x) {
    return Math.pow(x,2);
}

document.write(a.map(mathPow2) + "\n\n");

document.write(a.map(function(x) {
    return Math.pow(x,5);
}));
