Router.route('/profile', function() {
  var self = this;
  Meteor.Loader.loadJsAndCss([
  ],
  function() {
    self.render('profile');
  });
});

Template.profile.rendered = function() {
  $(function() {
    $('body')
      .addClass('dp-author') // add the global dp-author class
      .addClass('dp-author-theme-specklednoise') // default theme
      ;
    alertify.defaults.transition = 'pulse';
  });
};

