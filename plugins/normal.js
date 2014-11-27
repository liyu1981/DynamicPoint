;(function() {

  function saveChange(e) {
    var v = {};
    var type = e.attr('slideType');
    var index = parseInt(e.attr('slideIndex'));
    var h = e.html().trim();
    v['slides.' + index + '.content'] = h;
    dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: v });
  }

  DPPlugins['normal'] = {
    displayName: 'Normal',

    init: function() {
      return '<h2>Hello</h2>';
    },

    templateUpdated: {
      'author': function() {
        console.log('updated me:', this, this.data.index, $('.editable'));
      }
    },

    templateRendered: {
      'author': function() {
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
            var t = $(event.currentTarget);
            if (t.hasClass('in-edit')) { return; }
            if (t.hasClass('in-transform')) { return; }
            t.addClass('in-transform');
            var draggie = new Draggabilly(t.get(0));
            t.data('draggie', draggie);
            event.stopPropagation();
          },

          'dblclick .dp-content > div': function(event) {
            var t = $(event.currentTarget);
            if (t.hasClass('in-edit')) { return; }
            if (t.hasClass('in-transform')) {
              // exit transform if it is on
              t.data('draggie').disable();
              t.data('draggie', null);
              //t.data('draggie', null);
              t.removeClass('in-transform');
            }
            t.addClass('in-edit');
            t.attr('contenteditable', true);
            logger.info('focusin');
            // now start this target's inline editor
            CKEDITOR.disableAutoInline = true;
            var e = CKEDITOR.inline(t.get(0), { startupFocus : true, customConfig: 'js/ckeconfig.js' });
            e.on('blur', function(event) {
              logger.info('focusout');
              t.removeAttr('contenteditable');
              t.removeClass('in-edit');
              e.destroy();
              saveChange(t.closest('.dp-content'));
            });
            t.focus();
          }
        };
      }
    }
  };

})();
