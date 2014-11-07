if (Meteor.isClient) {
  Meteor.startup(function () {
    // code to run on client at startup
    Reveal.initialize();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
