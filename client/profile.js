var runStatusLists = new ReactiveDict;

Template.profileDeckListItem.helpers({
  runStatusList: function() {
    var self = this;
    var l = runStatusLists.get(this.id);
    if (!l) {
      Meteor.call('listRunStatus', this.id, function(err, data) {
        //logger.info('will listRunStatus set', self.id, data);
        runStatusLists.set(self.id, data);
      });
    }
    return l;
  }
});

Template.profileDeckList.helpers({
  decks: function() {
    var r =  _.map(_.sortBy(this, function(d) { return 0 - d.created; }), function(d) {
      return {
        id: d._id,
        title: d.title,
        created: Math.floor(d.created/1000),
        author: d.author
      };
    });
    return r;
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
