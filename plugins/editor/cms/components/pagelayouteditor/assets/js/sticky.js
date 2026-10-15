;(()=>{
    'use strict';
    // Only Run Once.
    if (window.PLEStickyState) return;
    /**
     * The Globally Available PLEStickyElements Meta information.
     * Note: this is intentionally var, as we are defining a global.
     * @var {WeakMap.<HTMLElement, StickyState>} PLEStickyElements
     */
    window.PLEStickyElements ??= new WeakMap();

    // Detect a new HTML Standard that may have added these properties to the constructors.
    const depPropConflict = {
        isSticky: 'isSticky' in HTMLElement.prototype || 'isSticky' in Element.prototype
        , exTop: 'exTop' in HTMLElement.prototype || 'exTop' in Element.prototype
    };
    if (depPropConflict.isSticky || depPropConflict.exTop) {
        console.error(
            `
<hr/><hr/><hr/>
exTop and isSticky have been found on HTMLElement or Element, conflicting with our deprecated properties!<br/>
isSticky: ${depPropConflict.isSticky}<br/>
exTop: ${depPropConflict.exTop}<br/>
Any Non-migrated Sticky functionallity is now broken!!!
<hr/><hr/><hr/>
`
        );
    }

    class StickyState {
        /** @type {WeakMap.<HTMLElement, StickyState>} */
        static states = window.PLEStickyElements;
        /** @readonly */
        static stickySectionSelector = '.ple_module_sticky';
        /** @readonly */
        static containerSelector = '.container';

        /**
         * @param {HTMLElement|StickyHTMLElement} el
         * @return {StickyState}
         */
        static findOrNew = (el) => {
            let stickyState = this.states.get(el);
            if (!stickyState) {
                stickyState = new StickyState();
                this.states.set(el, stickyState);
            }
            // Copy Deprecated symbols if something was using this externally.
            if ('isSticky' in el && !depPropConflict.isSticky && el.isSticky != null) stickyState.isSticky = el.isSticky;
            if ('exTop' in el && !depPropConflict.exTop && el.exTop != null) stickyState.top = el.exTop;

            return stickyState;
        };

        static getStickySectionElements = () => document.querySelectorAll(this.stickySectionSelector);

        static getStickySectionsHeight = () => {
            const {stickySectionSelector, containerSelector} = this;
            const {innerHeight, innerWidth, scrollY} = window;
            const baseOffsetTop = scrollY - document.documentElement.clientTop;
            const editMode = !!document.querySelectorAll('.isEditor').length;
            // calculating and returning the sticky sections total height
            let moduleStickyHeight = 0;
            const stickyContainers = [];
            for (const el of document.querySelectorAll(stickySectionSelector)) {
                const containerElList = el.querySelectorAll(containerSelector);
                const stickyState = PLEStickyState.findOrNew(el);
                if (!stickyState.isSticky) {
                    // check if the sticky section is visible in the viewport, if yes set offset and sticky true
                    const bounding = el.getBoundingClientRect();
                    if (bounding.top >= 0 && bounding.left >= 0 && bounding.right <= innerWidth && bounding.bottom <= innerHeight) {
                        for (const containerEl of containerElList) {
                            containerEl.dataset.inViewport = 'true';
                        }
                        stickyState.top = bounding.top + baseOffsetTop;
                        stickyState.isSticky = true;
                    }
                } else {
                    for (const containerEl of containerElList) {
                        delete containerEl.dataset.inViewport;
                    }
                }

                if (stickyState.isSticky) stickyContainers.push(...containerElList);
            }
            for (const containerEl of stickyContainers) {
                const height = $(containerEl).outerHeight(true);
                // when the browser scroll is triggered, get only the sticky sections that are visible in the view
                moduleStickyHeight += height;

                // for the in viewport sticky elements but still not in sticky mode double the element offset height
                // only in Editor Mode for the Live Preview sticky sections are hidden by default
                if (editMode && containerEl.dataset.inViewport === 'true') {
                    moduleStickyHeight += height;
                }
            }

            if (moduleStickyHeight === 0) {
                moduleStickyHeight = $('.mobileHeader-container').height();
            } else {
                moduleStickyHeight += $('.se__navbar-fixed .nav-bar').outerHeight(true);
            }

            return moduleStickyHeight;
        };

        /**
         * @description Is the sticky-able element currently sticky.
         * @type {boolean}
         */
        isSticky = undefined;
        /**
         * @description The Sticky state inital origin point.
         * @type {number}
         */
        top = undefined;
    }

    /**
     * The Globally Available PLEStickyElements Meta information.
     * Note: this is intentionally var, as we are defining a global.
     * @var {typeof StickyState} PLEStickyState
     */
    window.PLEStickyState = StickyState;

$(() => {
    'use strict';
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isEditor$ref = $('.isEditor');
    const isLiveSite = !isEditor$ref.length;

    const stickyStates = StickyState.states ;
    /** @type {NodeListOf<HTMLElement>} */
    const initialStickyElements = StickyState.getStickySectionElements();
    for (const el of initialStickyElements) {
        stickyStates.set(el, new StickyState());
    }
    if (isLiveSite) for (const el of initialStickyElements) Object.assign(el.style, {
          maxHeight: '0'
        , opacity: '0'
    });

    /** @type {NodeListOf<HTMLElement>|null} */
    let stickySections = null;
    if ('onscrollend' in window) {
        addEventListener('scroll', ()=>{
            positionSticky(stickySections ??= StickyState.getStickySectionElements());
        });
        addEventListener('scrollend', ()=>{
            stickySections = null;
        });
    } else {
        /** @type {number} */
        let fallingEdge= 0;
        addEventListener('scroll', () => {
            positionSticky(stickySections ??= StickyState.getStickySectionElements());
            if (fallingEdge) clearTimeout(fallingEdge);
            fallingEdge = setTimeout(()=>{
                stickySections = null;
                fallingEdge = 0;
            }, 300);
        });
    }



    /**
     * @param {NodeListOf<HTMLElement>} stickySections
     */
    const positionSticky = (stickySections) => {
        if (!stickySections.length) return;
        const {scrollY} = window;
        let scrollTop = scrollY;
        if (scrollTop <= 0) {
            let opacity = '', maxHeight = '', transition = '';
            if (isLiveSite) {
                opacity = '0';
                maxHeight = '0';
                transition = 'opacity 0s linear';
            }

            $(stickySections).css({
                position: 'relative',
                zIndex: 'auto',
                maxHeight,
                transition,
                opacity,
                top: '0px',
                width: '100%'
            });
            return;
        }


        let stickyHeightTotal = 0;
        const baseOffsetTop = scrollY - document.documentElement.clientTop;

        for (/** @type {StickyHTMLElement} */const el of stickySections) {
            const myStartingTop = stickyHeightTotal;

            const box = el.getBoundingClientRect();
            const height = box.height;
            stickyHeightTotal += height;
            const offsetTop = box.top + baseOffsetTop;

            const stickyState = StickyState.findOrNew(el);

            const isRelative = (stickyState.isSticky && scrollTop <= stickyState.top);
            const isSticky = (offsetTop <= scrollTop);

            let position = '';
            let maxHeight = '';
            let transition = '';
            let opacity = '';
            let zIndex = 1;
            let top = 0;

            if (isLiveSite) {
                opacity = '0';
                maxHeight = '0';
            }

            if (isRelative) {
                stickyState.isSticky = false;
                position = 'relative';
                zIndex = 1;

            } else if (isSticky) {
                // Handle sticky state change.
                if (!stickyState.isSticky) {
                    stickyState.isSticky = true;
                    stickyState.top = offsetTop;
                }
                zIndex = 103;
                top += myStartingTop;

                if (isLiveSite) {
                    position = 'fixed';
                    opacity = '1';
                    maxHeight = '99999px';
                    transition = 'opacity 0.3s linear';
                } else {
                    // we have issues with css sticky not working in edit mode
                    position = isSafari ? '-webkit-sticky' : /*'sticky'*/ 'fixed';
                }

                scrollTop += height;
            }

            $(el).css({
                position,
                zIndex,
                maxHeight,
                transition,
                opacity,
                top: `${top}px`,
                width: '100%'
            });

            // Handle deprecated migration issue.
            // FIXME: Remove after all isSticky and exTop places ave been handled
            try {
                if (depPropConflict.isSticky) el.isSticky = stickyState.isSticky;
                if (depPropConflict.exTop) el.exTop = stickyState.top;
            } catch (e) {
                console.error(e);
            }
        }

    };
});


pleAppHooks: {
    // FIXME: This will break when a Section Settings is converted to Vue. This should really be handled from within PLE ONLY.
    const onStickyButtonClick = () => {
        const sections = document.querySelectorAll(`.section:not(.ple_module_sticky)`);
        for (const el of sections) el.removeAttribute('style');
    };

    const disableStickyButton = () => {
        const buttons = document.querySelectorAll(`button[data-ple-id="$stickyBtnDisable"]`);
        for (const button of buttons) button.addEventListener('click', onStickyButtonClick);
    };

    addEventListener('load', disableStickyButton, {once: true});
}
})();
