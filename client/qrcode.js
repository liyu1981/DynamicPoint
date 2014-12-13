Template.qrcode.rendered = function() {
  commonDPPageSetup();
  $(function() {
    waitfor('.qrcode-container', function() {
      $('.qrcode-container').each(function(index, elem) {
        var e = $(elem);
        var size = Math.min(e.width(), $(document).height() * 0.8);
        new QRCode(elem, {
          text: qualifyURL(e.attr('rawUrl')),
          width: size,
          height: size
        });
      });
    });
  });
};
