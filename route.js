dpMode = null;

Router.route('/', function () {
  dpMode = 'keynote';
  this.render('keynote');
});

Router.route('/author', function () {
  dpMode = 'authorDeck';
  this.render('authorDeck');
});
