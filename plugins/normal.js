;(function() {

  var startMediumEditor = function(e) {
    if (!e) {
      throw Error('Must provide the root DOM node in first time startMediumEditor');
    }
    new window.MediumEditor(e, {
      buttonLabels: 'fontawesome',
      buttons:  ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote', 'superscript', 'subscript', 'strikethrough',
        'unorderedlist', 'orderedlist', 'justifyLeft', 'justifyFull', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
    }); // start the editor
  };

  DPPlugins['normal'] = {
    displayName: 'Normal',

    init: function() {
      return '<h2>Hello</h2>';
    },

    templateUpdated: {
      'author': function() {
        console.log('updated me:', this, this.$('.editable'));
        //startMediumEditor(s.get());
      }
    },

    templateRendered: {
      'author': function() {
        console.log('rendered');
        var e = this.$('.editable');
        startMediumEditor(e.get());
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
