Router.route('/speaker', function() {
  var self = this;
  dpMode = 'speaker';
  Meteor.Loader.loadJsAndCss([
    'bower_components/reveal.js/css/reveal.min.css',
    'bower_components/reveal.js/css/theme/solarized.css',
    'bower_components/reveal.js/js/reveal.min.js'
  ],
  function() {
    self.render('speaker', {
      data: function() {
        if (self.params.query.id) {
          dpTheDeck = Decks.findOne({ _id: self.params.query.id });
          console.log('find the deck:', dpTheDeck);
          // reset the runStatus first
          return dpTheDeck;
        } else {
          Router.go('/author');
        }
      }
    });
  });
});

Template.speaker.rendered = function() {
  if (!this.rendered) {
    $(function() {
      waitfor('.slides section', function() {
        Reveal.initialize();
        Reveal.addEventListener('slidechanged', function(event) {
          // event.previousSlide, event.currentSlide, event.indexh, event.indexv
          console.log('slide changed to:', event);
          Decks.update({ _id: dpTheDeck._id }, { $set: { 'runStatus.curIndex': { indexh: event.indexh, indexv: event.indexv } } });
        });
      });
    });
    this.rendered = true;
  }
};

