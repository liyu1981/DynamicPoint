Meteor.methods({
  importFile: function(blob) {
    console.log('got your blob:', blob, typeof blob);
    var d = EJSON.toJSONValue(EJSON.parse(blob));
    var nd = genNewDeck(d);
    return Decks.insert(nd);
  }
});

Meteor.startup(function () {
  // code to run on server at startup
});
