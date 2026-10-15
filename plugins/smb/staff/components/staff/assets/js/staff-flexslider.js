+function ($) {
    "use strict";

    var StaffSlider = function (element, options) {
        var self = this;
        self.$element = $(element);
        self.options = options;

        var callbacks = {
            start: function (slider) {

                self.fixVerticalSlideSmoothHeight(slider);
                $(window).resize(function () { self.fixVerticalSlideSmoothHeight(slider); });
            },
            before: function () {

            },
            after: function (slider) {
                self.fixVerticalSlideSmoothHeight(slider);
            }
        };

        $.extend(self.options, callbacks);

        self.attachEvents();
        self.initializeSlider();
        function triggerScroll() { setTimeout(function () { $(window).trigger("scroll"); }, 600); }

        return self;
    }

    StaffSlider.prototype.attachEvents = function () {
        var self = this;
        if (self.options.direction === 'vertical') $(window).resize(function () { self.fixVerticalSlideHeight();});
    }

    StaffSlider.prototype.initializeSlider = function () {
        var self = this;
        self.$bxSlider = self.$element.flexslider(self.options);
        if (self.options.direction === 'vertical') self.fixVerticalSlideHeight();
        self.controlsWrap();
    }

    StaffSlider.prototype.controlsWrap = function() {
	    var $flexBullets = this.$element.find('.flex-control-nav'),
			$flexArrowPrev = this.$element.find('.flex-direction-nav .flex-prev'),
			$flexArrowNext = this.$element.find('.flex-direction-nav .flex-next');

		var $controlsWrap = this.$element.parent().find('.staff__controls')

		if ($flexBullets.length) {
			$controlsWrap.append($flexBullets);
			$flexArrowPrev.insertBefore($flexBullets);
			$flexArrowNext.insertAfter($flexBullets);
		} else {
			$controlsWrap.append($flexArrowPrev, $flexArrowNext);
		}

		this.$element.find('.flex-direction-nav').remove();

		if (this.$element.find('.slides li:not(.clone)').length == 1) $controlsWrap.remove();
    }

    StaffSlider.prototype.fixVerticalSlideHeight = function () {
        var self = this,
            maxHeight = 0,
            slides = self.$element.find('.slides');

        slides.children().height('auto').each(function () {
            maxHeight = Math.max(maxHeight, $(this).height());
        }).height(maxHeight);

        slides.height(maxHeight);
    }

    StaffSlider.prototype.fixVerticalSlideSmoothHeight = function (slider) {
        var self = this;
        if (self.options.direction === 'vertical' && self.options.smoothHeight == 1) {
            var activeSlideHeight = $(slider).find('.flex-active-slide > div').height();
            $(slider).find('.flex-viewport').height(activeSlideHeight);
        }
    }

    StaffSlider.DEFAULTS = {
        adaptiveHeight: true,
        easing: null,
        useCSS: false
    }

    var old = $.fn.StaffSlider;

    $.fn.StaffSlider = function (option) {
        var args = arguments, result, obj;

        var $this = $(this);
        var options = $.extend({}, StaffSlider.DEFAULTS, $this.data(), typeof option == 'object' && option);
        var data = '';

        return new StaffSlider(this, options);
    };

    $.fn.StaffSlider.Constructor = StaffSlider

    $.fn.StaffSlider.noConflict = function () {
        $.fn.StaffSlider = old
    }

    $(window).load(function () {
        var $staffSection = $(".js-staff-layout-settings .flexslider");
        if ($staffSection.length) {
            $staffSection.each(function () {
                $(this).StaffSlider();
            });
        }
    });

}(window.jQuery);