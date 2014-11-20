// logger
logger = null;
if (Meteor.isServer) { logger = Winston; }
if (Meteor.isClient) { logger = console; }

// common collections
Decks = new Mongo.Collection('Decks');
RunStatus = new Mongo.Collection('RunStatus');
DPConf = new Mongo.Collection('DPConf');

// common util functions
getExt = function(file) {
  // ext algorithm taken from http://stackoverflow.com/a/12900504
  return file.substr((~-file.lastIndexOf('.') >>> 0) + 2);
};

cloneSlide = function(slide) {
  return _.extend(_.clone(slide), { id: Random.id() });
};

genEmptySlide = function(type) {
  switch(type) {
    default: return {
      id: Random.id(),
      type: 'normal',
      content: 'hello'
    };
  }
};

genNewDeck = function(data) {
  var defaultDeck = {
    ownerId: Meteor.userId(),
    author: Meteor.user().profile.name,
    title: 'My Next Big Talk',
    created: (new Date()).getTime(),
    lastModified: (new Date()).getTime(),
    slides: [ genEmptySlide() ]
  };
  return _.defaults(data || {}, defaultDeck);
};

