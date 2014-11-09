Template.keynote.helpers({
  slides: [
      { content: 'slide 1' },
      { content: 'slide 2' }
    ]
});

Meteor.startup(function () {
  // code to run on client at startup
  Reveal.initialize();
});

