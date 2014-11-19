Router.route('/', function() {
  Router.go('/welcome');
});

Router.route('/welcome', function() {
  var self = this;
  Meteor.Loader.loadJsAndCss([
    'bower_components/alertify-js/build/css/alertify.min.css',
    'bower_components/alertify-js/build/css/themes/default.css',
    'bower_components/alertify-js/build/alertify.min.js',
    'js/alertifyext.js',
    'bower_components/bigtext/dist/bigtext.js'
   ],
  function() {
    self.render('welcome');
  });
});

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
        return console.log(err);
      }
      window.location.href = '/profile?id=' + Meteor.userId();
    });
  },

  'click #githubLoginBtn': function() {
    Meteor.loginWithGithub({}, function(err) {
      if (err) {
        return console.log(err);
      }
      window.location.href = '/profile?id=' + Meteor.userId();
    });
  }
});
