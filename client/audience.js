var audience = {
  id: null // audience id
};

Router.route('/audience',
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
        if (dpTheDeck) {
          var dpRunId = this.params.query.runId || 'rehearsal';
          dpRunStatus = RunStatus.findOne({ slideId: dpTheDeck._id, runId: dpRunId });
          console.log('find the runStatus:', dpRunStatus);

          // now register plugins' events
          _.map(dpTheDeck.slides, function(v) {
            dpPluginRegTemplate(v.type, dpMode, { runStatusId: dpRunStatus._id, audience: audience });
          });
        }
        return dpTheDeck;
      } else {
        Router.go('/welcome');
      }
    }
  });

Template.audience.helpers({
  'calcSlideTemplate': function() {
    if (this.type in DPPlugins) {
      return dpMode + '-slide-' + this.type;
    } else {
      return 'audience-slide-normal';
    }
  },

  'calcSlideData': function() {
    return _.extend(this, { runStatus: dpRunStatus });
  }
});

Template.audience.rendered = function () {
  waitfor('.slides section', function() {
    audience.id = Random.id();
    console.log('audienceId generated as:', audience.id);
    Reveal.initialize({
      keyboard: false, touch: false, controls: false // disable all user inputs
    });
    if (dpRunStatus) {
      // subscribe to the changes
      //console.log('will subscribe:', RunStatus.findOne({ _id: dpRunStatus._id }));
      RunStatus.find({ _id: dpRunStatus._id }).observeChanges({
        changed: function(id, fields) {
          console.log('changes:', id, fields);
          gotoSlide(fields.curIndex);
        }
      });
      // and update for starting time
      gotoSlide(dpRunStatus.curIndex);
    } else {
      $('.slides section:first-child').html('<h3>Not Avaliable Yet</h3>');
    }
  });
};
