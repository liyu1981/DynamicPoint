var urlParams = null;

Router.route('/profile', function() {
  var self = this;
  dpMode = 'profile';
  if (this.params.query.id) {
    urlParams = this.params;
    loadJsAndCss(dpMode,
      [],
      function() {
        self.render('profile');
      });
  } else {
    window.location.href = '/welcome';
  }
});

Template.profileSlidesList.helpers({
  slides: function() {
    return _.map(Decks.find({ ownerId: urlParams.query.id }).fetch(), function(d) {
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

