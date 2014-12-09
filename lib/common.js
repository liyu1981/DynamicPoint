// logger
logger = null;
if (Meteor.isServer) { logger = Winston; }
if (Meteor.isClient) { logger = console; }

// common collections
Decks = new Mongo.Collection('Decks');
RunStatus = new Mongo.Collection('RunStatus');
DPConf = new Mongo.Collection('DPConf');

// deepGet from http://designpepper.com/blog/drips/making-deep-property-access-safe-in-javascript.html
deepGet = function(obj, props, defaultValue) {
  // If we have reached an undefined/null property
  // then stop executing and return the default value.
  // If no default was provided it will be undefined.
  if (obj === undefined || obj === null) {
    return defaultValue;
  }
  // If the path array has no more elements, we've reached
  // the intended property and return its value
  if (props.length === 0) {
    return obj;
  }
  // Prepare our found property and path array for recursion
  var foundSoFar = obj[props[0]];
  var remainingProps = props.slice(1);
  return deepGet(foundSoFar, remainingProps, defaultValue);
}

// common util functions
getExt = function(file) {
  // ext algorithm taken from http://stackoverflow.com/a/12900504
  return file.substr((~-file.lastIndexOf('.') >>> 0) + 2);
};

cloneSlide = function(slide) {
  return _.extend(_.clone(slide), { id: Random.id() });
};

genEmptySlide = function(type, data) {
  data = data || {};
  return _.extend({
    id: Random.id(),
    type: type || 'normal',
    content: ((DPPlugins[type].init) ? DPPlugins[type].init() : '')
  }, data);
};

genNewDeck = function(data) {
  var defaultDeck = {
    ownerId: Meteor.userId(),
    author: Meteor.user().profile.name,
    title: 'My Next Big Talk',
    created: (new Date()).getTime(),
    lastModified: (new Date()).getTime(),
    slides: [ genEmptySlide('normal') ]
  };
  return _.defaults(data || {}, defaultDeck);
};

currentUserDisplayName = function () {
  var user = Meteor.user();
  if (!user)
    return '';
  if (user.profile && user.profile.name)
    return user.profile.name;
  if (user.username)
    return user.username;
  if (user.emails && user.emails[0] && user.emails[0].address)
    return user.emails[0].address;
  return '';
};

formatDocumentTitle = function(str) {
  return sprintf('%s - %s - %s', 'DynamicPoint', dpMode, str);
}

