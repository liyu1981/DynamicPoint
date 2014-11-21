Template.welcome.rendered = function() {
  commonDPPageSetup();
  $(function() {
    $('body').addClass('dp-welcome');
    $('#bigtext').bigtext();
  });
};

Template.welcome.events({
  'click #gotoProfile': function() {
    window.location.href = '/profile?id=' + Meteor.userId();
  },

  'click #facebookLoginBtn': function() {
    Meteor.loginWithFacebook({}, function(err) {
      if (err) {
        return logger.error(err);
      }
      window.location.href = '/profile?id=' + Meteor.userId();
    });
  },

  'click #githubLoginBtn': function() {
    Meteor.loginWithGithub({}, function(err) {
      if (err) {
        return logger.error(err);
      }
      window.location.href = '/profile?id=' + Meteor.userId();
    });
  }
});
