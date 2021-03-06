Meteor.methods({
  newDeck: function() {
    if (this.userId) {
      var nd = genNewDeck();
      var deckId = Decks.insert(nd);
      Meteor.call('initRunStatus', deckId, 'rehearsal', this.userId);
      return deckId;
    } else {
      throw new Meteor.Error('Can not create new deck with no user logged in.');
    }
  },

  importFile: function(blob) {
    if (this.userId) {
      logger.info('importFile with blob:', blob);
      var d = EJSON.toJSONValue(EJSON.parse(blob));
      var nd = genNewDeck(d);
      var deckId = Decks.insert(nd);
      // defaultly create a rehearsal runStatus
      Meteor.call('initRunStatus', deckId, 'rehearsal', this.userId);
      return deckId;
    } else {
      throw new Meteor.Error('Can not create new deck with no user logged in.');
    }
  },

  initRunStatus: function(deckId, runId, ownerId) {
    return RunStatus.insert({
      deckId: deckId,
      runId: runId,
      ownerId: ownerId,
      curIndex : { indexh: 0, indexv: 0 },
      pluginData : { }
    });
  },

  listRunStatus: function(deckId) {
    return _.map(RunStatus.find({ 'deckId': deckId }).fetch(), function(item) {
      return {
        id: item._id,
        checked: (item.runId === 'rehearsal' ? 'checked' : ''),
        displayName: (item.runId === 'rehearsal' ? 'rehearsal' : sprintf('Entry: %s', item._id))
      };
    });
  }
});
