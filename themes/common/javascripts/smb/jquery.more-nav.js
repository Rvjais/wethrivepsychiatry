// Android/WinPhone fix - forcing resize event on orientationchange (sometimes it doesn't trigger, and in the way we can force it)
var mql = window.matchMedia('(orientation: portrait)');

if (mql) {
	mql.addListener(function(m) {
		$(window).trigger('resize');
	});
}



// init moreNav helper - re-initiate content wrapper for more nav content
function moreNav() {
	var menu = $('.navigation'),
		menuList = menu.find('ul'),
		subnavClass = 'sublevel-';

	// check if menuList exists and if its parent is div
	if (menuList.length && menuList.children('.more').find('ul').parent().is('div')) {
		var moreNavList = menuList.children('.more').find('ul'),
			moreNavListChildren = moreNavList.parent('div').children();

		// remove parent from moreNavLists
		moreNavListChildren.unwrap();

		// reinit correct wrapping for more nav content
		moreNavList.each(function() {
			var moreNavList = $(this),
				depth = moreNavList.parents('ul').length;

			if (depth > 0) {
				moreNavList.wrap(function() {
					return '<div class="' + subnavClass + depth + '"></div>';
				});
			}
		});
	} else if (menuList.length && !menuList.children('.more').find('ul').parent().is('div')) {
		var moreNavChildren = menuList.children('.more').find('ul');

		// reinit correct wrapping for more nav content
		moreNavChildren.each(function() {
			var moreNavChildren = $(this),
				depth = moreNavChildren.parents('ul').length;

			if (depth > 0) {
				moreNavChildren.wrap(function() {
					return '<div class="' + subnavClass + depth + '"></div>';
				});
			}
		});
	}

	// remove default behavior from More link
	menuList.children('.more').on('click', '> a', function(e) {
		e.preventDefault();
	});
}