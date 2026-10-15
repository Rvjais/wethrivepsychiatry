/*
 * jQuery desktopDropNav plugin - prepare desktop nav for usage with Accordion plugin
 */
;(function($) {
	$.fn.desktopDropNav = function(o){
		// default options
		var options = $.extend({
			openCloseClass: 'open-close',
			openerClass: 'opener',
			slideClass: 'slide'
		},o);

		return this.each(function(){
			if(!!$(this).find('ul').length) {
				$(this).find('ul').each(function() {
					var elemParent = $(this).closest('li');

					elemParent.addClass(options.openCloseClass).children('div').addClass(options.slideClass);
					createBlock('<span>', options.openerClass, elemParent.children('a'));
				});
			}
		});
		
		function createBlock(element, className, place) {
			$(element).addClass(className).appendTo(place);
		}
	};
})(jQuery);