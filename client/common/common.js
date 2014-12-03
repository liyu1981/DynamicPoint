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
      .addClass('dp-theme-waves') // default theme
      ;
    // alertify setup
    if (window.alertify) {
      window.alertify.defaults.transition = 'pulse';
    }
  });
};
