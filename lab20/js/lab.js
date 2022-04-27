var url = "https://xkcd.com/info.0.json";
var domain = "https://cataas.com";

function getAjax () {
	// Using the core $.ajax() method
  $.ajax({
      // The URL for the request
      url: url,
      // The data to send (will be converted to a query string)
      //data: { id: 123},
      // Whether this is a POST or GET request
      type: "GET",
      // The type of data we expect back
      dataType : "json",
  })
  // If the request succeeds
  .done(function( data ) {
  		fullUrl = domain + data.url;
      //alert("Success!");
      console.log(data);
      $("#output").append("<h1>" + data.title + "</h1>");
      $("#output").append("<img scr=" + data.img + "></img>");
      $("#output").append("<h5>" + data.alt + "</h5>");
  })
  // If the request fails
  .fail(function( xhr, status, errorThrown ) {
      console.log(errorThrown + " Status:" + status );
  });
}

$("#press-me").click(getAjax);

$("#clear").click(function () {
	$("#output").empty()
})
