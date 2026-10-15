+ function($) {
    "use strict";

    $(document).ready(function() {
        $(function() {
            $(".staff-content__accordion").accordion({
                heightStyle: "content",
                collapsible: true,
                icons: false,
                active: false
            });
        });
    });

}(window.jQuery);
