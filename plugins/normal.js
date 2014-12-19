var ckeditorConfig = {
  customConfig: 'js/ckeconfig.js'
};

function withCurrentSlide(callback) {
  var dpprt = Template.instance().dpprt;
  var sfm = dpprt.getSlideFocusMgr();
  if (sfm && sfm.currentSlide) {
    callback && callback(sfm.currentSlide);
  }
}

function saveSlideChange(e, data) {
  // e is the jquery object of current section.present
  if (!e) { return; }
  data = data || {};
  var s = e.closest('.slide');
  var mongoSlidePrefix = sprintf('slides.%d.', parseInt(s.attr('slideIndex')));
  var setData = {};
  setData[mongoSlidePrefix + 'content'] = e.html().trim();
  _.each(data, function(v, k) { setData[mongoSlidePrefix + k] = v; });
  dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: setData });
}

function saveSlideChangeNow(e, data) {
  saveSlideChange(e, data);
  dpSaveMgr.saveNow();
}

var dpTransformerUIConf = {
  'text': 'w e',
  'image': 'all',
  'iframe': 'all'
};

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
      var draggie = new Draggabilly(t.get(0));
      mgr.currentFacilities['draggie'] = {
        instance: draggie,
        releaseFunc: function(draggie) {
          draggie.disable();
        }
      };
      var transformer = new DPTransformer(t.get(0), { ui: dpTransformerUIConf[t.attr('data-block-type')] });
      mgr.currentFacilities['transformer'] = {
        instance: transformer,
        releaseFunc: function(transformer) {
          transformer.disable();
        }
      };
      //t.attr('tabindex', '1');
      //t.keyup(function(event) {
      //  if (event.keyCode === 46) {
      //    //console.log('will delete this', event.currentTarget);
      //    var e = $(event.currentTarget);
      //    var dpc = e.closest('.dp-content');
      //    mgr.releaseCurrentTarget(function() {
      //      e.remove();
      //      saveSlideChange(dpc);
      //    });
      //  }
      //});
      //t.focus();
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
    logger.info('change mode:', t);
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
    return [
      '<div class="sl-block" data-block-type="text" style="left: 10px; top: 267px; width: 980px;">',
      '<div class="sl-block-content"><h1>Hello</h1></div>',
      '</div>'
    ].join('');
  },

  template: {
    updated: {
      'author': function() {
        console.log('updated me');
      }
    },

    rendered: {
      'author': function() {
        var self = this;
        this.editmgr = new EditMgr();
        if (this.firstNode) {
          $(this.firstNode).closest('.slide').on('defocus.slide.dp', function() {
            var slide = this;
            self.editmgr.releaseCurrentTarget(function() {
              saveSlideChange($(slide).find('section.present'));
            });
          });
        }
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

    helpers: {
      'author': function() {
        var authorContentTpl = [
          '<div id="content%s" class="content dp-content reveal" slideIndex="%d">',
          '<div class="slides" style="width: 960px; height: 700px;">',
          '<section class="present">',
          '%s',
          '</section>',
          '</div>',
          '</div>'
        ].join('');
        return {
          authorContent: function() {
            // have to do this to overcome the contenteditable issue of meteor now
            // ref: https://github.com/meteor/meteor/issues/1964
            return sprintf(authorContentTpl, this.id, this.index, this.content);
          }
        };
      }
    },

    events: {
      'author': function() {
        return {
          'click .dp-content section': function(event) {
            if ($(event.target).is('section.present')) {
              // currentTarget is not inside a section.present, so user clicked
              // somewhere of our canvas, now we clear the selection
              var ti = Template.instance();
              if (ti && ti.editmgr) {
                ti.editmgr.releaseCurrentTarget(function() {
                  saveSlideChange($(event.currentTarget));
                });
              }
            }
          },

          'click .dp-content section div.sl-block': function(event) {
            var ti = Template.instance();
            if (ti && ti.editmgr) {
              ti.editmgr.setTarget($(event.currentTarget));
              ti.editmgr.changeMode('transform');
            }
          },

          'dblclick .dp-content section div.sl-block': function(event) {
            if ($(event.currentTarget).attr('data-block-type') === 'text') {
              var ti = Template.instance();
              if (ti && ti.editmgr) {
                ti.editmgr.setTarget($(event.currentTarget));
                ti.editmgr.changeMode('edit');
              }
            }
          }
        };
      }
    }
  },

  'template-toolbar': {
  },

  'template-authortool': {
    events: {
      'author': function() {
        function genInsertHandler(htmlGenerator) {
          return function(event) {
            withCurrentSlide(function(currentSlide) {
              htmlGenerator(function(html) {
                var node = $(html);
                currentSlide.find('.dp-content section.present').append(node);
              });
            });
          };
        }

        var blockTpl = '<div class="sl-block" data-block-type="%s" %s><div class="sl-block-content">%s</div></div>';

        return {
          'click #insertTextBlockBtn': genInsertHandler(function(next) {
            next(sprintf(blockTpl, 'text', 'style="left: 386px; top: 276px;"', '<h3>Hello,world</h3>'));
          }),

          'click #insertListBlockBtn': genInsertHandler(function(next) {
            next(sprintf(blockTpl, 'text', 'style="left: 386px; top: 276px;"', '<ul><li>hello</li><li>world</li></ul>'));
          }),

          'click #insertImageBtn': genInsertHandler(function(next) {
            alertify.prompt('The URI of image',
              'https://graph.facebook.com/minhua.lin.9/picture?type=large',
              function(event, value) {
                next(sprintf(blockTpl, 'image', '', '<img src="' + value + '"></img>'));
              }).setHeader('Insert Image');
          }),

          'click #insertCodeBlockBtn': genInsertHandler(function(next) {
            alertify.codePrompt('Paste code here',
              'console.log(\'hello,world\');',
              function(event, value) {
                next(sprintf(blockTpl, 'text', '', '<code>' + value + '</code>'));
              }).setHeader('Insert Code Block');
          }),

          'click #insertMediaBtn': genInsertHandler(function(next) {
            alertify.codePrompt('Paste media embeding code here',
              '<iframe width="320px" height="240px" src="//www.youtube.com/embed/l6k_5GHwLRA" frameborder="0" allowfullscreen></iframe>',
              function(event, value) {
                next(sprintf(blockTpl, 'iframe', '', value));
              }).setHeader('Insert Embedded Media');
          })
        };
      }
    }
  }
};
