// loop through main navigation, define if there are any sub-levels and wrap into container with corresponding class name
// the function is needed because mmenu doesn't provide this functionality, and we need it to style sub-levels differently, with their own color schemes
function navigationSublevelWrap(list, subnavClass) {
	list.each(function() {
		var menuList = $(this),
			depth = menuList.parents('ul').length;

		if (depth > 0) {
			menuList.wrap(function() {
				return '<div class="' + subnavClass + depth + '"></div>';
			});
		}
	});
}