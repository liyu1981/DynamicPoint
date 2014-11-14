Router.route('/pairview', function() {
  var self = this;
  if (self.params.query.id) {
    self.render('pairview', {
      data: { id: self.params.query.id }
    });
  } else {
    Router.go('/author');
  }
});
