// allinone plugins registry
DPPlugins = {};

DPPlugins._meta = {};

DPPlugins._meta.registeredTemplates = {};
dpPluginRegTemplate = function(type, dpMode) {
  if (!DPPlugins._meta.registeredTemplates[type]) {
    if (DPPlugins[type]) {
      var t = Template[dpMode + '-slide-' + type];
      logger.info('will reg template', dpMode, type);
      if (DPPlugins[type].templateRendered) {
        t.rendered = DPPlugins[type].templateRendered[dpMode];
      }
      if (DPPlugins[type].templateHelpers) {
        t.helpers(DPPlugins[type].templateHelpers[dpMode]());
      }
      if (DPPlugins[type].templateEvents) {
        t.events(DPPlugins[type].templateEvents[dpMode]());
      }
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
      logger.info('All plugin types:', allTypes);
    }
    return allTypes;
  };
})();

dpPluginChangeType = function(deckId, slideIndex, toType) {
  var slidePrefix = 'slides.' + slideIndex;
  var setData = {};
  setData[ slidePrefix + '.type'] = toType;
  if (DPPlugins[toType].init) {
    var v = DPPlugins[toType].init();
    setData[ slidePrefix + '.content' ] = v;
  }
  logger.info('dpPluginChangeType will set:', { _id: deckId }, { $set: setData });
  Decks.update({ _id: deckId }, { $set: setData });
};
