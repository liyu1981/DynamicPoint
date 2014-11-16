var audience = {
  id: null // audience id
};

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

        // now register plugins' events
        var allTemplateTypes = _.uniq(_.map(dpTheDeck.slides, function(v) { return v.type; }));
        _.each(allTemplateTypes, function(type) {
          if (type in DPPlugins) {
            var t = Template[dpMode + '-slide-' + type];
            console.log('will reg helpers:', t, DPPlugins[type].templateHelpers[dpMode]());
            t.helpers(DPPlugins[type].templateHelpers[dpMode]());
            console.log('will reg events:', t, DPPlugins[type].templateEvents[dpMode]({ runStatusId: dpRunStatus._id, audience: audience }));
            t.events(DPPlugins[type].templateEvents[dpMode]({ runStatusId: dpRunStatus._id, audience: audience }));
          }
        });

        return dpTheDeck;
      } else {
        Router.go('/author');
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
      RunStatus.find({ slideId: dpTheDeck._id, runId: dpRunId }).observeChanges({
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
