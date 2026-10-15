// setClassOnHover
;(function($){
	// options
	function setClassOnHover(options) {
		this.options = $.extend({
			hoverElem: '>li', // specify which element will trigger setClassOnHover function
			setOnElem: 'body', // specify element on which class will be set
			hoverClass: 'active' // specify class name that will be set on element
		}, options);

		this.init();
	}

	// prototype
	setClassOnHover.prototype = {
		init: function() {
			this.findElements();
			this.controlClass();
		},
		findElements: function() {
			this.holder = $(this.options.holder),
			this.hoverElem = this.holder.find(this.options.hoverElem),
			this.setOnElem = $(this.options.setOnElem);
		},
		controlClass: function() {
			var self = this;

			// detect device type
			var isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
				isWinPhoneDevice = /Windows Phone/.test(navigator.userAgent);

			// define events
			var eventOn = (isTouchDevice && 'touchstart') || (isWinPhoneDevice && navigator.pointerEnabled && 'pointerdown') || (isWinPhoneDevice && navigator.msPointerEnabled && 'MSPointerDown') || 'mouseenter';

			if(isTouchDevice || isWinPhoneDevice) { // if mobiles
				// prevent default
				preventHandler = function(e) {
					e.preventDefault();
				};
				
				this.hoverElem.on(eventOn, function() {
					var toggleOff = function(e) {
						var target = $(e.target);
						
						if (!target.is(self.hoverElem) && !target.closest(self.hoverElem).length) {
							self.hoverElem.off('click', preventHandler);
							$(document).off(eventOn, toggleOff);
							self.setOnElem.removeClass(self.options.hoverClass);
						}
					};

					if(!self.setOnElem.hasClass(self.options.hoverClass)) {
						self.hoverElem.one('click', preventHandler);	
						$(document).on(eventOn, toggleOff);
						self.setOnElem.addClass(self.options.hoverClass);
					}
				});
			} else { // if not mobiles
				this.hoverElem.hover(function() {
					self.setClass();
				},
				function() {			
					self.deleteClass();
				});
			}
		},
		setClass: function() {
			if(!this.setOnElem.hasClass(this.options.hoverClass)) return this.setOnElem.addClass(this.options.hoverClass);
		},
		deleteClass: function() {
			if(this.setOnElem.hasClass(this.options.hoverClass)) return this.setOnElem.removeClass(this.options.hoverClass);
		}
	};

	// jquery plugin
	$.fn.setClassOnHover = function(opt) {
		return this.each(function() {
			$(this).data('setClassOnHover', new setClassOnHover($.extend(opt, { holder: this })));
		});
	};
})(jQuery);