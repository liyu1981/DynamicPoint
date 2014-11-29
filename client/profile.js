Template.profileSlidesList.helpers({
  slides: function() {
    return _.map(_.sortBy(this, function(d) { return 0 - d.created; }), function(d) {
      return {
        id: d._id,
        title: d.title,
        created: d.created/1000,
        author: d.author
      }
    });
  }
});

Template.profile.rendered = function() {
  commonDPPageSetup();
};

Template.profile.helpers({
  currentUserDisplayName: currentUserDisplayName
});

Template.profile.events({
  'click #logoutBtn': function(event) {
    Meteor.logout(function() {
      window.location.href = '/welcome';
    });
  },

  'click #newDeckBtn': function(event) {
    Decks.insert(genNewDeck(), function(err, id) {
      if (err) {
        return alertify.alert('Error: ' + JSON.stringify(err));
      }
    });
  },

  'click .delete-this-deck': function(event) {
    event.stopPropagation();
    event.preventDefault();
    var e = $(event.currentTarget);
    var di = e.closest('.dp-deck-item');
    var deckId = di.attr('deckId');
    alertify.confirm('Do you want ot delete Deck: ' + deckId + ' ?', function() {
      Decks.remove({ _id: deckId });
    }).setHeader('Caution!');
  },

  'click .duplicate-this-deck': function(event) {
    event.stopPropagation();
    event.preventDefault();
    var e = $(event.currentTarget);
    var di = e.closest('dp-deck-item');
    var deckId = di.attr('deckId');
    var deck = Decks.findOne({ _id: deckId });
    Decks.insert(genNewDeck(deck));
  }
});
