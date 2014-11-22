// client global vars
dpMode = null;
dpTheDeck = null;
dpRunStatus = null;
dpUrlParams = null;

// common util methods
waitfor = function(selector, callback) {
  var r = $(selector);
  if (r.length <= 0) {
    setTimeout(function() { waitfor(selector, callback); }, 500);
  } else {
    callback();
  }
};

qualifyURL = function(url){
  // http://james.padolsey.com/javascript/getting-a-fully-qualified-url/
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

commonDPPageSetup = function() {
  $(function() {
    $('body')
      .addClass('dp') // add the global dp class
      .addClass('dp-theme-specklednoise') // default theme
      ;
    // alertify setup
    alertify.defaults.transition = 'pulse';
  });
};
