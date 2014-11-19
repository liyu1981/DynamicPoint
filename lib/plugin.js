// allinone plugins registry
DPPlugins = {};

DPPlugins._meta = {};

DPPlugins._meta.registeredTemplates = {};
dpPluginRegTemplate = function(type, dpMode, eventData) {
  if (!(DPPlugins._meta.registeredTemplates[type] === true)) {
    if (DPPlugins[type]) {
      var t = Template[dpMode + '-slide-' + type];
      //console.log('will reg helpers:', t, DPPlugins[type].templateHelpers[dpMode]());
      t.helpers(DPPlugins[type].templateHelpers[dpMode]());
      //console.log('will reg events:', t, DPPlugins[type].templateEvents[dpMode](eventData));
      t.events(DPPlugins[type].templateEvents[dpMode](eventData));
    }
  }
  DPPlugins._meta.registeredTemplates = true;
};

dpPluginGetAllTypes = (function() {
  var allTypes = null;
  return function() {
    if (allTypes === null) {
      (function() {
        var re = /^_/;
        allTypes = _.reduce(DPPlugins, function(memo, v, k) {
          if (!re.test(k)) {
            memo.push({ id: k, displayName: k });
          }
          return memo;
        }, []);
        allTypes.push({ id: 'normal', displayName: 'normal'});
      })();
    }
    return allTypes;
  };
})();

dpPluginChangeType = function(deckId, slideIndex, toType) {
  var setData = {};
  setData['slides.' + slideIndex + '.type'] = toType;
  console.log('will set:', { _id: deckId }, { $set: setData });
  Decks.update({ _id: deckId }, { $set: setData });
};
