;(function() {

  function saveChange(e) {
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
        var e = CKEDITOR.inline(t.get(0), { startupFocus : true, customConfig: 'js/ckeconfig.js' });
        e.on('blur', function(event) {
          mgr.changeMode('null');
          saveChange(t.closest('.dp-content'));
        });
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
        var draggie = new Draggabilly(t.get(0));
        mgr.currentFacilities['draggie'] = {
          instance: draggie,
          releaseFunc: function(draggie) {
            draggie.disable();
          }
        };
      },

      'transform -> edit': function(mgr, callback) {
        mgr.changeMode(null);
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
    if (this.curerntTargetMode === mode) {
      callback(null);
    }
    var t = sprintf('%s -> %s', this.curerntTargetMode, mode);
    if (this._modeFSM[t]) {
      this._modeFSM[t](this, callback);
    } else {
      callback(new Error('Can not:' + t));
    }
  };

  EditMgr.prototype.setTarget = function(target) {
    // target should be jquery obj
    if (this.currentTarget !== null && this.currentTarget === target) {
      this.releaseLastTarget();
    }
    this.currentTarget = target;
  };

  EditMgr.prototype.releaseLastTarget = function() {
    this.changeMode(null);
    _.each(this.currentFacilities, function(f) {
      if (f && f.releaseFunc) {
        f.releaseFunc(f.instance);
      }
    });
    this.currentFacilities = {};
    this.currentTarget = null;
  };

  DPPlugins['normal'] = {
    displayName: 'Normal',

    init: function() {
      return '<div style="position: absolute;"><h2>Hello</h2></div>';
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
          'click .dp-content > div': function(event) {
            console.log('this is', this, Template.instance());
            var ti = Template.instance();
            ti.editmgr.setTarget($(event.currentTarget));
            // single click to turn the target to transform mode
            ti.changeMode('transform');
            event.stopPropagation();
          },

          'dblclick .dp-content > div': function(event) {
            var ti = Template.instance();
            ti.editmgr.setTarget($(event.currentTarget));
            ti.changeMode('edit');
          }
        };
      }
    }
  };

})();
