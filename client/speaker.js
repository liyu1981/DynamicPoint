var runStatusList = new ReactiveVar;
var started = false;

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
  },

  'calcDeckTheme': function() {
    return deepGet(this, ['conf', 'theme'], 'dp-reveal-theme-solarized');
  },

  'runStatusList': function() {
    if (!runStatusList.get()) {
      Meteor.call('listRunStatus', this._id, function(err, data) {
        runStatusList.set(data);
      });
    }
    return runStatusList.get();
  }
});

Template.speaker.rendered = function() {
  $('body')
    .addClass('dp-reveal')
    .addClass('dp-theme-dp') // default theme
    ;

  waitfor('.slides section', function() {
    Reveal.initialize();
    Reveal.addEventListener('slidechanged', function(event) {
      logger.info('slide changed to:', event);
      // event.previousSlide, event.currentSlide, event.indexh, event.indexv
      RunStatus.update({ _id: dpRunStatus._id }, { $set: { 'curIndex': { indexh: event.indexh, indexv: event.indexv } } });
    });
    // subscribe to the changes
    var s = $('.slides');
    dpPluginObserve('deck', Decks, dpTheDeck._id, s);
    dpPluginObserve('runStatus', RunStatus, dpRunStatus._id, s);
    // and update for starting time
    $('#sessionSetup').modal().on('hidden.bs.modal', function() {
      $('.dp-reveal-container').removeClass('dp-reveal-container-wait');
      gotoSlide(dpRunStatus.curIndex);
    });
    // setup the session control
    dpSessionControl.on('started?', function() {
      if (dpSessionControl.session.started) {
        dpSessionControl.emit('kickOff');
      }
    });
  });
};

Template.speaker.events({
  'click #doneSessionSetup': function(event) {
    dpSessionControl.emit('kickOff');
    dpSessionControl.session.started = true;
    $('#sessionSetup').modal('hide');
  }
});
