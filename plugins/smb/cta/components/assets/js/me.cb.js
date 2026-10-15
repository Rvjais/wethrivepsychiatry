+function ($) { "use strict";
	var ColorBoxModal = function($el, options) {
		this.$el = $el;
        this.$parent = $el.closest('.cta');
        this.options = options;
        this.ctaVideo = "";

        this.initColorbox();
	}

    ColorBoxModal.prototype.initColorbox = function(){
        var self = this;

        self.$parent.find(".lb-class").each(function () {
            $(this).colorbox($.extend(ColorBoxModal.defaults, $($(this).attr("href")).data()));
        });

        $(document).bind('cbox_complete', {context: this}, this.cboxOpenCallBack);
        $(document).bind('cbox_closed', {context: this}, this.cboxClosedCallBack);
    }

    ColorBoxModal.prototype.cboxOpenCallBack = function(event){
        event.data.context.formSizeHandler(event);
        event.data.context.videoLoadHandler(event);
    }

    ColorBoxModal.prototype.cboxClosedCallBack = function(event) {
        var currElemId = $.colorbox.element().attr('href');
        
        $(currElemId + ' [data-setup-run]').each(function(){
            $(this).remove();
        });
    }

    ColorBoxModal.prototype.formSizeHandler = function(event) {
        var currElemId = $.colorbox.element().attr("href"),
        $currElemForm = $(currElemId).find("form");

        var observer = new MutationObserver(function (mutations) {
            $.colorbox.resize();
        });

        var target = document.querySelector($currElemForm.selector);
        
        if (target != null) {
            observer.observe(target, {
                attributes: true
            });
        }
    }

    ColorBoxModal.prototype.videoLoadHandler = function(event) {
        var currElemId = $.colorbox.element().attr('href');

        if($(currElemId + ' [data-setup-run]').length){
            event.data.context.ctaVideo = $(currElemId + ' [data-setup-run]')[0].outerHTML;
            $(currElemId + ' [data-setup-run]').remove();
        }

        if(event.data.context.ctaVideo){
            $(currElemId + ' .video').append($(event.data.context.ctaVideo));
                
            var $video = $(currElemId + ' [data-setup-run]');
            videojs($video[0], $video.data('setupRun'), function(){});
        }
    }

    ColorBoxModal.defaults = {
        inline: true,
        width: "50%",
        transition: "fade",
        returnFocus: false,
        className: 'ctaColorBox'
    }

    $.fn.colorBoxModal = function(option) {
        var args = arguments,
            result;

        this.each(function() {
            var $this = $(this);

            var options = $.extend({}, $this.data(), typeof option == 'object' && option);
            var data = '';

            $this.data('ColorBoxModal', (data = new ColorBoxModal($this, options)));

            if (typeof result != 'undefined') return false;
        });

        return result ? result : this;
    };

    $.fn.colorBoxModal.Constructor = ColorBoxModal

    $.fn.colorBoxModal.noConflict = function () {
        $.fn.colorBoxModal = old
        return this
    }

    $(document).ready(function(){
    	$('[data-control="colorbox-modal"]').colorBoxModal({});
    });
}(window.jQuery);