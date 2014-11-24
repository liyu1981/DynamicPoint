;(function() {

  DPPlugins['normal'] = {
    displayName: 'Normal',

    init: function() {
      return '<h2>Hello</h2>';
    },

    templateRendered: {
      'author': function() {
        var e = new window.MediumEditor(this.$('.editable'));
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
      'author': function() {
        return {
          'click #deleteThisSlide': function(event) {
            var s = $(event.currentTarget).closest('.slide');
            var id = s.attr('slideId');
            var index = s.attr('slideIndex');
            alertify.confirm('Do you want ot delete No.' + index + 'slide ?', function() {
              Decks.update({ _id: dpTheDeck._id }, { $pull: { 'slides': { 'id': id } } });
            }).setHeader('Caution!');
          },

          'click #duplicateThisSlide': function(event) {
            var s = $(event.currentTarget).closest('.slide');
            var index = s.attr('slideIndex');

            // $position should be faster, but can only use with mongo 2.6
            // Decks.update({ _id: dpTheDeck._id }, {
            //   $push: {
            //     'slides': {
            //       $each: [ cloneSlide(dpTheDeck.slides[index]) ] , $position: index
            //     }
            //   }
            // });

            // turn to naive way with mongo 2.4
            var newSlides = dpTheDeck.slides;
            newSlides.splice(index, 0, cloneSlide(dpTheDeck.slides[index]));
            Decks.update({ _id: dpTheDeck._id }, { $set: { 'slides': newSlides }});
          },

          'click .change-slide-type-btn': function(event) {
            var e = $(event.currentTarget);
            var toType = e.attr('id');
            var slideIndex = e.closest('.slide').attr('slideIndex');
            logger.info('will change to:', toType);
            dpPluginChangeType(dpTheDeck._id, slideIndex, toType);
          }
        };
      }
    }
  };

})();
