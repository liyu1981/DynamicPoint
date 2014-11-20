Meteor.publish('RunStatus', function(slideId, runId) {
  logger.info('now try pub RunStatus:', slideId, runId);
  if (slideId && runId) {
    return RunStatus.find({ slideId: slideId, runId: runId });
  } else {
    return [];
  }
});

Meteor.publish('Decks', function(slideId) {
  logger.info('now try pub Decks:', this.userId, slideId);
  if (this.userId) {
    if (slideId) {
      return Decks.find({ _id: slideId, ownerId: this.userId });
    } else {
      //logger.info(Decks.find({ ownerId: this.userId }).fetch());
      return Decks.find({ ownerId: this.userId });
    }
  } else {
    return [];
  }
});
