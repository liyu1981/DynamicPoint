Template.keynote.helpers({
  slides: [
      { content: 'slide 1' },
      { content: 'slide 2' }
    ]
});

Meteor.startup(function () {
  // code to run on client at startup
  if (dpMode === 'keynote') {
    yepnope.injectCss('packages/neo_reveal-js/reveal.js/css/theme/solarized.css', function() {
      Reveal.initialize();
    }, { id: 'theme' }, 5000);
  }
});

