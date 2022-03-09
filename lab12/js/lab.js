/**
 * Author:    me
 * Created:   2022.2.20
 *
 * CC0
 **/


for(let i=0;i<$(".rainbow-toggle").length;i++) {
  $(".rainbow-toggle").eq(i).click(function () {
      $(".rainbow-toggle").eq(i).parent().toggleClass("rainbow-text");
    });
}
