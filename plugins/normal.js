;(function() {

  DPPlugins['normal'] = {
    displayName: 'Normal',

    init: function() {
      return '<h2>Hello</h2>';
    },

    templateRendered: {
      'author': function() {
        var e = this.$('.editable');
        logger.info('we have:', e, window.MediumEditor);
        new window.MediumEditor(e.get(), {
          buttonLabels: 'fontawesome',
          buttons:  ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote', 'superscript', 'subscript', 'strikethrough',
                     'unorderedlist', 'orderedlist', 'justifyLeft', 'justifyFull', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
        }); // start the editor
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
            return '<div class="content editable" slideIndex="' + this.index + '">' + this.content + '</div>';
          }
        };
      }
    },

    templateEvents: {
    }
  };

})();
