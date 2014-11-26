;(function() {

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
        var e = this.$('.editable');
        var observerSubchild = new MutationObserver(function(items, observer) {
          console.log('content changed', items, observer);
          var v = {};
          var type = e.attr('slideType');
          var index = parseInt(e.attr('slideIndex'));
          var h = e.html().trim();
          v['slides.' + index + '.content'] = h;
          dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: v });
        });
        observerSubchild.observe(e.get(0), { childList: true, subtree: true });
      }
    },

    templateHelpers: {
      'author': function() {
        return {
          authorContent: function() {
            // have to do this to overcome the contenteditable issue of meteor now
            // ref: https://github.com/meteor/meteor/issues/1964
            return sprintf('<div id="content%s" class="content editable" contenteditable="true" slideIndex="%d">%s</div>', this.id, this.index, this.content);
          }
        };
      }
    },

    templateEvents: {
      'author': function() {
        return {
          'focusin .editable': function(event) {
            var t = event.currentTarget;
            t.classList.add('editable-focused');
            logger.info('focusin');
            // clear previous editor instances first, so in any time we only keep one instance in page
            _.each(window.CKEDITOR.instances, function(e, k) {
              e.destroy();
            });
            // now start this target's inline editor
            window.CKEDITOR.disableAutoInline = true;
            var e = window.CKEDITOR.inline(t.id, { customConfig: 'js/ckeconfig.js' });
            e.on('blur', function(event) {
              // here is the real focusout part of our editor
              logger.info('focusout');
              t.classList.remove('editable-focused');
            });
          },
          'focusout .editable': function(event) {
            // we do not use this to focus out, instead we listen on ckeditor's event blur
            // we do this is to avoid the wrongly focusout action when we click any buttons in ckeditor toolbar
            event.preventDefault();
          }
        };
      }
    }
  };

})();
