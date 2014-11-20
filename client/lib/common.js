dpMode = null;
dpTheDeck = null;
dpRunStatus = null;

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
      .addClass('dp') // add the global dp-author class
      .addClass('dp-theme-specklednoise') // default theme
      ;
    alertify.defaults.transition = 'pulse';
  });
};

Router.onBeforeAction(function () {
  var loginWaived = _.reduce(['/welcome', '/audience', '/speaker'], function(memo, p) { memo[p] = true; return memo; }, {});
  // all properties available in the route function are also available here such as this.params
  if (this.route._path in loginWaived) {
    this.next();
  } else if (!Meteor.userId()) {
    // if the user is not logged in, render the Login template
    this.render('welcome');
  } else {
    // otherwise don't hold up the rest of hooks or our route/action function from running
    this.next();
  }
});

Meteor.Loader.loadJsAndCss = function(assetArray, callback) {
  function _genLoadCssTask(file) {
    return function(cb) { Meteor.Loader.loadCss(file); cb(); };
  }
  function _genLoadJsTask(file) {
    return function(cb) { Meteor.Loader.loadJs(file, function() { cb(); }); }
  }
  var tasks = [];
  _.each(assetArray, function(file, index) {
    switch (getExt(file).toLowerCase()) {
      case 'css': tasks.push(_genLoadCssTask(file)); break;
      case 'js': tasks.push(_genLoadJsTask(file)); break;
      default: break;
    }
  });
  async.series(tasks, callback);
};

loadJsAndCss = function(dpMode, assetArray, callback) {
  var alertifyAA = [
    'bower_components/alertify-js/build/css/alertify.min.css',
    'bower_components/alertify-js/build/css/themes/default.css',
    'bower_components/alertify-js/build/alertify.min.js',
    'js/alertifyext.js'
  ];
  var revealjsAA = [
    'bower_components/reveal.js/css/reveal.min.css',
    'bower_components/reveal.js/css/theme/solarized.css',
    'bower_components/reveal.js/js/reveal.min.js'
  ];
  var commonAA = [];
  switch(dpMode) {
    case 'welcome':
      commonAA = _.union(alertifyAA);
      break;
    case 'profile':
      commonAA = _.union(alertifyAA);
      break;
    case 'author':
      commonAA = _.union(alertifyAA);
      break;
    case 'audience':
      commonAA = _.union(revealjsAA);
      break;
    case 'speaker':
      commonAA = _.union(revealjsAA);
      break;
  };
  var aa = _.union(commonAA, assetArray);
  Meteor.Loader.loadJsAndCss(aa, callback);
};

Template.registerHelper('isEmpty', function(target) {
  return _.isEmpty(target);
});

Template.navbarDPLogo.events({
  'click .dp-brand': function() {
    window.location.href = "/welcome";
  }
});

Template.navbarDropdownDPAbout.events({
  'click #aboutDP': function() {
    alertify.alert('This DynamicPoint. Slides with fun! Made by @liyu.');
  }
});

Meteor.startup(function () {
});
