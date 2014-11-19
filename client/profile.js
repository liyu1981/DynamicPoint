var urlParams = null;

Router.route('/profile', function() {
  var self = this;
  if (this.params.query.id) {
    urlParams = this.params;
    Meteor.Loader.loadJsAndCss([
      'bower_components/alertify-js/build/css/alertify.min.css',
      'bower_components/alertify-js/build/css/themes/default.css',
      'bower_components/alertify-js/build/alertify.min.js',
      'js/alertifyext.js',
      'bower_components/html2canvas/build/html2canvas.min.js'
     ],
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

