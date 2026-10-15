+(($) => {
	// This isn't actually a redactor plug in. I'm not sure why it's here -- FRG 2022-1-22
	"use strict";


class LinkToSection {
	constructor($el) {
		this.$el = $el;
		this.init();
	}

	init() {
		this.bindToOffsetToAnchors();
	}

	bindToOffsetToAnchors() {
		this.$el.on('click', 'a[href^="#"]', (event) => {
			const target = event.target;
			if (!target) return;
			const hash = decodeURI(target.hash).slice(1);
			if (!hash) return;
			const targetEl = document.getElementById(hash);
			if (!targetEl) return;
			this.animateToAnchor($(targetEl));
		});
	}

	animateToAnchor($linkEl, stickyHeight) {
		stickyHeight ??= this.getStickySectionsHeight();
		$('html, body').animate({
			scrollTop: $linkEl.offset().top - stickyHeight
		}, 'slow');
	}

	getStickySectionsHeight() {
		return PLEStickyState?.getStickySectionsHeight() ?? 0;
	}

	static dataAttribute = 'linkToSection';
}

	$(() => {
		for (const el of document.querySelectorAll('.editable__container')) {
			const el$ref = $(el);
			el$ref.data(LinkToSection.dataAttribute, new LinkToSection(el$ref));
		}
	});
})(window.jQuery);
