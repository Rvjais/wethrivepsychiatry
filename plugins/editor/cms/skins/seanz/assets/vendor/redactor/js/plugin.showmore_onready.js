$(document).ready(function () {
  var $editableSection = $('.editable__container');

  if ($editableSection.length) {
    $editableSection.each(function () {

      var $content = $(this),
        $showMoreContent = $content.find('.contentExpandWrap'),
        $showMoreLink = $content.find('#readMoreLink');

        if($showMoreLink.length) {

          // fallback for already created showmore links with span node
          if($showMoreLink[0].nodeName == "SPAN") {
            $showMoreLink.attr("href", "#editableAnimateShowLess");
            replaceElementTag($showMoreLink, '<a></a>');
          }

          function replaceElementTag(targetSelector, newTagString) {
            $(targetSelector).each(function(){
              var newElem = $(newTagString, {html: $(this).html()});
              $.each(this.attributes, function() {
                newElem.attr(this.name, this.value);
              });
              $(this).replaceWith(newElem);
            });
          }

          $showMoreContent.add($showMoreLink).removeClass("expand");
          $showMoreContent.hide();
          $showMoreLink.text("Show More");

          $content.on("click", '#readMoreLink', function(e){
            e.preventDefault();
            var $readMoreLink = $(this),
                $readMoreLinkTooltip = $('body .redactor-link-tooltip .redactor-link-tooltip-action:first-child');

            if ($readMoreLinkTooltip.length) $readMoreLinkTooltip.parent().css('visibility', 'hidden');

            if ($readMoreLink.text() === 'Show More') {
              $content.removeAttr('id');
              $readMoreLink.text("Show Less");
            } else {
              $content.attr('id', 'editableAnimateShowLess');
              $readMoreLink.text("Show More");
            };
            $showMoreContent.add($readMoreLink).toggleClass("expand");
          });

        };

    });
  }
});
