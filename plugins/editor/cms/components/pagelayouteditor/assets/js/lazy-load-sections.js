+function ($) {
	"use strict";

	$(function () {
		/**  @type {{forEach: function(function(Element, number?, any?):void):void}} */
		var lazyloadBgImages = document.querySelectorAll('.section-lazy');
		if (!('forEach' in lazyloadBgImages)) {
			// Have to convert nodeList to array because not all supported browsers have a 'forEach' on NodeLists
			lazyloadBgImages = $.makeArray(lazyloadBgImages);
		}
		/** @type {function (Element, number?): void} */
		var nodeAction;

		/**
		 * @param {Element} section
		 */
		function removeClass(section) {
			section.classList.remove('section-lazy');
		}

		if ('IntersectionObserver' in window) {
			nodeAction = (function () {
				var imageObserver = new IntersectionObserver(watcher, {rootMargin: '0px 0px 134% 0px'});
				function watcher(entries, observer) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting || entry.intersectionRatio !== 0) {
							var section = entry.target;
							removeClass(section);
							observer.unobserve(section);
						}
					});
				}

				return function (image) {
					imageObserver.observe(image);
				};
			})();
		} else {
			nodeAction = (function () {
				var count = 0, autoLoadDistance = window.innerHeight * 2;
				/** @type {function (Element?): boolean} */
				var isInView = function (el) {
					var inView = autoLoadDistance >= el.getBoundingClientRect().top;
					// Reduce Repaint calculations if out of view by caching result, since we are traversing linearly
					if (!inView) isInView = alwaysFalse;
					return inView;
				};
				function alwaysFalse() { return false; }

				return function (el) {
					if (isInView(el)) {
						removeClass(el);
					} else {
						setTimeout(function () {removeClass(el);}, (count += 1) * 300);
					}
				};
			})();
		}

		lazyloadBgImages.forEach(nodeAction);
	})
}(window.jQuery);
