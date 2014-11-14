Router.route('/superview', function() {
  var self = this;
  if (self.params.query.id) {
    self.render('superview', {
      data: { id: self.params.query.id }
    });
  } else {
    Router.go('/author');
  }
});
