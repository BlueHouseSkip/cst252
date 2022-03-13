/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/


//
for(let i=0;i<$(".rainbow-toggle").length;i++) {
  $(".rainbow-toggle").eq(i).click(function () {
      $(".rainbow-toggle").eq(i).parent().toggleClass("rainbow-text");
    });
}

//Changes the color of the buttons to match the background color of the page every 50 miliseconds.
function updateButtonColor() {
  let color = $("body").css("background-color");
  let textColor = $("#title").css("color");
  $(".rainbow-toggle").css("background-color", color);
  $(".rainbow-toggle").css("color", textColor);
  return;
};
setInterval(updateButtonColor, 50);
