/* Relative Path: Frame Selector */
$(() => {
    'use strict';

    // Handler for Shape Links
    const shapeLinks = document.querySelectorAll('#shapePnl a');
    /**
     * @param {MouseEvent} event
     */
    const onShapeLinks = ({currentTarget: el}) => {
        const shapeName = el.classList.item(0);

        const selectedSiblings = el.parentElement.querySelectorAll(':scope > .selected');
        for (const sibling of selectedSiblings) sibling.classList.remove('selected');
        el.classList.add('selected');

        const facePanels = document.querySelectorAll('#facePnl');
        for (const facePnl of facePanels) facePnl.setAttribute('class', shapeName);

        const infoPanelShapes = document.querySelectorAll(`#infoPnl div.${shapeName}`);
        for (const panelShapeEl of infoPanelShapes) {
            for (const siblingEl of panelShapeEl.parentElement.children) {
                siblingEl.style.display = siblingEl === panelShapeEl ? 'block' : 'none';
            }
        }
    };

    for (const el of shapeLinks) el.addEventListener('click', onShapeLinks);

    // Handler for Frame Links
    const frameLinks = document.querySelectorAll('#framePnl span[class*="frm"]');
    /**
     * @param {MouseEvent} event
     */
    const onFrameLinks = ({currentTarget: frmEl}) => {
        const frameName = frmEl.getAttribute('class');

        const selected = document.querySelectorAll('#framePnl a.selected');
        for (const el of selected) el.classList.remove('selected');

        frmEl.parentElement.classList.add('selected');

        const lrgFrames = document.querySelectorAll('#lrgFrame');
        for (const lrgFrame of lrgFrames) lrgFrame.setAttribute('class', frameName);
    };

    for (const el of frameLinks) el.addEventListener('click', onFrameLinks);

    // Frame Carousel With Rewind
    const width = 720;
    let current = 1;
    const count = document.querySelectorAll('ul#frameSets li').length;
    const prevAnchors = document.querySelectorAll('a.prvSet');
    /**
     * @param {MouseEvent} event
     */
    const onFrameCarouselPrevious = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const frameset$ref = $('ul#frameSets li');
        if (current > 1) {
            // FIXME: This really should be handled with CSS Animations controlled by classes
            frameset$ref.animate({
                left: `+=${width}px`
            }, 500);
            current -= 1;
            return;
        }
        // FIXME: This really should be handled with CSS Animations controlled by classes
        frameset$ref.animate({
            left: `-${(count - 1) * width}px`
        }, 500);
        current = count;
    };

    for (const el of prevAnchors) el.addEventListener('click', onFrameCarouselPrevious);

    const nextAnchors = document.querySelectorAll('a.nxtSet');
    /**
     * @param {MouseEvent} event
     */
    const onFrameCarouselNext = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const frameset$ref = $('ul#frameSets li');
        if (current < count) {
            // FIXME: This really should be handled with CSS Animations controlled by classes
            frameset$ref.animate({
                left: `-=${width}px`
            }, 500);
            current += 1;
            return;
        }
        // FIXME: This really should be handled with CSS Animations controlled by classes
        frameset$ref.animate({
            left: '0px'
        }, 500);
        current = 1;
    };

    for (const el of nextAnchors) el.addEventListener('click', onFrameCarouselNext);


    // FIXME: Convert this to an es module and convert from $.fancybox to [Fancybox 5|https://fancyapps.com/fancybox/#fancybox]
    // const {Fancybox} = await import('https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.esm.js');
    // This would require licensing. Alternative is I refactor all that code. - FRG 2023-11-09

    // Show Frame Selector
    const frameSelectors = document.querySelectorAll('a.lnchFrmSlctr');
    /**
     * @param {MouseEvent} event
     */
    const onShowFrameSelector = (event) => {
        event.preventDefault();
        event.stopPropagation();
        $.fancybox({
            'autoSize': false,
            'speedIn': 600,
            'speedOut': 200,
            'transitionIn': 'elastic',
            'type': 'inline',
            'href': '#frameSelector',
            'width': '815',
            'height': '508'
        });
    };
    for (const el of frameSelectors) el.addEventListener('click', onShowFrameSelector);

    // Show 3D Spine
    const dddSpines = document.querySelectorAll('button.lnch3dspine');
    /**
     * @param {MouseEvent} event
     */
    const onShow3dSpine = (event) => {
        event.stopPropagation();
        event.preventDefault();
        $.fancybox({
            'autoSize': false,
            'speedIn': 600,
            'speedOut': 200,
            'transitionIn': 'elastic',
            'type': 'inline',
            'href': '#frameSelector',
            'width': '902',
            'height': '833'
        });
    };

    for (const el of dddSpines) el.addEventListener('click', onShow3dSpine);

    // Show Pet Selector
    const petSelectors = document.querySelectorAll('button.lnchpetselector');
    /**
     * @param {MouseEvent} event
     */
    const onShowPetSelector = (event) => {
        event.preventDefault();
        event.stopPropagation();
        $.fancybox({
            'autoSize': false,
            'speedIn': 600,
            'speedOut': 200,
            'transitionIn': 'elastic',
            'type': 'inline',
            'href': '#frameSelector',
            'width': '940',
            'height': '750'
        });
    };

    for (const el of petSelectors) el.addEventListener('click', onShowPetSelector);
});
