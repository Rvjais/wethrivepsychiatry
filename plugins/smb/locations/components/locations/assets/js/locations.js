+function ($) {
  "use strict";

  $(window).load(function () {
     
     $('.locations .flexslider').flexslider({
      animation: "slide",
      slideshowSpeed: 5000,
      animationDuration: 700,
      smoothHeight: false,
      controlNav: true,
      directionNav: false,
      allowOneSlide: true,      
    });   
  });

}(window.jQuery);
