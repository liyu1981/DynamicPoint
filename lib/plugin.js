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
