Router.route('/login', function() {
  var self = this;
  Meteor.Loader.loadJsAndCss([
  ],
  function() {
    self.render('login');
  });
});

Template.login.rendered = function() {
  $(function() {
    $('body')
      .addClass('dp-author') // add the global dp-author class
      .addClass('dp-author-theme-specklednoise') // default theme
      ;
    alertify.defaults.transition = 'pulse';
  });
};

