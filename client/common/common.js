// client global vars
dpMode = null;
dpUrlParams = null;
dpTheDeck = null; // cache for current deck
dpRunStatus = null; // cache for current runStatus

// common util methods

// waitfor any page elements then callback
waitfor = function(selector, callback) {
  var r = $(selector);
  if (r.length <= 0) {
    setTimeout(function() { waitfor(selector, callback); }, 500);
  } else {
    callback();
  }
};

// normalize url
// taken from http://james.padolsey.com/javascript/getting-a-fully-qualified-url/
qualifyURL = function(url) {
  var img = document.createElement('img');
  img.src = url; // set string url
  url = img.src; // get qualified url
  img.src = null; // no server request
  return url;
};

// share by audience & speaker
gotoSlide = function(index) {
  // index : { indexh: , indexv: }
  if (Reveal && index) {
    Reveal.slide(index.indexh, index.indexv);
  }
}

// DP page setup
commonDPPageSetup = function() {
  $(function() {
    $('body')
      .addClass('dp') // add the global dp class
      .addClass('dp-theme-dp') // default theme
      ;

    // fix the scroll parent issue
    // http://stackoverflow.com/a/16324762
    $(document).on('DOMMouseScroll mousewheel', '[data-dpscroll="stop"]', function(ev) {
      var $this = $(this),
          scrollTop = this.scrollTop,
          scrollHeight = this.scrollHeight,
          height = $this.height(),
          delta = (ev.type == 'DOMMouseScroll' ?
              ev.originalEvent.detail * -40 :
              ev.originalEvent.wheelDelta),
          up = delta > 0;

      var prevent = function() {
          ev.stopPropagation();
          ev.preventDefault();
          ev.returnValue = false;
          return false;
      }

      if (!up && -delta > scrollHeight - height - scrollTop) {
          // Scrolling down, but this will take us past the bottom.
          $this.scrollTop(scrollHeight);
          return prevent();
      } else if (up && delta > scrollTop) {
          // Scrolling up, but this will take us past the top.
          $this.scrollTop(0);
          return prevent();
      }
    });

    // alertify setup
    if (window.alertify) {
      window.alertify.defaults.transition = 'pulse';
    }
  });
};
