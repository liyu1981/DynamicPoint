Router.route('/login', function() {
  var self = this;
  Meteor.Loader.loadJsAndCss([
    'bower_components/alertify-js/build/css/alertify.min.css',
    'bower_components/alertify-js/build/css/themes/default.css',
    'bower_components/alertify-js/build/alertify.min.js',
    'js/alertifyext.js'
   ],
  function() {
    self.render('login');
  });
});

Template.login.rendered = function() {
  commonDPPageSetup();
};

