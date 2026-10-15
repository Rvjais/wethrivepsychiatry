+(function ($) {
    "use strict";

    $(document).ready(function () {
        $("body").on("SMBLeadsFormReady", function () {
            var $formSection =  $('[data-control="form"]');
            if ($formSection.length) {
                $formSection.each(function () {
                    if ($(this).data('mhorgid') != '') {
                        $('<input>').attr({
                            type: 'hidden',
                            name: 'mh_orgId',
                            value: $(this).data('mhorgid')
                        }).appendTo($('form', $(this)));
                        $('<input>').attr({
                            type: 'hidden',
                            name: 'mh_template_id',
                            value: $(this).data('templateId')
                        }).appendTo($('form', $(this)));
                    }
                });

                var $form = $formSection.find('form');
                var $submitBtn = $form.find('input[type=submit]');

                $submitBtn.on('click', function(e){
                    var formData = $form.serializeArray();
                    var formDataObject = {};

                    $.each(formData, function(index, field){
                        formDataObject[field.name] = field.value;
                    });
                    
                    const errorDialog = document.getElementById('error-form-dialog');
                    const errorMessage = document.getElementById('p-error-message');
                    const closeDialogButton = document.getElementById('close-dialog');

                    closeDialogButton.addEventListener('click', () => {
                        errorDialog.close();
                        document.body.style.overflow = 'auto';
                    });
                    var hasExternalUrls = checkUrlsInComments(formDataObject);
                    if (hasExternalUrls) {
                        var message =
                            'Error: Your message could not be delivered because it contains a link to an external website. Please review your message and try again.';
                        errorMessage.innerHTML = message;
                        errorDialog.showModal();
                        document.body.style.overflow = 'hidden';
                        errorDialog.style.display = 'block';

                        e.preventDefault();
                    }
                });
            }

            $('.leadForm .hasDatepicker').each(function() {
                $(this).attr({
                    type:"text", 
                    readonly:"readonly",
                });
            });
        });

        // add section-form class if there is form inside pagecontent section
        var $formIsPle = $('.form.isPleForm');
        if ($formIsPle.length) {
            $formIsPle.each(function () {
                var $parentSection = $(this).closest('.section');
                if(!$parentSection.hasClass('section-form')) {
                    $parentSection.addClass('section-form');
                };
            });
        };

        // target section form without these section class and if it's only ple
        var $formSectionClean = $('.section-form:not(.newsletter-2-fields):not(.newsletter-3-fields):not(.contact-us-im):not(.appointment-request):not(.exclusive-offer):not(.pet-memorial):not(.form-default)');

        if ($formSectionClean.length && $formIsPle.length) {

            $formSectionClean.each(function () {

                $(this).find($formIsPle).addClass('form-themeExtras');
                $("body").on("SMBLeadsFormReady", function () {
                    var $form2colSection = $('.forms--2col-textarea:not(.newsletter-2-fields):not(.newsletter-3-fields):not(.contact-us-im):not(.appointment-request):not(.exclusive-offer):not(.pet-memorial):not(.form-default)'),
                        $formLabelOptionB = $('.forms-option--b .leadForm .form__group:not(.checkbox__group):not(.radio__group)');

                    $form2colSection.find($formIsPle).each(function () {
                        var formGroup = $(this).find(".form__group").not(".form-input-comments");
                        formGroup.wrapAll("<div class='groupWrap' />");
                    });

                    $formLabelOptionB.each(function () {
                        if ($(this).hasClass('hasLabel')) {
                            $(this).addClass('optionB-enabled');
                        }
                    });
                });

            });
        }

        function checkUrlsInComments(postData) {
            if (!('comments' in postData)) {
                return false;
            }
            function getUrlRegex() {
                var regex = "((https?|ftp):\\/\\/)?";
                regex += "([a-z0-9+!*(),;?&=$_.-]+(:[a-z0-9+!*(),;?&=$_.-]+)?@)?";
                regex += "([a-z0-9-.]*)\\.([a-z]{2,3})";
                regex += "(:[0-9]{2,5})?";
                regex += "(\\/([a-z0-9+$_-]\\.?)+)*\\/?";
                regex += "(\\?[a-z+&$_.-][a-z0-9;:@&%=+\\/$_.-]*)?";
                regex += "(#[a-z_.-][a-z0-9+$_.-]*)?";
                return new RegExp(regex, 'i');
            }

            var urlRegex = getUrlRegex();

            var comments = postData['comments'];
            return !! comments.match(urlRegex);
        }
    });

})(window.jQuery);