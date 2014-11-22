Template.profileSlidesList.helpers({
  slides: function() {
    return _.map(this, function(d) {
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

Template.profile.events({
  'click #newDeckBtn': function(event) {
    Decks.insert(genNewDeck(), function(err, id) {
      if (err) {
        return alertify.alert('Error: ' + JSON.stringify(err));
      }
    });
  }
});
