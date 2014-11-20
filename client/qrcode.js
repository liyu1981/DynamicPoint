Template.qrcode.rendered = function() {
  $(function() {
    $('body')
      .addClass('dp') // add the global dp-author class
      .addClass('dp-theme-specklednoise') // default theme
      ;
    waitfor('.qrcode-container', function() {
      $('.qrcode-container').each(function(index, elem) {
        var e = $(elem);
        var size = Math.min(e.width(), $(document).height() * 0.8);
        logger.info('will draw:', {
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
