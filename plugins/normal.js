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
        //var ed = startMediumEditor(e.get());
        //this.mei = ed;
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
            logger.info('focusin', event.currentTarget);
            window.CKEDITOR.disableAutoInline = true;
            window.CKEDITOR.inline(event.currentTarget.id, { customConfig: 'js/ckeconfig.js' });
          },
          'focusout .editable': function(event) {
            logger.info('focusout');
            var editorid = event.currentTarget.id;
            if (window.CKEDITOR.instances[editorid]) {
              window.CKEDITOR.instances[editorid].destroy();
            }
          }
        };
      }
    }
  };

})();
