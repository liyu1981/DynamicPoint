Meteor.methods({
  importFile: function(blob) {
    logger.info('importFile with blob:', blob);
    var d = EJSON.toJSONValue(EJSON.parse(blob));
    var nd = genNewDeck(d);
    var deckId = Decks.insert(nd);
    // defaultly create a rehearsal runStatus
    Meteor.call('initRunStatus', deckId, 'rehearsal', this.userId());
    return deckId;
  },

  initRunStatus: function(deckId, runId, ownerId) {
    return RunStatus.insert({
      deckId: deckId,
      runId: runId,
      ownerId: ownerId,
      curIndex : { indexh: 0, indexv: 0 },
      pluginData : { }
    });
  }
});
