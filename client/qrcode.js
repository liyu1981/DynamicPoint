Router.route('/qrcode', function() {
  var self = this;
  Meteor.Loader.loadJsAndCss([
    'bower_components/qrcodejs/qrcode.min.js'
  ],
  function() {
    if (self.params.query.id) {
      self.render('qrcode', {
        data: {
          id: self.params.query.id,
          showall: (self.params.query.showall ? true : false)
        }
      });
    } else {
      Router.go('/author');
    }
  });
});

Template.qrcode.rendered = function() {
  $(function() {
    $('body')
      .addClass('dp-author') // add the global dp-author class
      .addClass('dp-author-theme-specklednoise') // default theme
      ;
    waitfor('.qrcode-container', function() {
      $('.qrcode-container').each(function(index, elem) {
        var e = $(elem);
        var size = Math.min(e.width(), $(document).height() * 0.8);
        console.log('will draw:', {
          text: qualifyURL(e.attr('rawUrl')),
          width: size,
          height: size
        });
        new QRCode(elem, {
          text: qualifyURL(e.attr('rawUrl')),
          width: size,
          height: size
        });
      });
    });
  });
};
