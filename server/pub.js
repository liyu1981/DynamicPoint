Meteor.publish('Decks', function(deckId) {
  logger.info('now try pub Decks:', { userId: this.userId, deckId: deckId });
  if (this.userId) {
    if (deckId) {
      return Decks.find({ _id: deckId, ownerId: this.userId });
    } else {
      return Decks.find({ ownerId: this.userId });
    }
  } else {
    return [];
  }
});

Meteor.publish('RunStatus', function(deckId, runId) {
  logger.info('now try pub RunStatus:', { userId: this.userId, deckId: deckId, runId: runId });
  if (this.userId && (deckId && runId)) {
    var c = RunStatus.find({ deckId: deckId, runId: runId, ownerId: this.userId });
    if (c.count() <= 0) {
      var rid = Meteor.call('initRunStatus', deckId, runId, this.userId);
      c = RunStatus.find({ deckId: deckId, runId: runId, ownerId: this.userId });
    }
    return c;
  } else {
    return [];
  }
});
