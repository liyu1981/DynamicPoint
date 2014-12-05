Template.audience.helpers({
  'calcSlideTemplate': function() {
    if (this.type in DPPlugins) {
      return dpMode + '-slide-' + this.type;
    } else {
      return 'audience-slide-normal';
    }
  }
});

Template.audience.rendered = function () {
  $('body').addClass('dp-reveal');
  waitfor('.slides section', function() {
    Session.set('audienceId', Random.id());
    logger.info('audienceId generated as:', Session.get('audienceId'));
    Reveal.initialize({
      keyboard: false, touch: false, controls: false // disable all user inputs
    })
    if (dpRunStatus) {
      // subscribe to the changes
      var s = $('.slides');
      dpPluginObserve('deck', Decks, dpTheDeck._id, s);
      dpPluginObserve('runStatus', RunStatus, dpRunStatus._id, s);
      s.on('runStatusChanged', function(event, id, fields) {
        gotoSlide(fields.curIndex);
      });
      // and update for starting time
      gotoSlide(dpRunStatus.curIndex);
    }
  });
};
