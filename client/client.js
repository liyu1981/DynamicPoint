dpMode = null;

Router.route('/', function() {
  dpMode = 'audience';
  this.render('audience', {
    data: function() {
      return {
        slides: [ { content: 'slide 1' }, { content: 'slide 2' } ]
      };
    }
  });
});

Router.route('/author', function() {
  dpMode = 'author';
  this.render('author');
});

Router.route('/speaker', function() {
  dpMode = 'speaker';
  this.render('speaker');
});

Template.audience.created = function() {
  Meteor.Loader.loadCss('packages/neo_reveal-js/reveal.js/css/theme/solarized.css');
};

Template.audience.rendered = function () {
  Reveal.initialize();
};

Template.author.created = function() {
};

//Meteor.startup(function () {
//});
