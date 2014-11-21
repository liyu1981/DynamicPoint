var audience = {
  id: null // audience id
};
Session.set('audience', audience);

Template.audience.helpers({
  'calcSlideTemplate': function() {
    if (this.type in DPPlugins) {
      return dpMode + '-slide-' + this.type;
    } else {
      return 'audience-slide-normal';
    }
  },

  'notAvaliable': function() {
    return (this.notAvaliable ? true : false);
  }
});

Template.audience.rendered = function () {
  waitfor('.slides section', function() {
    audience.id = Random.id();
    logger.info('audienceId generated as:', audience.id);
    Reveal.initialize({
      keyboard: false, touch: false, controls: false // disable all user inputs
    })
    if (dpRunStatus && !dpRunStatus.notAvaliable) {
      // subscribe to the changes
      RunStatus.find({ _id: dpRunStatus._id }).observeChanges({
        changed: function(id, fields) {
          logger.info('changes:', id, fields);
          gotoSlide(fields.curIndex);
        }
      });
      // and update for starting time
      gotoSlide(dpRunStatus.curIndex);
    }
  });
};
