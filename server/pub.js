Meteor.publish('Decks', function(deckId) {
  logger.info('now try pub Decks:', this.userId, deckId);
  if (this.userId) {
    if (deckId) {
      //logger.info(Decks.find({ _id: deckId, ownerId: this.userId }).fetch());
      return Decks.find({ _id: deckId, ownerId: this.userId });
    } else {
      //logger.info(Decks.find({ ownerId: this.userId }).fetch());
      return Decks.find({ ownerId: this.userId });
    }
  } else {
    return [];
  }
});

Meteor.publish('RunStatus', function(deckId, runId) {
  logger.info('now try pub RunStatus:', this.userId, deckId, runId);
  if (this.userId && (deckId && runId)) {
    //logger.info(RunStatus.find({ deckId: deckId, runId: runId, ownerId: this.userId }).fetch());
    var c = RunStatus.find({ deckId: deckId, runId: runId, ownerId: this.userId });
    if (c.count() <= 0) {
      var rid = Meteor.call('initRunStatus', deckId, runId, this.userId);
      //logger.info(RunStatus.find({ deckId: deckId, runId: runId, ownerId: this.userId }).fetch());
      c = RunStatus.find({ deckId: deckId, runId: runId, ownerId: this.userId });
    }
    return c;
  } else {
    return [];
  }
});
