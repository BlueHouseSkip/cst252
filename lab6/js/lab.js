/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/

 var myTransport = ["Jetta", "feet", "bike", "bus", "light-rail"];
 var myMainRide = {
   make:"Volkswagen",
   model:"Jetta",
   color:"navy blue",
   year:2014
 };
 console.log("test");
 document.writeln("My Main Ride: <pre>",
    JSON.stringify(myMainRide, null, '\t'), "</pre>");
