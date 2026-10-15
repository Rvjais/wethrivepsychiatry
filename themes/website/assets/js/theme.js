// page init
;
(function () {
	'use strict';
	var requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (f) {
			return setTimeout(f, 17)
		};

	var cancelAnimationFrame = window.cancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		function (requestId) {
			clearTimeout(requestId);
		};
	/**
	 * Property Decorator constant
	 * @param value
	 * @returns {{enumerable: boolean, value: *}}
	 */

	function constant(value) {
		return {
			enumerable: true,
			value: value
		};
	}

	function mutable(value) {
		return {
			enumerable: true,
			writable: true,
			value: value
		};
	}

	/**
	 * Property Decorator Get/Set
	 * @param getter
	 * @param setter
	 * @returns {{enumerable: boolean, get: *, set: *}}
	 */
	function getterSetter(getter, setter) {
		return {
			enumerable: true,
			get: getter,
			set: setter
		};
	}

	function abstractMethod() {
		throw new Error('This method has not been configured!');
	}

	/**
	 * @param $ {JQueryStatic}
	 */
	jQuery(document).ready(function ($) {
		var $body = $('body'),
			$window = $(window),
			$noPlace = $('<span></span>'),
			noPlace = $noPlace.get(0);
		var $contactForm = $('.contactform').first();

		function throttleResize(callback) {
			var id = 0;

			function throttle() {
				cancelAnimationFrame(id);
				id = requestAnimationFrame(callback);
			}
			return {
				start: function () {
					$window.on('resize', throttle);
				},
				stop: function () {
					$window.off('resize', throttle);
					cancelAnimationFrame(id);
					id = 0;
				}
			};
		}

		function scrollTo($el) {
			return function () {
				var $moduleSticky = $('.ple_module_sticky'), moduleStickyHeight = 0;
				if($moduleSticky.length) $moduleSticky.each(function() { moduleStickyHeight += $(this).outerHeight(true); });

				$('html, body').animate({
					scrollTop: $el.offset().top - moduleStickyHeight
				}, 'slow');
			};
		}

		function getPLESection($target) {
			return $target.closest('.section[data-control="section"]')
		}

		/**
		 * @param {HTMLElement} child
		 * @param {Element} container
		 * @returns {Number}
		 */
		function absoluteOffsetFrom(child, container) {
			var total = 0;
			for (
				var currentChild = child; currentChild && currentChild !== container && container.contains(currentChild); currentChild = currentChild.offsetParent
			) {
				total += currentChild.offsetTop;
			}
			return total;
		}

		function positionOnSection($menuBlock) {
			var menuBlock = $menuBlock.get(0),
				$sectionBlock = getPLESection($menuBlock),
				sectionBlock = $sectionBlock.get(0) || noPlace;
			return function () {
				var relativeParent = menuBlock.offsetParent;
				$menuBlock.css({
					width: $body.width() + 'px',
					left: -relativeParent.getBoundingClientRect().left,
					top: $sectionBlock.outerHeight() - absoluteOffsetFrom(relativeParent, sectionBlock)
				});
			}
		}

		/**
		 * use common script for group menu option
		 * replace the global scope nav menu variables
		 * prepare the menu and add the more button
		*/
		function groupNavMoreButton($el) {
			menuHolder = $el;
			menu = $el.find('.more_nav');
			currentMenu = menu;
			currentMenuWidth = menuHolder.outerWidth(true);
			menuChildrenCount = currentMenu.children().length;
			origMenuContent = '';
			moreButton = $('<li class="navigation__item navigation__item--default has-drop-down more"> <a href="#" class="navigation__item--link">More</a> <ul class="navigation__list navigation__list--sub"></ul> </li>');
			allMenus = [];
			menuPrepare();
			addMoreButton();
		}

		(function NavigationLayoutA() {
			var expandedClass = 'navigation-open',
				megaMenuClass = 'mega-menu',
				expandedSelector = '.' + expandedClass;
			$('.component.navigation .navigation-a').each(function (index, navEl) {
				new DesktopMenu(navEl);
			});

			/**
			 * @param element {Element}
			 * @constructor
			 */
			function DesktopMenu(element) {
				var dis = this;
				var watchingBody = false;
				this.el = element;
				/**
				 * @type {jQuery}
				 */
				this.$el = $(element);
				// call groupNavMoreButton() before manipulation
				this.$el.data("more-button") === 1 ? groupNavMoreButton(this.$el) : '';
				this.$ul = this.$el.children('ul:first-child');
				var $navItems = this.$el.children('ul').children('li');
				var focusTree = {
					prev: function ($a) {
						$a.parent('li').prev('li').children('a').focus();
					},
					next: function ($a) {
						$a.parent('li').next('li').children('a').focus();
					},
					parent: function ($a) {
						$a.parent('li').parent('ul').siblings('a').focus();
					},
					child: function ($a) {
						$a.siblings('ul').find('> li:first-child > a:first-child').focus();
					}
				};

				function isTopRow(el) {
					return dis.$ul.children('li').children('a').is(el);
				}
				var keyboardNav = {
					ArrowDown: function (event, $a) {
						if (isTopRow(event.target)) {
							focusTree.child($a);
						} else {
							focusTree.next($a);
						}
					},
					ArrowUp: function (event, $a) {
						if (!isTopRow(event.target)) {
							focusTree.prev($a);
						}
					},
					ArrowLeft: function (event, $a) {
						if (isTopRow(event.target)) {
							focusTree.prev($a);
						} else {
							focusTree.parent($a);
						}
					},
					ArrowRight: function (event, $a) {
						if (isTopRow(event.target)) {
							focusTree.next($a)
						} else {
							focusTree.child($a);
						}
					}
				};


				this.$el.on('keydown', '.navigation__item--link:focus', function kbEventRouter(event) {
					keyboardNav.hasOwnProperty(event.key) && keyboardNav[event.key](event, $(event.target));
				});


				this.subMenuR = $navItems.toArray().map(function (li) {
					return new((li.classList.contains(megaMenuClass)) ?
						DesktopSubMenuMegaMenu :
						DesktopSubMenuItemDefault
					)(li, dis);
				});

				function offClick(evt) {
					if (!dis.el.contains(evt.target)) {
						dis.closeAll();
					}
				}

				this.watchAfterOpen = function () {
					if (!watchingBody) {
						watchingBody = true;
						$body.on('click touchstart', offClick);
					}
				};

				this.ignoreAfterClose = function () {
					if (watchingBody) {
						watchingBody = false;
						$body.off('click touchstart', offClick);
					}
				};

			}

			Object.defineProperties(DesktopMenu, {});
			Object.defineProperties(DesktopMenu.prototype, {
				hasFocus: getterSetter(function () {
					return Boolean(this.$el.find('a:focus').length);
				}),
				expandedClass: constant(expandedClass),
				expandedSelector: constant(expandedSelector),
				markOpened: constant(function () {
					this.watchAfterOpen();
				}),
				closeAll: constant(function () {
					this.$el.find(this.expandedSelector).removeClass(this.expandedClass);
					this.ignoreAfterClose();
				}),
				watchAfterOpen: mutable(abstractMethod),
				ignoreAfterClose: mutable(abstractMethod)
			});


			/**
			 * @param element {HTMLLIElement}
			 * @param root {DesktopMenu}
			 * @param parent {=DesktopSubMenuItem}
			 * @constructor
			 */
			function DesktopSubMenuItemDefault(element, root, parent) {
				var dis = this;
				this.root = root;
				this.parent = parent || null;
				this.el = element;
				this.$el = $(element);
				this.$a = this.$el.children('a');
				this.$ul = this.$el.children('ul');


				this.$a.on('focus', function () {
					dis.clearExpand();
					dis.expand();
				});
				this.$ul.find('a').last().on('blur', function () {
					dis.contract();
				});

				if (this.$ul.length) {
					this.$el.hover(
						function over() {
							dis.expand();
						},
						function out(evt) {
							dis.contract();
						}
					);
					this.$a.on('touchend', function (evt) {
						if (!dis.isExpanded) {
							dis.clearExpand();
							dis.expand();
							return false;
						}
					});

					this.subMenuR = this.$ul.children('li').toArray().map(function (li) {
						return new DesktopSubMenuItemDefault(li, root, dis);
					});
				} else {
					this.subMenuR = [];
				}

			}
			Object.defineProperties(DesktopSubMenuItemDefault, {});
			Object.defineProperties(DesktopSubMenuItemDefault.prototype, {
				expandedClass: constant(expandedClass),
				expandedSelector: constant(expandedSelector),
				isExpanded: getterSetter(function () {
					return this.el.classList.contains(this.expandedClass);
				}),
				expand: constant(function () {
					this.root.markOpened();
					// Set submenu visible if there is one
					this.$el.addClass(this.expandedClass);
					// echo up the tree
					this.$a.parents('li').addClass(this.expandedClass);
				}),
				contract: constant(function () {
					this.$el.removeClass(this.expandedClass)
						.find(this.expandedSelector).removeClass(this.expandedClass);
				}),
				clearExpand: constant(function () {
					this.root.closeAll();
				})
			});

			/**
			 * @param element {HTMLLIElement}
			 * @param root {DesktopMenu}
			 * @param parent {=DesktopSubMenuItem}
			 * @constructor
			 */
			function DesktopSubMenuMegaMenu(element, root, parent) {
				var dis = this;
				this.root = root;
				this.parent = parent || null;
				this.el = element;
				this.$el = $(element);
				this.$a = this.$el.children('a');
				this.$ul = this.$el.children('ul');
				this.subMenuR = [];

				this.resizeWatcher = throttleResize(function () {
					dis.correctPosition();
				});

				function revealForKBNav() {
					dis.clearExpand();
					dis.expand();
				}
				this.$a.on('focus', revealForKBNav);

				this.$ul.on('focus', 'a', revealForKBNav);
				this.$ul.find('a').last().on('blur', function () {
					dis.contract();
				});


				if (this.$ul.length) {
					this.$el.hover(
						function over() {
							dis.expand();
						},
						function out(evt) {
							dis.contract();
						}
					);
					this.$a.on('touchend', function (evt) {
						if (!dis.isExpanded) {
							dis.clearExpand();
							dis.expand();
							return false;
						}
					});
				}

			}

			Object.defineProperties(DesktopSubMenuMegaMenu, {});
			Object.defineProperties(DesktopSubMenuMegaMenu.prototype, {
				expandedClass: constant(expandedClass),
				expandedSelector: constant(expandedSelector),
				isExpanded: getterSetter(function () {
					return this.el.classList.contains(this.expandedClass);
				}),
				expand: constant(function () {
					this.root.markOpened();
					// Set submenu visible if there is one
					this.$el.addClass(this.expandedClass);
					this.correctPosition();
					this.resizeWatcher.start();
				}),
				correctPosition: constant(function () {
					this.$ul.css({
						width: $body.outerWidth() + 'px',
						left: -(this.$ul.offsetParent().get(0) || $body).getBoundingClientRect().left
					});
				}),
				contract: constant(function () {
					this.$el.removeClass(this.expandedClass);
					this.resizeWatcher.stop();
				}),
				clearExpand: constant(function () {
					this.root.closeAll();
				}),
				resizeWatcher: mutable(null)
			});

		})();

		(function NavigationLayoutB() {
			function NavigationB(nav) {
				var watchingBody = false,
					dis = this;
				var resizeWatcher = throttleResize(function () {
					dis.correctPosition();
				});

				/**
				 * @type {jQuery}
				 */
				this.$el = $(nav);
				this.$button = this.$el.children(NavigationB.buttonSelector).first();
				this.button = this.$button.get(0);
				this.$buttonIcon = this.$button.children(NavigationB.buttonIconSelector).first();
				this.$buttonText = this.$button.children(NavigationB.buttonTextSelector).first();
				this.$navMenu = this.$el.children(NavigationB.navMenuSelector).first();

				function offClick(evt) {
					if (!nav.contains(evt.target)) {
						dis.close();
					}
				}


				this.$button.on('click', function (evt) {
					dis.toggle();
					evt.stopPropagation();
				});
				this.watchAfterOpen = function () {
					if (!watchingBody) {
						watchingBody = true;
						$body.on('click touchstart', offClick);
						resizeWatcher.start();
					}
				};

				this.ignoreAfterClose = function (evt) {
					if (watchingBody) {
						watchingBody = false;
						$body.off('click touchstart', offClick);
						resizeWatcher.stop();
					}
				};

				Object.defineProperties(this, {
					correctPosition: constant(positionOnSection(this.$navMenu))
				});
			}
			Object.defineProperties(NavigationB, {
				buttonSelector: constant('.navigation__button'),
				buttonTextSelector: constant('.navigation__button--text'),
				buttonIconSelector: constant('.navigation__button--icon'),
				buttonIconActiveCSS: constant('is-active'),
				navMenuSelector: constant('.navigation__menu--container'),
				dropDownActiveCss: constant('navigation-open'),
				slideDownClass: constant('slideDown'),
				fadeOutClass: constant('fadeOut')
			});
			Object.defineProperties(NavigationB.prototype, {
				$el: mutable($noPlace),
				$button: mutable($noPlace),
				button: mutable(noPlace),
				$buttonIcon: mutable($noPlace),
				$buttonText: mutable($noPlace),
				$navMenu: mutable($noPlace),
				state: mutable(false),
				busy: mutable(false),
				open: constant(function () {
					var dis = this;
					if (!this.state && !this.busy) {
						this.state = true;
						this.busy = true;
						this.watchAfterOpen();
						this.$button.attr('ariaExpanded', 'true');
						this.$buttonIcon.addClass(NavigationB.buttonIconActiveCSS);
						this.$buttonText.text(this.$buttonText.data('closeDescription'));
						this.$navMenu.addClass(NavigationB.dropDownActiveCss);
						this.$navMenu.addClass(NavigationB.slideDownClass);
						this.button.disabled = true;
						this.$navMenu.one("animationend animationcancel", function () {
							dis.$navMenu.focus();
							dis.$navMenu.removeClass(NavigationB.slideDownClass);
							dis.busy = false;
							dis.button.disabled = false;
						});
						this.correctPosition();
					}
				}),
				close: constant(function () {
					var dis = this;
					if (this.state && !this.busy) {
						this.state = false;
						this.busy = true;
						this.ignoreAfterClose();
						this.$buttonIcon.removeClass(NavigationB.buttonIconActiveCSS);
						this.$buttonText.text(this.$buttonText.data('openDescription'));
						this.$button.attr('ariaExpanded', 'false');
						this.$navMenu.addClass(NavigationB.fadeOutClass);
						this.button.disabled = true;
						this.$navMenu.one("animationend animationcancel", function () {
							dis.$navMenu.removeClass(NavigationB.fadeOutClass);
							dis.$navMenu.removeClass(NavigationB.dropDownActiveCss);
							dis.busy = false;
							dis.button.disabled = false;
						});
					}
				}),
				toggle: constant(function () {
					if (this.state) {
						this.close();
					} else {
						this.open();
					}
				}),
				watchAfterOpen: mutable(Function.prototype),
				ignoreAfterClose: mutable(Function.prototype)
			});

			function ExpandableLink(li) {
				var dis = this;
				/**
				 * @type {JQuery}
				 */
				this.$el = $(li);
				this.$el.data(ExpandableLink.dataAttribute, this);
				this.$siblings = this.$el.siblings(ExpandableLink.identifier);
				this.$a = this.$el.children(ExpandableLink.linkSelector).first();
				this.$ul = this.$el.children(ExpandableLink.subMenuSelector).first();
				this.$button = this.$el.children(ExpandableLink.expansionSelector).first();
				this.$buttonIcon = this.$button.children(ExpandableLink.expansionIconSelector).first();
				this.$buttonText = this.$button.children(ExpandableLink.expansionTextSelector).first();

				this.$button.on('click', function () {
					dis.toggle();
				});
			}
			Object.defineProperties(ExpandableLink, {
				expandedClass: constant('is-active'),
				identifier: constant('.navigation__item.has-sub-items'),
				linkSelector: constant('.navigation__item--link'),
				expansionSelector: constant('.navigation__item--expand'),
				expansionIconSelector: constant('.icon'),
				expansionTextSelector: constant('.sr-only'),
				subMenuSelector: constant('.navigation__list'),
				dataAttribute: constant('ExpandableLink'),
				closeIconClass: constant('icon-minus'),
				openIconClass: constant('icon-plus')
			});
			Object.defineProperties(ExpandableLink.prototype, {
				$el: mutable($noPlace),
				$a: mutable($noPlace),
				$siblings: mutable($noPlace),
				$button: mutable($noPlace),
				$buttonIcon: mutable($noPlace),
				$buttonText: mutable($noPlace),
				state: mutable(false),
				expand: constant(function () {
					if (!this.state) {
						this.state = true;
						this.$button.prop('title', this.closeDescription);
						this.$buttonText.text(this.closeDescription);
						this.$buttonIcon.removeClass(ExpandableLink.openIconClass)
							.addClass(ExpandableLink.closeIconClass);
						this.$el.addClass(ExpandableLink.expandedClass);
						this.$siblings.each(function () {
							/**
							 * @type {ExpandableLink}
							 */
							var expandableLink = $.data(this, ExpandableLink.dataAttribute);
							if (expandableLink) {
								expandableLink.contract();
							}
						});
					}
				}),
				contract: constant(function () {
					if (this.state) {
						this.state = false;
						this.$button.prop('title', this.openDescription);
						this.$buttonText.text(this.openDescription);

						this.$buttonIcon.removeClass(ExpandableLink.closeIconClass)
							.addClass(ExpandableLink.openIconClass);
						this.$el.removeClass(ExpandableLink.expandedClass);
					}
				}),
				toggle: constant(function () {
					if (this.state) {
						this.contract();
					} else {
						this.expand();
					}
				}),
				openDescription: mutable('View more'),
				closeDescription: mutable('View less')
			});

			var navB = $('.component.navigation .navigation-b');
			navB.each(function () {
				new NavigationB(this);
			});
			navB.find(ExpandableLink.identifier).each(function () {
				new ExpandableLink(this);
			});
		})();

		(function NavigationLayoutC() {
			var navC = $('.component.navigation .navigation-c');

			function NavigationC(nav) {
				var watchingBody = false,
					dis = this;
				var resizeWatcher = throttleResize(function () {
					dis.correctPosition();
				});
				/**
				 * @type {jQuery}
				 */
				this.$el = $(nav);
				this.$button = this.$el.children(NavigationC.buttonSelector).first();
				this.button = this.$button.get(0);
				this.$buttonIcon = this.$button.children(NavigationC.buttonIconSelector).first();
				this.$buttonText = this.$button.children(NavigationC.buttonTextSelector).first();
				this.$navMenu = this.$el.children(NavigationC.navMenuSelector).first();

				function offClick(evt) {
					if (!nav.contains(evt.target)) {
						dis.close();
					}
				}

				this.$button.on('click', function (evt) {
					dis.toggle();
					evt.stopPropagation();
				});
				this.watchAfterOpen = function () {
					if (!watchingBody) {
						watchingBody = true;
						$body.on('click touchstart', offClick);
						resizeWatcher.start();
					}
				};

				this.ignoreAfterClose = function (evt) {
					if (watchingBody) {
						watchingBody = false;
						$body.off('click touchstart', offClick);
						resizeWatcher.stop();
					}
				};
				Object.defineProperties(this, {
					correctPosition: constant(positionOnSection(this.$navMenu))
				});
			}
			Object.defineProperties(NavigationC, {
				buttonSelector: constant('.navigation__button'),
				buttonTextSelector: constant('.navigation__button--text'),
				buttonIconSelector: constant('.navigation__button--icon'),
				buttonIconActiveCSS: constant('is-active'),
				navMenuSelector: constant('.navigation__menu--container'),
				dropDownActiveCss: constant('navigation-open'),
				slideDownClass: constant('slideDown'),
				fadeOutClass: constant('fadeOut')
			});
			Object.defineProperties(NavigationC.prototype, {
				$el: mutable($noPlace),
				$button: mutable($noPlace),
				button: mutable(noPlace),
				$buttonIcon: mutable($noPlace),
				$buttonText: mutable($noPlace),
				$navMenu: mutable($noPlace),
				state: mutable(false),
				busy: mutable(false),
				open: constant(function () {
					var dis = this;
					if (!this.state && !this.busy) {
						this.state = true;
						this.busy = true;
						this.watchAfterOpen();
						this.$button.attr('ariaExpanded', 'true');
						this.$buttonIcon.addClass(NavigationC.buttonIconActiveCSS);
						this.$buttonText.text(this.$buttonText.data('closeDescription'));
						this.$navMenu.addClass(NavigationC.dropDownActiveCss);
						this.$navMenu.addClass(NavigationC.slideDownClass);
						this.button.disabled = true;
						this.$navMenu.one("animationend animationcancel", function () {
							dis.$navMenu.focus();
							dis.$navMenu.removeClass(NavigationC.slideDownClass);
							dis.busy = false;
							dis.button.disabled = false;
						});
						this.correctPosition()
					}
				}),
				close: constant(function () {
					var dis = this;
					if (this.state && !this.busy) {
						this.state = false;
						this.busy = true;
						this.ignoreAfterClose();
						this.$buttonIcon.removeClass(NavigationC.buttonIconActiveCSS);
						this.$buttonText.text(this.$buttonText.data('openDescription'));
						this.$button.attr('ariaExpanded', 'false');
						this.$navMenu.addClass(NavigationC.fadeOutClass);
						this.button.disabled = true;
						this.$navMenu.one("animationend animationcancel", function () {
							dis.$navMenu.removeClass(NavigationC.fadeOutClass);
							dis.$navMenu.removeClass(NavigationC.dropDownActiveCss);
							dis.busy = false;
							dis.button.disabled = false;
						});
					}
				}),
				toggle: constant(function () {
					if (this.state) {
						this.close();
					} else {
						this.open();
					}
				}),
				watchAfterOpen: mutable(Function.prototype),
				ignoreAfterClose: mutable(Function.prototype)
			});

			navC.each(function () {
				new NavigationC(this);
			});
		})();


		(function Searchbar() {
			var searchbar = $('.searchbar-a');

			function SearchbarA(sbar) {
				var watchingBody = false,
					dis = this;
				var resizeWatcher = throttleResize(function () {
					dis.correctPosition();
				});
				/**
				 * @type {jQuery}
				 */
				this.$el = $(sbar);
				this.$button = this.$el.find(SearchbarA.buttonSelector).first();
				this.button = this.$button.get(0);
				this.$closeButton = this.$el.find(SearchbarA.closeButtonSelector).first();
				this.closeButton = this.$button.get(0);
				this.$flyout = this.$el.find(SearchbarA.flyoutSelector).first();
				this.$searchInput = this.$flyout.find(SearchbarA.searchInputSelector).first();

				function offClick(evt) {
					if (!sbar.contains(evt.target)) {
						dis.close();
					}
				}

				this.$button.on('click', function (evt) {
					dis.toggle();
					evt.stopPropagation();
				});
				this.$closeButton.on('click', function (evt) {
					dis.close();
					evt.stopPropagation();
				});
				this.watchAfterOpen = function () {
					if (!watchingBody) {
						watchingBody = true;
						$body.on('click touchstart', offClick);
						resizeWatcher.start();
					}
				};

				this.ignoreAfterClose = function (evt) {
					if (watchingBody) {
						watchingBody = false;
						$body.off('click touchstart', offClick);
						resizeWatcher.stop();
					}
				};
				Object.defineProperties(this, {
					correctPosition: constant(positionOnSection(this.$flyout))
				});
			}
			Object.defineProperties(SearchbarA, {
				buttonSelector: constant('.searchbar-a__btnsearch'),
				closeButtonSelector: constant('.searchbar-a__closeflyoutbtn'),
				dropDownActiveCss: constant('searchbar-open'),
				flyoutSelector: constant('.searchbar-a__flyout'),
				searchInputSelector: constant('[name="query"]'),
				slideDownClass: constant('slideDown'),
				fadeOutClass: constant('fadeOut')
			});
			Object.defineProperties(SearchbarA.prototype, {
				$el: mutable($noPlace),
				$button: mutable($noPlace),
				button: mutable(noPlace),
				$closeButton: mutable($noPlace),
				closeButton: mutable(noPlace),
				$flyout: mutable($noPlace),
				$searchInput: mutable($noPlace),
				state: mutable(false),
				busy: mutable(false),
				open: constant(function () {
					var dis = this;
					if (!this.state && !this.busy) {
						this.state = true;
						this.busy = true;
						this.watchAfterOpen();
						this.$button.attr('ariaExpanded', 'true');
						this.$flyout.addClass(SearchbarA.dropDownActiveCss);
						this.$flyout.addClass(SearchbarA.slideDownClass);
						this.button.disabled = true;
						this.$flyout.one("animationend animationcancel", function () {
							dis.$searchInput.focus();
							dis.$flyout.removeClass(SearchbarA.slideDownClass);
							dis.busy = false;
							dis.button.disabled = false;
						});
						this.correctPosition();
					}
				}),
				close: constant(function () {
					var dis = this;
					if (this.state && !this.busy) {
						this.state = false;
						this.busy = true;
						this.ignoreAfterClose();
						this.$button.attr('ariaExpanded', 'false');
						this.$flyout.addClass(SearchbarA.fadeOutClass);
						this.button.disabled = true;
						this.$flyout.one("animationend animationcancel", function () {
							dis.$flyout.removeClass(SearchbarA.fadeOutClass);
							dis.$flyout.removeClass(SearchbarA.dropDownActiveCss);
							dis.busy = false;
							dis.button.disabled = false;
						});
					}
				}),
				toggle: constant(function () {
					if (this.state) {
						this.close();
					} else {
						this.open();
					}
				}),
				watchAfterOpen: mutable(Function.prototype),
				ignoreAfterClose: mutable(Function.prototype)
			});

			searchbar.each(function () {
				new SearchbarA(this);
			});
		})();

		// Provide a mobile view
		(function MobileView($desktopContactForm) {
			var $mobileSection;
			/**
			 * @typedef MobileSectionClusterItem
			 * @property {JQuery} $el - Element to be inserted
			 * @property {Node} source
			 *
			 * @type MobileSectionClusterItem[]*/
			var mobileSectionCluster = [];
			var x21MobileClass = 'x21-mobile-controls';
			var $desktopNav = $('.section-navigation-mobile, .section-navigation-mobile--no-hide')
				.find('.component.navigation')
				.find('.navigation-a, .navigation-b, .navigation-c').first();
			var $desktopPhone = $('.section-phone-mobile .phone__container').find('.phone__number').first();
			var $desktopMap = $('.map__container').first();

			if ([$desktopNav, $desktopPhone, $desktopContactForm, $desktopMap].every(function isEmpty($el) {
					return $el.length === 0;
				})) {
				return;
			}

			if ($desktopNav.length) {

				$mobileSection = $('<div class="' + x21MobileClass + ' d-md-none sticky-top"></div>').prependTo($body);

				(function MmenuButton() {
					var $mobileNav, $menuButton, mmenuAPI;
					$mobileNav = $desktopNav.clone();

					// Remove any buttons
					$mobileNav.find('button').remove();

					// Strip call classes
					$mobileNav.removeClass().addClass('d-md-none').find('ul, li, a').removeClass();
					$desktopNav.addClass('d-none d-md-block');

					// Build the menu button
					$menuButton = $(
						'<button type="button" title="Show Navigation Menu">' + (
							'<i aria-hidden="true" class="icon icon-bars"></i><span> Menu</span>') +
						'</button>'
					).appendTo($mobileSection);

					// Initialize MMenu Plugin
					$mobileNav.mmenu({
						extensions: ['pagedim-black'],
						counters: true,
						navbars: [{
							position: 'top',
							content: ['prev', 'title', 'close']
						}, {
							position: 'top',
							content: ['searchfield']
						}]
					});

					mmenuAPI = $mobileNav.data('mmenu');

					// Bind the menu button to the API
					$menuButton.on('click', function () {
						mmenuAPI.open();
					});
				})();
			}

			function mobileLinkTemplate(classSubName, description, icon, href) {
				var $el = $('<div class="' + x21MobileClass + '__' + classSubName + '"></div>');
				var $link = $('<a title="' + description + '" class="btn btn-link">' + (
					'<i class="icon ' + icon + '" aria-hidden="true"></i>' +
					'<span class="sr-only">' + description + '</span>'
				) + '</a>').attr('href', href).appendTo($el);
				return {
					$el: $el,
					$link: $link
				};
			}

			if ($desktopPhone.length) {
				mobileSectionCluster.push(((function PhoneLink($selector) {
					var sectionId = getPLESection($selector).attr('id') || '';
					// Valid separators are (-.), valid digits are 0-9
					// See: https://tools.ietf.org/html/rfc3966#section-3 'global-number-digits'
					var tel = $selector.text().trim().replace(/([^0123456789\-.()])/g, '');
					var template = mobileLinkTemplate('phone', 'Call', 'icon-phone', 'tel:+' + tel);
					return {
						$el: template.$el,
						source: $selector.get(0)
					};
				})($desktopPhone)));
			}

			function mobileAnchorLink($selector, classSubName, description, icon) {
				var sectionId = getPLESection($selector).attr('id') || '';
				var template = mobileLinkTemplate(classSubName, description, icon, '#' + sectionId);
				template.$link.on('click', scrollTo($selector));
				return {
					$el: template.$el,
					source: $selector.get(0)
				};
			}

			if ($desktopMap.length) {
				mobileSectionCluster.push(mobileAnchorLink(
					$desktopMap, 'location', 'Location', 'icon icon-location-arrow'
				));
			}

			if ($desktopContactForm.length) {
				mobileSectionCluster.push(mobileAnchorLink(
					$desktopContactForm, 'contact-us', 'Contact Us', 'icon-envelope-o'
				));
			}

			if (mobileSectionCluster.length) {
				mobileSectionCluster.sort(function (a, b) {
					return a.source.compareDocumentPosition(b.source) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
				}).reduce(function ($target, value) {
					return $target.append(value.$el);
				}, $('<div class="' + x21MobileClass + '__quick-links"></div>')).appendTo($mobileSection);
			}
		})($contactForm);

		// Add Browserlock
		(function BrowserLock($target) {
			if ($target.length) {
				// Create ContactForm lock
				var $contactFormLock = $('<div>')
					.addClass('contactform-lock');

				// Add ContactForm click event
				$contactFormLock.on('click', scrollTo($target));

				// Draw browser lock containers, prepend to body
				var $lockContainer = $('<div>')
					.addClass('browser-lock')
					.append($contactFormLock);

				$('body').prepend($lockContainer);
			}
		})($contactForm);

		// Preview link fix
		(function cleanUpRedactorLinks() {
			// Check if we're in an iFrame or not (editor mode or preview link)
			if (self != top)
				return;

			var link = $('link[rel=canonical]').attr('href');
			if (link != undefined) {
				var parts = link.split('/'),
					index = parts.indexOf('my.martindalenolo.com');
				if (index >= 0) {
					var siteId = parts[index + 1];
					if (!siteId)
						return;

					var $links = $('div[data-component-name=editable] a[data-source-type=my-pages]');
					if ($links == undefined || $links.length == 0)
						return;

					$links.each(function () {
						var currentLink = $(this).attr('href');

						// Check for edge-case of absolute my-page
						var index = currentLink.split('/').indexOf(siteId);
						if (index >= 0)
							return;

						var newLink = '/' + siteId + currentLink;
						$(this).attr('href', newLink);
					})
				}
			}
		})();
		var $bttButton = $('.ple__back-to-top');
		(function setBrowserlock() {
			var hiddenClasses = 'hidden hidden--l hidden--m hidden--s';
			var rawSettings = $('#ple-data-json').text();
			var settings = JSON.parse(rawSettings);
			var browserlockSettings = settings.fixedSection;

			//#SMBWMGR-8501 this check can be removed after merging - /editor/merge_requests/1922
			if (typeof browserlockSettings !== 'undefined' && browserlockSettings !== null) {

				var $browserLockContainer = $('#' + browserlockSettings.id).find('.ple__browserlock-modules');
				var $browserLockModules = $browserLockContainer.find('> .row .row');
				if (!browserlockSettings.backToTop) {
					$bttButton.addClass(hiddenClasses);
				}

				if (browserlockSettings.spacing.space == 'custom' && browserlockSettings.spacing.offsetDistance && parseInt(browserlockSettings.spacing.offsetDistance) != NaN) {
					$browserLockModules.each(function (index, element) {
						$(element).css({
							marginBottom: browserlockSettings.spacing.offsetDistance
						});
					});
				}

				if (browserlockSettings.placement.place != null) {
					switch (browserlockSettings.placement.place) {
						case 'center-right':
							$browserLockContainer.css({
								bottom: 'auto',
								top: '50%',
								transform: 'translateY(-50%)'
							});
							break;

						case 'bottom-right':
							$browserLockContainer.css({
								top: 'auto'
							});

							if (parseInt(browserlockSettings.placement.offsetDistance) != NaN && !browserlockSettings.placement.useDefaultOffset) {
								$browserLockContainer.css({
									bottom: browserlockSettings.placement.offsetDistance
								});
							}
							break;

						case 'top-right':
						default:
							$browserLockContainer.css({
								bottom: 'auto'
							});

							if (parseInt(browserlockSettings.placement.offsetDistance) != NaN && !browserlockSettings.placement.useDefaultOffset) {
								$browserLockContainer.css({
									top: browserlockSettings.placement.offsetDistance
								});
							}
							break;
					}
				}
			} else {
				console.log("browserlock Settings is undefinded")
			}
		})();

		(function backToTop() {
			var activeClass = 'active';
			var showPoint = 400;

			$bttButton.on('click', function (event) {
				event.preventDefault();

				$([document.documentElement, document.body]).animate({
					scrollTop: 0
				}, 1000);
			});

			$(window).scroll(function () {
				var window_x = $(window).scrollTop();
				if (window_x >= showPoint) {
					$bttButton.addClass(activeClass);
				} else {
					$bttButton.removeClass(activeClass);
				}
			});
		})();

		(function scrollToContactForm() {
			var $ctaEl = $('.scrollToContactForm .cta__button'), $target = $(".contactFormSection");
			$ctaEl.each(function() { $(this).removeAttr("href"); $(this).on('click', scrollTo($target));});
    	})();

		(function featuredBlocksEqualizeHeights() {
			var maxHeight = 0,
				$fbContainer = $('.featuredblocks-grid-e'),
				$fbItems = $fbContainer.find('.featuredblock__item');

			$fbItems.children().height('auto').each(function () {
				maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
			}).height(maxHeight);

			$fbItems.css('min-height', maxHeight + 'px');
			$fbContainer.addClass('blockTransitionNone');
		})();

		(function objectFitIEFix() {
			var isIE = /*@cc_on!@*/false || !!document.documentMode, // Internet Explorer 6-11
			isEdge = !isIE && !!window.StyleMedia; // Edge 20+
			// Check if Internet Explorer 6-11 OR Edge 20+
			if(isIE || isEdge) {
				var $container = $('.wrap__where_is_your_pain').find(".image"),
					imgUrl = $container.find("img").prop("src");
				if (imgUrl) {
				  $container.css("backgroundImage", 'url(' + imgUrl + ')').addClass("custom-object-fit");
				}
			}
		})();

		(function mobileHeader() {

			function mobileHeaderInit() {

				var $mhContainer = $('.mobileHeader-container'),
				mhHeaight = $mhContainer.height(),
				$navButton = $('#mobileHeaderNavBtn'),
				$navMenu = $('#mobileHeaderNav'),
				$homeIcon = $(".mobileHeader-homeIcon"),
				$formIcon = $(".formIconLink"),
				$mapIcon = $(".locIconLink"),
				$phoneIcon = $(".phoneIconLinkExpand"),
				$mapContainer = $('.map__container').first(),
				$formContainer = $('.form__container').first(),
				$locList = $('.location-list'),
				$pleMSticky = $(".ple_module_sticky"),
				navAPI;

				// if there is no form module in the view target the contactform module
				if(!$formContainer.length) $formContainer = $('.contactform__container').first();

				// if sticky module is present set top space to the first elem for the mobileHeader
				if ($pleMSticky.length) {
					var $pleMStickEl = $pleMSticky.first().find('.container');
					$(window).resize(function (){
						mhHeaight = $mhContainer.height();
						$pleMStickEl.css('padding-top', mhHeaight);
					});
				}

				if($navMenu.children().length) {
				// init mMenu
				$navMenu.mmenu({
					extensions: ['pagedim-black'],
					counters: true,
					navbars: [{
					position: 'top',
					content: ['prev', 'title', 'close']
					}]
				});
				// bind menu button 
				navAPI = $navMenu.data('mmenu');
				$navButton.on('click', function () {
					navAPI.open();
				});
				}

				// handle click events for the icons
				($formContainer.length) ? $formIcon.click(scrollToEl($formContainer)) : $formIcon.fadeOut();
				($mapContainer.length) ? $mapIcon.click(scrollToEl($mapContainer)) : $mapIcon.fadeOut();
				$phoneIcon.click(function () { $locList.addClass("expand"); });
				$('.mobileHeader-locWrap').find('.icon-times').click(function () { $locList.removeClass("expand"); });

				// replace the mm title with the home icon  
				if($homeIcon.length) {
					$(".mobileHeader-homeIcon .mm-homeIcon").insertBefore($('#mobileHeaderNav .mm-navbar-top .mm-title'));
				}

				// set the section bg class
				if($mhContainer.is('[class*=section__bg]')){
					var classList = $mhContainer.prop("classList");
					$.each(classList, function(index, item) {
					if (item.startsWith("section__bg")) {
							$navMenu.addClass(item);
						}
					});
				}

				$( window ).load(function() {
					alignLogo();
				});

				$( window ).resize(function() {
					alignLogo();
				});
								
			}

			// align logo with if only navigation is present or only one icon is present on the right hand side
			function alignLogo() {
				if (!$('.mobileHeader-form').length && !$('.mobileHeader-location').length && !$('.mobileHeader-phone').length && $('#mobileHeaderNavBtn').length) {
					var hamburgerMenuWidth = $('.mobileHeader-navigation #mobileHeaderNavBtn').outerWidth(true);
					$('.mobileHeader-logo').css('margin-right', hamburgerMenuWidth);
				}
				if (($('.mobileHeader-form').length || $('.mobileHeader-location').length || $('.mobileHeader-phone').length) && !$('#mobileHeaderNavBtn').length) {
					var totalWidthIcons = $('.mobileHeader-form').width() + $('.mobileHeader-location').width() + $('.mobileHeader-phone').width();
					if(totalWidthIcons < 46) {
						$('.mobileHeader-logo').css('margin-left', totalWidthIcons);
					}
				}
			}

			function scrollToEl($el) {
				return function () {
				var $moduleSticky = $('.ple_module_sticky'), moduleStickyHeight = 0;
				if ($moduleSticky.length) $moduleSticky.each(function () { moduleStickyHeight += $(this).find('.container').outerHeight(true); });
				if (moduleStickyHeight == 0) moduleStickyHeight = $('.mobileHeader-container').height();
				$('html, body').animate({ scrollTop: $el.offset().top - moduleStickyHeight }, 'slow');
				};
			}

			if ($('.mobileHeader-container').length) mobileHeaderInit();

		})();	

		(function leadsFormTxtAreaExpand() {
			if ($(".form").length) {
				$("body").on("SMBLeadsFormReady", function () {
					var form = $(".contact-us-im .form");
					form.each(function () {
						var formGroup = $(this).find('.form__group').not('.form-input-comments, .form-input-message');
						formGroup.wrapAll("<div class='outerWrap' />");
					});
				});
			}
		})();	

		(function hideEmptyPeerReview() {
			$(window).load(function () {
				if (!$('.isEditor').length) {
					
					var $clientRC = $('#mh-client-rating-container'),
						$ratingC = $('#mh-rating-container');
		
					setTimeout(function () {
						if ($clientRC.length && $ratingC.length) {
							if ($clientRC.is(':empty') && $ratingC.is(':empty')) {
								$ratingC.closest('.stacked').hide();
							}
						} else {
							if (!$clientRC.length && !$ratingC.length) {
								$('.comp-peerreview').closest('.stacked').hide();
							}
							if ($clientRC.is(':empty') || $ratingC.is(':empty')) {
								$ratingC.closest('.stacked').hide();
								$clientRC.closest('.stacked').hide();
							}
						}
					},1600);
				}
			});
		})(); 

	});
})();