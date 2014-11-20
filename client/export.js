Router.route('/export', function() {
  var self = this;
  dpMode = 'export';
  Meteor.Loader.loadJsAndCss([
    'bower_components/blob/Blob.js',
    'bower_components/FileSaver/FileSaver.min.js'
  ],
  function() {
    if (self.params.query.id) {
      dpTheDeck = Decks.findOne({ _id: self.params.query.id });
      logger.info('find the deck:', dpTheDeck, { _id: self.params.query.id });
      if (dpTheDeck) {
        var datastr = JSON.stringify(_.pick(dpTheDeck, 'author', 'title', 'created', 'lastModified', 'slides'), null, '  ');
        var blob = new Blob([datastr], { type: "text/plain;charset=utf-8" });
        saveAs(blob, dpTheDeck._id + '.dp');
        setTimeout(function() { window.close(); }, 1000); // auto-close window after 1s
      }
    } else {
      Router.go('/author');
    }
  });
});
