Router.route('/',
  function() {
    var self = this;
    dpMode = 'audience';
    Meteor.Loader.loadJsAndCss([
      'bower_components/reveal.js/css/reveal.min.css',
      'bower_components/reveal.js/css/theme/solarized.css',
      'bower_components/reveal.js/js/reveal.min.js'
    ],
    function() {
      self.render('audience')
    });
  },
  {
    data: function() {
      if (this.params.query.id) {
        dpTheDeck = Decks.findOne(this.params.query.id);
        console.log('find the deck:', dpTheDeck);
        dpRunId = this.params.query.runId || 'rehearsal';
        dpRunStatus = RunStatus.findOne({ slideId: dpTheDeck._id, runId: dpRunId });
        console.log('find the runStatus:', dpRunStatus);
        return dpTheDeck;
      } else {
        Router.go('/author');
      }
    }
  });

Template.audience.helpers({
  'audienceSlides': function() {
    return _.map(dpTheDeck.slides, function(s) {
      var r = {
        id: s.id,
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
  waitfor('.slides section', function() {
    Reveal.initialize({
      keyboard: false, touch: false, controls: false // disable all user inputs
    });
    if (dpRunStatus) {
      // subscribe to the changes
      RunStatus.find({ slideId: dpTheDeck._id, runId: dpRunId }).observeChanges({
        changed: function(id, fields) {
          console.log('changes:', id, fields);
          gotoSlide(fields.curIndex);
        }
      });
      // now fire events
      _.each(dpTheDeck.slides, function(index, slide) {
        if (slide.type in DPPlugins) {
          DPPlugins[slide.type].onSlideRendered[dpMode]($('#' + slide.id), slide, runStatus);
        }
      });
      // and update for starting time
      gotoSlide(dpRunStatus.curIndex);
    } else {
      $('.slides section:first-child').html('<h3>Not Avaliable Yet</h3>');
    }
  });
};
