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

