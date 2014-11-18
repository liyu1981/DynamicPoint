Router.route('/login', function() {
  var self = this;
  Meteor.Loader.loadJsAndCss([
  ],
  function() {
    self.render('login');
  });
});


