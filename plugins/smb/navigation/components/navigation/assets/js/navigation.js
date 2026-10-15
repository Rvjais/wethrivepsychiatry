(function($) {
    "use strict";

    //SMBWMGR-7625- hide mmenu before init on theme level
    const navStyle = $('<style type="text/css">.mm-menu.mm-offcanvas { display: none; }</style>');
    $('html > head').append(navStyle);

    function initNavs() {
        // add title attributes to mobile menu (mm-menu) no text links - SMBWMGR-3784
        $("nav.mm-menu a.mm-prev").each(function() {
            const title = $(this).parent().find("a.mm-title").text();
            $(this).attr("title", title);
        });
        $("nav.mm-menu a.mm-next").each(function() {
            const title = $("> a[data-title]", $(this).parent()).data('title');
            $(this).attr("title", title);
        });
        if ($("nav.mm-menu a.mm-close").length > 0) {
            $("nav.mm-menu a.mm-close").attr("title", 'Close');
        }

        closeToTheEdge();
    }

    // New instance
    $(document).ready(function() {
        //sticky nav
        $("[data-sticky-header]").closest('.js-sticky-nav').sticky({ topSpacing: 0 });

        $('.navigation__item.more').click(function(e) {
            e.preventDefault();
        });

        $('.more_nav--loading').removeClass('more_nav--loading');
        initNavs();
    });

    $(window).load(function () {
        initNavs();
    });

    function closeToTheEdge() {
        /* Add sub item class if too close to edges */
        const $navA = $('.navigation-a');
        if ($navA.length) {
            $('.navigation-a > .navigation__list > .navigation__item.has-drop-down').on('mouseenter mouseleave', function(e) {

                const $this = $(this);
                const $navListChildItem = $this.find('> .navigation__list--sub');
                const $navListChildSubItem = $navListChildItem.find('> .navigation__item.has-drop-down > .navigation__list--sub');
                const $navListGrandChildSubItem = $navListChildSubItem.find('> .navigation__item.has-drop-down > .navigation__list--sub');
                const widthChildItem = $navListChildItem.outerWidth(true);
                const navListSub_offsetLeft = $this.offset().left;
                const buffer = 60;
                let navListSub_width = 0;

                let maxWidthChildSubItem = 0;
                $($navListChildSubItem).each(function() {
                    const thisW = $(this).outerWidth(true);
                    if (thisW > maxWidthChildSubItem) { maxWidthChildSubItem = thisW; }
                });

                let maxWidthGrandChildSubItem = 0;
                $($navListGrandChildSubItem).each(function() {
                    const thisW = $(this).outerWidth(true);
                    if (thisW > maxWidthGrandChildSubItem) { maxWidthGrandChildSubItem = thisW; }
                });

                navListSub_width = (widthChildItem + maxWidthChildSubItem + maxWidthGrandChildSubItem) - $this.outerWidth(true);

                const offsetRight = ($(document).width() - (navListSub_offsetLeft + $this.outerWidth(true) + buffer));
                const isEntirelyVisible = (offsetRight > navListSub_width);

                if (isEntirelyVisible) {
                    $this.removeClass('near-edge');
                } else {
                    $this.addClass('near-edge');
                }
            });
        }
    }

})(window.jQuery);
