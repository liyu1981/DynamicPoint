// allinone plugins registry
DPPlugins = {};

DPPlugins._meta = {};
var meta = DPPlugins._meta;

function DPPluginRuntime(dpMode, pluginType) {
  this.dpMode = dpMode;
  this.pluginType = pluginType;
}

DPPluginRuntime.prototype.getPluginData = function(slideData, slideId) {
  if (!slideData) { return {}; }
  slideId = slideId || 'deck';
  return deepGet(slideData, ['runStatus', 'pluginData', this.pluginType, slideId ], {});
};

DPPluginRuntime.prototype.getPluginDataPrefix = function(slideId) {
  slideId = slideId || 'deck';
  return sprintf('pluginData.%s.%s.', this.pluginType, slideId);
};

DPPluginRuntime.prototype.update = function(cmd) {
  RunStatus.update({ _id: dpRunStatus._id }, cmd);
};

DPPluginRuntime.prototype.getSlideFocusMgr = function() {
  return meta.slideFocusMgr;
};

var dpPluginReg = (function() {
  // only reg a plugin when it is not reged before
  meta.registered = {};

  function pluginReg(type, dpMode, t, pt) {
    // t is meteor template
    // pt is our plugin.template
    //logger.info('try plugin reg:', type, dpMode, t, pt);

    // created is somehow special, as we need to inject our runtime
    t.created = function() {
      // inject our plugin runtime to this template instance
      this.dpprt = new DPPluginRuntime(dpMode, type);
      // inject the updating notification logic if it requires updated event
      if (pt['updated'] && pt['updated'][dpMode]) {
        this.autorun(function() {
          // depend on the currentData to be notified when slide changed
          Template.currentData();
          // but only notify plugin after the templated is actually rendered to some nodes
          if (this._templateInstance.firstNode && this._templateInstance.lastNode) {
            pt['updated'][dpMode].call(this._templateInstance);
          }
        });
      }
      // finally chain the calling to plugin's created
      if (pt['created'] && pt['created'][dpMode]) {
        pt['created'][dpMode].call(this);
      }
    };

    _.each(['rendered', 'destroyed'], function(evname) {
      if (pt[evname] && pt[evname][dpMode]) {
        t[evname] = pt[evname][dpMode];
      }
    });

    _.each(['helpers', 'events'], function(fname) {
      if (pt[fname] && pt[fname][dpMode]) {
        t[fname](pt[fname][dpMode]());
      }
    });
  }

  return function(type, dpMode) {
    //logger.info('will reg template outer', dpMode, type, meta.registeredTemplates[type]);
    if (DPPlugins[type] && !meta.registered[type]) {
      //logger.info('will reg template', dpMode, type);
      _.each(['', '-toolbar', '-authortool'], function(subtype) {
        var t = Template[dpMode + '-slide-' + type + subtype];
        var pt = DPPlugins[type]['template' + subtype];
        if (t && pt) {
          pluginReg(type, dpMode, t, pt);
        }
      });
    }
    meta.registered[type] = true;
  };
})();

dpPluginRegAll = function(dpMode) {
  var allTypes = dpPluginGetAllTypes();
  _.each(allTypes, function(t) {
    dpPluginReg(t.id, dpMode);
  });
};

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
  dpSaveMgr.add(Decks, 'update', deckId, { $set: setData });
  dpSaveMgr.saveNow();
};

dpPluginObserve = function(eventPrefix, collection, documentId, jqTarget) {
  collection.find({ _id: documentId }).observeChanges({
    changed: function(id, fields) {
      jqTarget.trigger(eventPrefix + 'Changed', [id, fields]);
    },
    removed: function(id) {
      jqTarget.trigger(eventPrefix + 'Removed', [id]);
    }
  });
};

