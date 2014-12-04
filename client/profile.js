var runStatusLists = new ReactiveDict;

Template.profileDeckListItem.created = function() {
  // query the runStatus list now
  var self = this;
  logger.info('will listRunStatus', this.id);
  //Meteor.call('listRunStatus', this.id, function(err, data) {
  //  logger.info('will listRunStatus set', self.id, data);
  //  runStatusLists.set(self.id, data);
  //});
};

Template.profileDeckListItem.helpers({
  runStatusList: function() {
    return runStatusLists.get(this.id);
  }
});

Template.profileDeckList.helpers({
  decks: function() {
    return _.map(_.sortBy(this, function(d) { return 0 - d.created; }), function(d) {
      return {
        id: d._id,
        title: d.title,
        created: d.created/1000,
        author: d.author
      };
    });
  }
});

Template.profile.rendered = function() {
  commonDPPageSetup();
  Session.set('documentTitle', formatDocumentTitle(currentUserDisplayName()));
};

Template.profile.helpers({
  currentUserDisplayName: currentUserDisplayName
});

Template.profile.events({
  'click #newDeckBtn': function(event) {
    Meteor.call('newDeck', function(err) {
      if (err) {
        return alertify.alert('Error: ' + JSON.stringify(err));
      }
    });
  },

  'click .delete-this-deck': function(event) {
    var e = $(event.currentTarget);
    var di = e.closest('.dp-deck-item');
    var deckId = di.attr('deckId');
    alertify.confirm('Do you want ot delete Deck: ' + deckId + ' ?', function() {
      Decks.remove({ _id: deckId });
    }).setHeader('Caution!');
  },

  'click .duplicate-this-deck': function(event) {
    var e = $(event.currentTarget);
    var di = e.closest('dp-deck-item');
    var deckId = di.attr('deckId');
    var deck = Decks.findOne({ _id: deckId });
    Decks.insert(genNewDeck(deck));
  }
});
