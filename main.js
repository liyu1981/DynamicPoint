Decks = new Mongo.Collection("Decks");
DPConf = new Mongo.Collection("DPConf");

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
    author: 'John Smith',
    title: 'New DynamicPoint Deck',
    created: (new Date()).getTime(),
    lastModified: (new Date()).getTime(),
    slides: [ genEmptySlide() ]
  };
  return _.defaults(data || {}, defaultDeck);
};

