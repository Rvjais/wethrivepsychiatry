$(document).ready(function () {
	disableLinks('.wrap__page-content a, .wrap__editable-content a');

	// fix an issue when a form is present on a page along with FixedScrollBlock
	// FixedScrollBlock is not recalculated after form is loaded (result: incorrect positioning of an element which position is controlled by FixedScrollBlock)
	// check if form component exists on page
	if ($('.form').length) {
		// this part is initialized on forms load
		$('body').on('SMBLeadsFormReady', function() {
			// check if FixedScrollBlock plugin data exists, refresh if true
			if (typeof $('body').data('FixedScrollBlock') !== 'undefined') {
				$('body').data('FixedScrollBlock').refresh();
			}
		});
	}
	//global fix for mm navigation issue
	setTimeout(function() {
		$('body').removeClass('mm-slideout mm-page')
	}, 1000);

	$('a.dd-lightbox').fancybox();
});

function disableLinks(el) {
	$(el).each(function(){
		if($(this).attr('href') === '#' || $(this).attr('href') === 'javascript.void(0)') {
			$(this).click(function(e){
				e.preventDefault();
			});
		}
	});
}