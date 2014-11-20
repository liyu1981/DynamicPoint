Meteor.methods({
  importFile: function(blob) {
    logger.info('importFile with blob:', blob);
    var d = EJSON.toJSONValue(EJSON.parse(blob));
    var nd = genNewDeck(d);
    return Decks.insert(nd);
  },

  initRunStatus: function(deckId, runId, ownerId) {
    logger.info('initRunStatus with:', { deckId: deckId, runId: runId, ownerId: ownerId });
    return RunStatus.insert({
      deckId: deckId,
      runId: runId,
      ownerId: ownerId,
      curIndex: { indexh: 0, indexv: 0 },
      pluginData: {}
    });
  }
});
