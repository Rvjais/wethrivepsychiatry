+function ($) { "use strict";
	var PaginationDevicePreview = function($el, options) {
		this.$el = $el;
		this.$containers = $el.find('.pagination--device');
		this.options = options;

		this.showDevice();
		this.attachEvents();
    }

    PaginationDevicePreview.prototype.attachEvents = function(){
    	var self = this;

    	$(window).resize(function(){
    		self.showDevice();
    	});
    }

    PaginationDevicePreview.prototype.showDevice = function(){
    	this.$containers.hide();
		var device = this.getDevice();

		this.$el.find('.pagination--' + device).show();
	}

    PaginationDevicePreview.prototype.getDevice = function(){
    	var width = $(window).width();

    	if(width < 768)
    		return 'mobile';

    	if(width < 1024)
    		return 'tablet';

    	return 'desktop';
    }

    var old = $.fn.PaginationDevicePreview;

    $.fn.paginationDevicePreview = function(option) {
        var args = arguments,
            result;

        this.each(function() {
            var $this = $(this);

            var options = $.extend({}, $this.data(), typeof option == 'object' && option);
            var data = '';

            $this.data('PaginationDevicePreview', (data = new PaginationDevicePreview($this, options)));

            if (typeof result != 'undefined') return false;
        });

        return result ? result : this;
    };

    $.fn.paginationDevicePreview.Constructor = PaginationDevicePreview

    $.fn.paginationDevicePreview.noConflict = function () {
        $.fn.paginationDevicePreview = old
        return this
    }

    $(function(){
    	$('[data-control="pagination-device-preview"]').paginationDevicePreview();
    });
}(window.jQuery);

$(document).ready(function(){
    $('.blog__pagination .fancy-pagination .current-page').click(function(){
        $(this).next().toggleClass('active');
    });
});