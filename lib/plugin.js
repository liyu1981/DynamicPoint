// allinone plugins registry
DPPlugins = {};

DPPlugins._meta = {};
var meta = DPPlugins._meta;

dpPluginRegTemplate = (function() {
  // only reg a tempalte when it is not reged before
  meta.registeredTemplates = {}; // use this to remember what have reged
  return function(type, dpMode) {
    //logger.info('will reg template outer', dpMode, type, meta.registeredTemplates[type]);
    if (DPPlugins[type] && !meta.registeredTemplates[type]) {
      logger.info('will reg template', dpMode, type);
      var t = Template[dpMode + '-slide-' + type];
      if (DPPlugins[type].templateRendered && DPPlugins[type].templateRendered[dpMode]) {
        t.rendered = DPPlugins[type].templateRendered[dpMode];
      }
      if (DPPlugins[type].templateHelpers && DPPlugins[type].templateHelpers[dpMode]) {
        t.helpers(DPPlugins[type].templateHelpers[dpMode]());
      }
      if (DPPlugins[type].templateEvents && DPPlugins[type].templateEvents[dpMode]) {
        t.events(DPPlugins[type].templateEvents[dpMode]());
      }
    }
    meta.registeredTemplates[type] = true;
  };
})();

dpPluginGetAllTypes = (function() {
  meta.allTypes = null;
  return function() {
    if (meta.allTypes === null) {
      (function() {
        var re = /^_/;
        meta.allTypes = _.reduce(DPPlugins, function(memo, v, k) {
          if (!re.test(k)) {
            memo.push({ id: k, displayName: (v.displayName || k) });
          }
          return memo;
        }, []);
      })();
      logger.info('All plugin types calculated:', meta.allTypes);
    }
    return meta.allTypes;
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
