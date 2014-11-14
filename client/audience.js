Router.route('/', function() {
  var self = this;
  dpMode = 'audience';
  Meteor.Loader.loadJsAndCss([
    'bower_components/reveal.js/css/reveal.min.css',
    'bower_components/reveal.js/css/theme/solarized.css',
    'bower_components/reveal.js/js/reveal.min.js'
  ],
  function() {
    self.render('audience', {
      data: function() {
        if (self.params.query.id) {
          dpTheDeck = Decks.findOne({ _id: self.params.query.id });
          console.log('find the deck:', dpTheDeck);
          return dpTheDeck;
        } else {
          Router.go('/author');
        }
      }
    });
  });
});

Template.audience.helpers({
  'audienceSlides': function() {
    return _.map(dpTheDeck.slides, function(s) {
      var r = {
        content: ''
      };
      r.content = ((s.type in DPPlugins) ?
        DPPlugins[s.type].genHtml[dpMode](s, dpTheDeck.runStatus) :
        s.content);
      return r;
    });
  }
});

Template.audience.rendered = function () {
  if (!this.rendered) {
    $(function() {
      waitfor('.slides section', function() {
        Reveal.initialize({
          keyboard: false, touch: false, controls: false // disable all user inputs
        });
        Decks.find({ _id: dpTheDeck._id }, { runStatus: 1 }).observeChanges({
          changed: function(id, fields) {
            console.log('changes:', id, fields);
            gotoSlide(fields.runStatus.curIndex);
          }
        });
        // and update for starting time
        gotoSlide(dpTheDeck.runStatus.curIndex);
        // now fire events
        _.each(dpTheDeck.slides, function(index, slide) {
        });
      });
    });
    this.rendered = true;
  }
};
