Router.route('/speaker',
  function() {
    var self = this;
    dpMode = 'speaker';
    loadJsAndCss(dpMode,
      [],
      function() {
        self.render('speaker');
      });
  },
  {
    data: function() {
      if (this.params.query.id) {
        dpTheDeck = Decks.findOne({ _id: this.params.query.id });
        logger.info('find the deck:', dpTheDeck);
        if (dpTheDeck) {
          var dpRunId = (this.params.query.runId || 'rehearsal');
          dpRunStatus = RunStatus.findOne({ slideId: dpTheDeck._id, runId: dpRunId });
          if (!dpRunStatus) {
            var rid = RunStatus.insert({
              slideId: dpTheDeck._id,
              runId: dpRunId,
              curIndex: { indexh: 0, indexv: 0 },
              pluginData: {}
            });
            dpRunStatus = RunStatus.find({ _id: rid });
          }
          logger.info('find the runStatus:', dpRunStatus);

          // now register plugins' events
          _.map(dpTheDeck.slides, function(v) {
            dpPluginRegTemplate(v.type, dpMode, { runStatusId: dpRunStatus._id });
          });
        }
        return dpTheDeck;
      } else {
        window.location.href = '/welcome';
      }
    }
  });

Template.speaker.helpers({
  'calcSlideTemplate': function() {
    if (this.type in DPPlugins) {
      return dpMode + '-slide-' + this.type;
    } else {
      return 'speaker-slide-normal';
    }
  },

  'calcSlideData': function() {
    return _.extend(this, { runStatus: dpRunStatus });
  }
});

Template.speaker.rendered = function() {
  waitfor('.slides section', function() {
    Reveal.initialize();
    Reveal.addEventListener('slidechanged', function(event) {
      // event.previousSlide, event.currentSlide, event.indexh, event.indexv
      logger.info('slide changed to:', event);
      RunStatus.update({ _id: dpRunStatus._id }, { $set: { 'curIndex': { indexh: event.indexh, indexv: event.indexv } } });
    });
    // and update for starting time
    gotoSlide(dpRunStatus.curIndex);
  });
};

