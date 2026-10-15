// check if drop down fits in main parent container, and add class if it doesn't
// !IMPORTANT: works only with first drop down level
;(function($) {
	// options
	function dropdownFit(options) {
		this.options = $.extend({
			dropDown: '>li>ul',
			fitClass: 'set-right'
		}, options);

		this.init();
	}

	// prototype
	dropdownFit.prototype = {
		init: function() {
			this.findElements();
			this.detectOffset();
		},
		findElements: function() {
			this.holder = $(this.options.holder),
			this.dropdown = this.holder.find(this.options.dropDown),
			this.dropdownParent = this.dropdown.parents('li');
		},
		detectOffset: function() {
			var self = this,
				holderWidth = self.holder.width(),
				holderOffset = self.holder.offset().left;

			self.dropdownParent.each(function() {
				if (Math.round($(this).offset().left) >= holderOffset) {
					var test = (Math.round($(this).offset().left) - holderOffset) + self.dropdown.width();
					if (holderWidth <= test) {
						$(this).addClass(self.options.fitClass);
					}
				}
			});
		},
		destroy: function() {
			this.dropdownParent.removeClass(this.options.fitClass);
			this.holder.removeData('dropdownFit');
		}
	};

	// jquery plugin
	$.fn.dropdownFit = function(opt) {
		return this.each(function() {
			$(this).data('dropdownFit', new dropdownFit($.extend(opt, { holder: this })));
		});
	};
})(jQuery);