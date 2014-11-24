function genToolbarToggleClickHandler(target, onCb, offCb) {
  return function(event) {
    var t = $(target);
    if (t.hasClass('active')) {
      t.removeClass('active');
      offCb(event);
    } else {
      t.addClass('active');
      onCb(event);
    }
  };
}

function slideOrderUpdated() {
  var children = $('.dp-deck').children('.slide');
  var changes = {};
  for (var i=0; i<children.length; i++) {
    var c = $(children[i]);
    var slideIndex = parseInt(c.attr('slideIndex'));
    if (i !== slideIndex) {
      logger.info('changed:', i, slideIndex);
      if (!(slideIndex in changes || i in changes)) {
        changes[slideIndex] = i; // from => to
      }
    }
  }
  // now manuniplate the slides array
  var newSlides = dpTheDeck.slides;
  _.each(changes, function(to, from) {
    // swap dom as blaze will remember
    $(children[to]).before(children[from]);
    var tmp = newSlides[to];
    newSlides[to] = newSlides[from];
    newSlides[from] = tmp;
  });
  Decks.update({ _id: dpTheDeck._id }, { $set: { 'slides': newSlides } });
}

function genInsertHandler(htmlGenerator) {
  return function(event) {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var lastFocusNode = selection.focusNode;
    if (selection && range && htmlGenerator) {
      htmlGenerator(function(html) {
        node = range.createContextualFragment(html);
        range.insertNode(node);
        var r = document.createRange();
        r.setStart(lastFocusNode, 0);
        r.setEnd(lastFocusNode, 0);
        selection.removeAllRanges();
        selection.addRange(r);
       });
     }
  };
}

dpSaveMgr.saveNowCb = function(saving) {
  if (saving) {
    $('#dpActionInfo').html('saving...').show();
  } else {
    $('#dpActionInfo').html('saved!').hide(500);
  }
};

Template.author.helpers({
  indexedSlides: function() {
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  }
});

Template.author.rendered = function() {
  commonDPPageSetup();
};

Template.authorNavbar.events({
  'click #newDeckBtn': function(event) {
    Decks.insert(genNewDeck(), function(err, id) {
      if (err) {
        return alertify.alert('Error: ' + JSON.stringify(err));
      }
      Router.go('/author?id=' + id);
    });
  },

  'click #saveBtn': function(event) {
    dpSaveMgr.saveNow();
  },

  'click #importMenu': function(event) {
    $('#importMenuFileSelector')
      .on('change', function(event) {
        logger.info('changed', event.target.files);
        var fr = new FileReader();
        fr.onload = function(file) {
          Meteor.call('importFile', fr.result, function(err, id) {
            if (err) {
              return alertify.alert('Oops! ' + err.error + '<br><code>' + err.reason + '</code>');
            }
            // not to use Router.go as we want the page refresh
            // Router.go('/author?id=' + id);
            window.location.href = '/author?id=' + id;
          });
        };
        fr.readAsText(event.target.files[0]);
      })
      .click();
  }
});

Template.authorToolbar.events({
  'click #newSlideBtn': function(event) {
    Decks.update({ _id: dpTheDeck._id }, { $push: { slides: genEmptySlide() } });
  },

  'click #sortToggle': genToolbarToggleClickHandler('li:has(#sortToggle)',
    function on(event) {
      $('.sortable')
        .addClass('sortable-enabled')
        .sortable({ items: '.slide', handle: '.slide-handle' });
        //.bind('sortupdate', slideOrderUpdated);
    },
    function off(event) {
      $('.sortable')
        .removeClass('sortable-enabled')
        .sortable('disable');
      slideOrderUpdated();
    }),

    'click #insertImageBtn': genInsertHandler(function(next) {
      alertify.prompt('The URI of image',
        'https://graph.facebook.com/minhua.lin.9/picture?type=large',
        function(event, value) {
          logger.info('got image URI:', value);
          next('<img src="' + value + '"></img>');
        }).setHeader('Insert Image');
    }),

    'click #insertCodeBlockBtn': genInsertHandler(function(next) {
      alertify.codePrompt('Paste code here',
        'console.log(\'hello,world\');',
        function(event, value) {
          next('<code>' + value + '</code>');
        }).setHeader('Insert Code Block');
    }),

    'click #insertMediaBtn': genInsertHandler(function(next) {
      alertify.codePrompt('Paste media embeding code here',
        '<iframe width="320px" height="240px" src="//www.youtube.com/embed/l6k_5GHwLRA" frameborder="0" allowfullscreen></iframe>',
        function(event, value) {
          next('<div style="text-align: center;">' + value + '</div>');
        }).setHeader('Insert Embedded Media');
    })
});

Template.authorSlide.helpers({
  calcSlideTemplate: function() {
    if (this.type in DPPlugins) {
      return dpMode + '-slide-' + this.type;
    } else {
      return 'author-slide-normal';
    }
  },

  allSlideTypes: function() {
    var self = this;
    return _.reject(dpPluginGetAllTypes(), function(t) { return t.id === self.type; });
  }
});

Template.authorSlide.events({
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
});
