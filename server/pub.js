Meteor.publish('DPConf', function() {
  logger.info('now try pub DPConf:', { userId: this.userId });
  return DPConf.find({});
});

Meteor.publish('Decks', function(ownerId, deckId) {
  logger.info('now try pub Decks:', { ownerId: ownerId, deckId: deckId });
  if (ownerId) {
    if (deckId) {
      return Decks.find({ _id: deckId, ownerId: ownerId });
    } else {
      return Decks.find({ ownerId: ownerId });
    }
  } else {
    return [];
  }
});

Meteor.publish('RunStatus', function(ownerId, deckId, runId) {
  logger.info('now try pub RunStatus:', { ownerId: ownerId, deckId: deckId, runId: runId });
  if (ownerId && (deckId && runId)) {
    var c = RunStatus.find({ deckId: deckId, runId: runId, ownerId: ownerId });
    if (c.count() <= 0) {
      var rid = Meteor.call('initRunStatus', deckId, runId, ownerId);
      c = RunStatus.find({ deckId: deckId, runId: runId, ownerId: ownerId });
    }
    return c;
  } else {
    return [];
  }
});
