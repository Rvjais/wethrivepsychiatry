var SmbNumberChanger = (function() {
  var hasCookie = false;

  function init(numbers) {
    if(!numbers) {
      checkForCookie();
    } else {
      checkForCookie(numbers);
      handleNumbers(numbers);
    }
  }

  function checkForCookie(numbers) {
    if(!numbers) {
      var cookieArr = document.cookie.split(';');
      var key = 'ctdata=';

      for (var i=0; i<cookieArr.length; i++) {
        if(cookieArr[i].indexOf(key) > -1) {
          var trimmedCookie = cookieArr[i].trim();
          var data = JSON.parse(trimmedCookie.substring(key.length, trimmedCookie.length));
          hasCookie = true;
          init(data);
          return;
        } 
      }

      getRewriteRules();
    } else {
      if(!hasCookie) {
        setCookie(numbers);
      }
    }
    
  }

  function getRewriteRules() {
    var s = document.createElement('script');
    var query = window.location.search.substring(1);
    var params = query.split('&');
    var vsrefdom = '';

    for (var i=0;i<params.length;i++) {
      var pair = params[i].split('=');
      if(pair[0] == '_vsrefdom') {
        vsrefdom = pair[1];
        break;
      }
    }

    if(!document.referrer && !vsrefdom) {
      init([]);
      return;
    }

    var url = new URL(_ctRewriteUrl);

    // If your expected result is "http://foo.bar/?x=42&y=2"
    url.searchParams.set('referrer', document.referrer);
    url.searchParams.set('_vsrefdom', vsrefdom);
    url.searchParams.set('callback', 'SmbNumberChanger.init');
    s.src = url.toString();
    document.getElementsByTagName('head')[0].appendChild(s);
  }

  function setCookie(numbers) {
    var d = new Date();
    d.setTime(d.getTime() + 3600000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = "ctdata=" + JSON.stringify(numbers) + ";" + expires + ";path=/";
  }

  function handleNumbers(numbers) {
    numbers.forEach(function(phone) {
      rewritePhoneNumbers(phone.to, phone.from);
    });
  }
  
  function formatPhoneNumber(s) {
    var s2 = (""+s).replace(/\D/g, '');
    // Strip leading 1 if 11 digits (country code)
    if (s2.length === 11 && s2.charAt(0) === '1') {
      s2 = s2.substring(1);
    }
    var m = s2.match(/^([0-9]{3})([0-9]{3})([0-9]{4})$/); 
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
  }

  function formatPhoneNumberForTel(s) {
    var s2 = (""+s).replace(/\D/g, '');
    var m = s2.match(/([0-9]{3})([0-9]{3})([0-9]{4})/);
    return (!m) ? null : m[1] + "-" + m[2] + "-" + m[3];
  }

  function getDigitsOnly(s) {
    return (""+s).replace(/\D/g, '');
  }

  function buildPhoneRegex(dest) {
    if(dest && dest !== '*') {
      var digits = getDigitsOnly(dest);
      if (digits.length < 10) {
        return /([.\-)(]*)[0-9]{3}([.\-)( ]*)[0-9]{3}([.\-)( ]*)[0-9]{4}/g;
      }
      return new RegExp("(([.\\-)(]*)[" + digits.substring(0,1) + "][" + digits.substring(1,2) + "][" + digits.substring(2,3) + "]([.\\-)( ]*)[" + digits.substring(3,4) + "][" + digits.substring(4,5) + "][" + digits.substring(5,6) + "]([.\\-)( ]*)[" + digits.substring(6,7) + "][" + digits.substring(7,8) + "][" + digits.substring(8,9) + "][" + digits.substring(9,10) + "])", "g");
    } else {
      return /([.\-)(]*)[0-9]{3}([.\-)( ]*)[0-9]{3}([.\-)( ]*)[0-9]{4}/g;
    }
  }

  function buildTelRegex(dest) {
    if(dest && dest !== '*') {
      var digits = getDigitsOnly(dest);
      var d = digits;
      // Match tel: URLs with optional +1 country code and various separators including (NXX) NXX-XXXX format
      return new RegExp(
        "(tel:\\+?1?[\\-.\\s]*" +
        "(?:\\(" + d.substring(0,3) + "\\)|" + d.substring(0,3) + ")" +
        "[\\-.\\s]*" + d.substring(3,6) +
        "[\\-.\\s]*" + d.substring(6,10) +
        ")", "gi");
    } else {
      return /(tel:\+?1?[\-.\s]*(?:\([0-9]{3}\)|[0-9]{3})[\-.\s]*[0-9]{3}[\-.\s]*[0-9]{4})/gi;
    }
  }

  function walkTextNodes(root, regex, replacement) {
    // Elements to skip - their text content should not be modified
    var skipTags = [
      // Code-related elements
      'SCRIPT', 'STYLE', 'CODE', 'PRE', 'KBD', 'SAMP', 'VAR',
      // Template and non-rendered content
      'TEMPLATE', 'NOSCRIPT',
      // Embedded content
      'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'CANVAS',
      // Media elements
      'AUDIO', 'VIDEO',
      // Form elements with editable content
      'TEXTAREA', 'INPUT', 'SELECT'
    ];
    
    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip text nodes inside certain elements
          var parent = node.parentNode;
          while (parent && parent !== root) {
            if (skipTags.indexOf(parent.nodeName) > -1) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );

    var nodesToUpdate = [];
    var node;

    // Collect all text nodes that match the regex
    while (node = walker.nextNode()) {
      if (regex.test(node.nodeValue)) {
        nodesToUpdate.push(node);
        regex.lastIndex = 0; // Reset regex state
      }
    }

    // Replace text nodes using replaceChild to preserve DOM integrity
    nodesToUpdate.forEach(function(textNode) {
      var newText = textNode.nodeValue.replace(regex, replacement);
      var newTextNode = document.createTextNode(newText);
      textNode.parentNode.replaceChild(newTextNode, textNode);
    });
  }

  function updateTelLinks(root, regex, formattedTel) {
    // Use querySelectorAll to efficiently find all tel: links
    var telLinks = root.querySelectorAll('a[href^="tel:"], a[href^="TEL:"]');
    
    telLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (regex.test(href)) {
        regex.lastIndex = 0; // Reset regex state
        link.setAttribute('href', href.replace(regex, formattedTel));
      }
    });
  }

  function rewritePhoneNumbers(trk, dest) {
    if (!document.body) {
      return;
    }

    var regex = buildPhoneRegex(dest);
    var formattedNumber = formatPhoneNumber(trk);

    if (!formattedNumber) {
      return;
    }

    // Walk through text nodes and update phone numbers non-destructively
    walkTextNodes(document.body, regex, formattedNumber);

    // Update tel: protocol links
    var telRegex = buildTelRegex(dest);
    var formattedTel = "tel:" + formatPhoneNumberForTel(trk);
    updateTelLinks(document.body, telRegex, formattedTel);
  }

  return {
    init: init
  }
  
})();

SmbNumberChanger.init();