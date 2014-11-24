;(function() {

  DPPlugins['normal'] = {
    displayName: 'Normal',

    init: function() {
      return '<h2>Hello</h2>';
    },

    templateRendered: {
      'author': function() {
        var e = this.$('.editable');
        new window.MediumEditor(e); // start the editor
        var observerSubchild = new MutationObserver(function(items, observer) {
          console.log('content changed', items, observer);
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
