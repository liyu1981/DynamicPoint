dpMode = null;

Router.route('/', function() {
  var self = this;
  dpMode = 'audience';
  Meteor.Loader.loadCss('bower_components/reveal.js/css/reveal.min.css');
  Meteor.Loader.loadCss('bower_components/reveal.js/css/theme/solarized.css');
  Meteor.Loader.loadJs('bower_components/reveal.js/js/reveal.min.js', function() {
    self.render('audience', {
      data: function() {
        return Decks.findOne();
      }
    });
  });
});

Router.route('/speaker', function() {
  var self = this;
  dpMode = 'speaker';
  Meteor.Loader.loadCss('bower_components/reveal.js/css/reveal.min.css');
  Meteor.Loader.loadCss('bower_components/reveal.js/css/theme/solarized.css');
  Meteor.Loader.loadJs('bower_components/reveal.js/js/reveal.min.js', function() {
    self.render('speaker');
  });
});

Router.route('/author', function() {
  var self = this;
  dpMode = 'author';
  Meteor.Loader.loadCss('bower_components/medium-editor/dist/css/medium-editor.min.css');
  Meteor.Loader.loadCss('bower_components/medium-editor/dist/css/themes/default.min.css');
  Meteor.Loader.loadJs('bower_components/medium-editor/dist/js/medium-editor.min.js', function() {
    self.render('author', {
      data: function() {
        return Decks.findOne();
      }
    });
  });
});

Template.audience.rendered = function () {
  Reveal.initialize();
};

Template.author.helpers({
  indexedSlides: function() {
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  }
});

Template.author.rendered = function() {
  var editor = new MediumEditor('.editable');

  var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;
    return function(obj, callback){
      if(MutationObserver) {
        // define a new observer
        var obs = new MutationObserver(function(mutations, observer) {
          if(mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
            callback(obj);
          }
        });
        // have the observer observe foo for changes in children
        obs.observe( obj, { childList:true, subtree:true });
      }
      else if( eventListenerSupported ){
        obj.addEventListener('DOMNodeInserted', function() { callback(obj); }, false);
        obj.addEventListener('DOMNodeRemoved', function() { callback(obj); }, false);
      }
    }
  })();

  $('.editable').each(function(i, e) {
    observeDOM(e, function(obj) {
      console.log('got input:', obj);
    });
  });
};

Meteor.startup(function () {
});
