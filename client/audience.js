function gotoSlide(index) {
  // index : { indexh: , indexv: }
  Reveal.slide(index.indexh, index.indexv);
}

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
      });
    });
    this.rendered = true;
  }
};
