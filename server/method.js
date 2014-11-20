Meteor.methods({
  importFile: function(blob) {
    logger.info('importFile with blob:', blob);
    var d = EJSON.toJSONValue(EJSON.parse(blob));
    var nd = genNewDeck(d);
    return Decks.insert(nd);
  }
});

Meteor.startup(function () {
  // code to run on server at startup
});
