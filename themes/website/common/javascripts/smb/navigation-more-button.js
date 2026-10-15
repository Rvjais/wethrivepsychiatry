$(document).ready(function () {
	// declare global variables and prepare the data to work with
	window.menuHolder = $('.navigation').not('.mm-menu');
	window.menuHolderMaxWidth = 100;
	window.menu = $('.more_nav').not('.mm-listview');
	window.currentMenu = menu;
	window.currentMenuWidth = window.menuHolder.outerWidth();
	window.menuChildrenCount = currentMenu.children().length;
	window.origMenuContent = '';
	window.moreButton = $('<li class="navigation__item has-child more"> <a href="#">More</a> <ul class="navigation__list--sub"></ul> </li>');

	// the array will store the menu's content and corresponding width variations, later it will be used by addMoreButton() func
	window.allMenus = [];
});

// prepare menu variations and store them in window.allMenus
function menuPrepare() {
	// store original menu for future use before menu preparations are started
	if(!origMenuContent.length) origMenuContent = menu.html(); // if menuPrepare called again, the origMenuContent shouldn't be changed anyway

	// set max width on menu holder for correct calculation, menuHolderMaxWidth is used as a final calculation point
	menuHolder.css('width', menuHolderMaxWidth);

	// add the full menu before any child is removed
	allMenus.push([currentMenu.html(), Math.round(calcTotalMenuItemsWidth())]);

	// iterate through all menu items, calculate total menu widths with all items, and store the data in window.allMenus
	for(var i=0; i <= menuChildrenCount; i++) {
		// check and remove moreButton which is added before menuItemsWidth
		if(!!moreButton.length) { 
			moreButton.remove();
		}
		// remove the menu's last child before menuItemsWidth
		var tempItem = currentMenu.children('li:last').remove();
		// re-add more button to re-calculate common menu width again, minus removed tempItem
		currentMenu.append(moreButton);
		// calculate total width of all menu items
		var menuItemsWidth = calcTotalMenuItemsWidth();
		// add removed items into more button content
		moreButton.children('ul').prepend($(tempItem));
		// store the menu's content and corresponding width variations in allMenus array
		allMenus.push([currentMenu.html(), Math.round(menuItemsWidth)]); // Math.round is needed to help browsers (like Chrome) correctly deal with decimal numbers
	}

	// remove max width for menu holder, so the menu is back to its initial current size
	menuHolder.css('width', '');
}

// calculate total width of all menu items and return the width
function calcTotalMenuItemsWidth() {
	var width = 0;
	currentMenu.children().each(function() {
		width += $(this)[0].getBoundingClientRect().width; // getBoundingClientRect() is needed to help browsers (like Chrome) get correct width, then later work with it
	});
	return width;
}

// add more navigation on page
function addMoreButton() {
	for(var i=0; i <= menuChildrenCount; i++) {
		// add the more menu variation that fits the rule
		if(currentMenuWidth <= allMenus[0][1] && currentMenuWidth >= allMenus[i][1]) { // pick the more menu variation that fits the rule
			currentMenu.empty(); // remove previous menu
			currentMenu.append(allMenus[i][0]); // add the more menu variation that fits the rule
			return;
		}
		// revert to original nav if items fit into main nav
		if(currentMenuWidth > allMenus[0][1]) {
			currentMenu.empty();
			currentMenu.append(origMenuContent);
			return;
		}
	}
}