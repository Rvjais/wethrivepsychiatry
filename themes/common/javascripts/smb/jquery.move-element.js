// move element in DOM to the specified place
;(function($) {
	// options
	function moveElement(options) {
		this.options = $.extend({
			place: '',
			move: 'inside', // 'after', 'before' or 'inside'
			setClass: false // set class for element that is moved
		}, options);

		this.init();
	}

	// prototype
	moveElement.prototype = {
		init: function() {
			if (this.options.holder) {
				this.findElements();
				this.setAnchor();
				this.move();
				this.setClass();
			}
		},
		findElements: function() {
			this.elements = {
				holder: $(this.options.holder),
				place: $(this.options.place)
			};
		},
		setAnchor: function() { // used in destroy, helps to return elements to their initial places in DOM
			this.anchorElem = $('<span>');

			this.anchorElem
				.attr('data-anchor-id', this.elements.holder.data('moved-id'))
				.insertBefore(this.elements.holder)
				.css('display', 'none');
		},
		move: function() { // move elements in DOM to the specified place
			var self = this;

			var moveOptions = {
				'after': function() {
					self.elements.holder.insertAfter(self.elements.place);
				},
				'before': function() {
					self.elements.holder.insertBefore(self.elements.place);
				},
				'inside': function() {
					self.elements.place.prepend(self.elements.holder);
				}
			};

			if (typeof moveOptions[this.options.move] !== 'undefined') {
				moveOptions[this.options.move]();
			} else {
				moveOptions.inside();
			}
		},
		setClass: function() {
			if (this.options.setClass) {
				this.elements.holder.addClass(this.options.setClass);
			}
		},
		destroy: function() {
			var self = this;

			self.elements.holder
				.insertAfter(self.anchorElem)
				.removeClass(self.options.setClass)
				.removeData('moveElement');

			self.anchorElem.remove();

			elemArray = []; // empty array to reset data-moved-id counter
		}
	};

	// jquery plugin
	$.fn.moveElement = function(opt) {
		return this.each(function() {
			elemDataIdentifier(this);

			$(this).data('moveElement', new moveElement($.extend(opt, { holder: this })));
		});
	};

	// set data id on elems to improve code reading
	var elemArray = [];

	function elemDataIdentifier(elems) {
		elemArray.push(elems);

		$.each(elemArray, function(i, elem) {
			if (i === elemArray.length - 1) {
				$(elem).attr('data-moved-id', (i + 1));
			}
		});
	}
})(jQuery);