;(function() {

  var ckeditorConfig = {
    customConfig: 'js/ckeconfig.js'
  };

  function saveChange(e) {
    // e is the jquery object of current .slide
    var v = {};
    var type = e.attr('slideType');
    var index = parseInt(e.attr('slideIndex'));
    var h = e.html().trim();
    v['slides.' + index + '.content'] = h;
    dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: v });
  }

  function EditMgr() {
    this.currentTarget = null;
    this.currentFacilities = {};
    this.curerntTargetMode = null;

    this._modeFSM = {
      'null -> edit': function(mgr, callback) {
        var t = mgr.currentTarget;
        t.addClass('in-edit');
        t.attr('contenteditable', true);
        CKEDITOR.disableAutoInline = true;
        var e = CKEDITOR.inline(t.get(0), ckeditorConfig);
        mgr.currentFacilities['ckeditor'] = {
          instance: e,
          releaseFunc: function(cke) {
            cke.destroy();
            t.removeAttr('contenteditable');
          }
        };
        t.focus();
      },

      'null -> transform': function(mgr, callback) {
        var t = mgr.currentTarget;
        t.addClass('in-transform');
        //var draggie = new Draggabilly(t.get(0));
        //mgr.currentFacilities['draggie'] = {
        //  instance: draggie,
        //  releaseFunc: function(draggie) {
        //    draggie.disable();
        //  }
        //};
        t.attr('tabindex', '1');
        t.keyup(function(event) {
          if (event.keyCode === 46) {
            //console.log('will delete this', event.currentTarget);
            var e = $(event.currentTarget);
            var dpc = e.closest('.dp-content');
            mgr.releaseCurrentTarget(function() {
              e.remove();
              saveChange(dpc);
            });
          }
        });
        t.focus();
      },

      'transform -> edit': function(mgr, callback) {
        mgr.changeMode(null);
        mgr.currentTarget.off('keyup');
        mgr.changeMode('edit');
      },

      'edit -> null': function(mgr, callback) {
        var t = mgr.currentTarget;
        var f = mgr.currentFacilities['ckeditor'];
        if (f) {
          f.releaseFunc(f.instance);
          mgr.currentFacilities['ckeditor'] = null;
        }
        t.removeClass('in-edit');
        t.removeAttr('tabindex');
      },

      'transform -> null': function(mgr, callback) {
        var t = mgr.currentTarget;
        var f = mgr.currentFacilities['draggie'];
        if (f) {
          f.releaseFunc(f.instance);
          mgr.currentFacilities['draggie'] = null;
        }
        t.removeClass('in-transform');
      }
    };
  }

  EditMgr.prototype.changeMode = function(mode, callback) {
    callback = callback || function() {};
    if (mode === null || this.curerntTargetMode === mode) {
      callback(null);
    }
    var t = sprintf('%s -> %s', this.curerntTargetMode, mode);
    if (this._modeFSM[t]) {
      this._modeFSM[t](this, callback);
      this.curerntTargetMode = mode;
    } else {
      callback(new Error('Can not:' + t));
    }
  };

  EditMgr.prototype.setTarget = function(target) {
    // target should be jquery obj
    if (!target.get(0)) { return; }
    if (this.currentTarget !== null && this.currentTarget.get(0) == target.get(0)) { return; }
    if (this.currentTarget !== null) {
      this.releaseCurrentTarget();
    }
    //console.log('will set target:', target);
    this.currentTarget = target;
  };

  EditMgr.prototype.releaseCurrentTarget = function(callback) {
    if (this.currentTarget === null) { return; }
    this.changeMode(null);
    _.each(this.currentFacilities, function(f) {
      if (f && f.releaseFunc) {
        f.releaseFunc(f.instance);
      }
    });
    this.currentFacilities = {};
    this.currentTarget = null;
    if (callback) { callback(); }
  };

  DPPlugins['normal'] = {
    displayName: 'Normal',

    init: function() {
      return '<div style=""><h2>Hello</h2></div>';
    },

    templateUpdated: {
      'author': function() {
        console.log('updated me');
      }
    },

    templateRendered: {
      'author': function() {
        this.editmgr = new EditMgr();
        //var observerSubchild = new MutationObserver(function(items, observer) {
        //  console.log('content changed', items, observer);
        //  var v = {};
        //  var type = e.attr('slideType');
        //  var index = parseInt(e.attr('slideIndex'));
        //  var h = e.html().trim();
        //  v['slides.' + index + '.content'] = h;
        //  dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: v });
        //});
        //observerSubchild.observe(e.get(0), { childList: true, subtree: true });
      }
    },

    templateHelpers: {
      'author': function() {
        return {
          authorContent: function() {
            // have to do this to overcome the contenteditable issue of meteor now
            // ref: https://github.com/meteor/meteor/issues/1964
            return sprintf('<div id="content%s" class="content dp-content" slideIndex="%d">%s</div>', this.id, this.index, this.content);
          }
        };
      }
    },

    templateEvents: {
      'author': function() {
        return {
          'click .dp-content': function(event) {
            if (event.target == event.currentTarget) {
              // make sure that not a child is clicked
              var ti = Template.instance();
              if (ti && ti.editmgr) {
                ti.editmgr.releaseCurrentTarget(function() {
                  saveChange($(event.currentTarget));
                });
              }
            }
          },

          'click .dp-content > div': function(event) {
            var ti = Template.instance();
            if (ti && ti.editmgr) {
              ti.editmgr.setTarget($(event.currentTarget));
              ti.editmgr.changeMode('transform');
            }
          },

          'dblclick .dp-content > div': function(event) {
            var ti = Template.instance();
            if (ti && ti.editmgr) {
              ti.editmgr.setTarget($(event.currentTarget));
              ti.editmgr.changeMode('edit');
            }
          }
        };
      }
    }
  };

})();
