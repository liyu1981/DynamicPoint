function SlideFocusMgr() {
  this.currentSlide = null;
}

SlideFocusMgr.prototype.focus = function(node) {
  if (this.currentSlide !== null && this.currentSlide.get(0) == node.get(0)) { return; }
  if (this.currentSlide !== null) {
    this.currentSlide.removeClass('dp-slide-focused');
  }
  this.currentSlide = node;
  this.currentSlide.addClass('dp-slide-focused');
}

var slideFocusMgr = new SlideFocusMgr();

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
  var children = $('.dp-thumbnail').find('.thumb');
  var changes = {};
  for (var i=0; i<children.length; i++) {
    var c = $(children[i]);
    var slideIndex = parseInt(c.attr('slideIndex'));
    if (i !== slideIndex) {
      if (!(slideIndex in changes || i in changes)) {
        changes[slideIndex] = i; // from => to
      }
    }
  }
  logger.info('order changed:', changes);

  // now restore the thumbnail divs since blaze will remember the dom nodes,
  // and blaze will update them with correct info when data changes
  _.each(changes, function(to, from) {
    $(children[to]).before(children[from]); // swap dom
  });

  // now manuniplate the slides array
  var newSlides = dpTheDeck.slides;
  _.each(changes, function(to, from) {
    var tmp = newSlides[to];
    newSlides[to] = newSlides[from];
    newSlides[from] = tmp;
  });
  dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: { 'slides': newSlides }});
  dpSaveMgr.saveNow();
}

//function genInsertHandler(htmlGenerator) {
//  return function(event) {
//    var selection = window.getSelection();
//    var range = selection.getRangeAt(0);
//    var lastFocusNode = selection.focusNode;
//    if (selection && range && htmlGenerator) {
//      htmlGenerator(function(html) {
//        var node = range.createContextualFragment(html);
//        range.insertNode(node);
//        var r = document.createRange();
//        r.setStart(lastFocusNode, 0);
//        r.setEnd(lastFocusNode, 0);
//        selection.removeAllRanges();
//        selection.addRange(r);
//       });
//     }
//  };
//}

function genInsertHandler(htmlGenerator) {
  return function(event) {
    console.log('insert:', Template.instance());
    var ti = Template.instance();
    if (ti && ti.slideFocusMgr && ti.slideFocusMgr.currentSlide) {
      htmlGenerator(function(html) {
        var node = $(html);
        ti.slideFocusMgr.currentSlide.find('.dp-content').append(node);
      });
    }
  };
}

function renderThumbnail(divNode, callback) {
  logger.info('will render thumb:', divNode);
  html2canvas(divNode, {
    onrendered: function(canvas) {
      var ec = document.createElement('canvas');
      ec.setAttribute('width',230);
      ec.setAttribute('height',175);
      var ctx = ec.getContext('2d');
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 230, 175);
      var dataURL = ec.toDataURL();
      callback(dataURL);
    }
  });
}

dpSaveMgr.saveNowCb = function(saving) {
  if (saving) {
    Session.set('dpActionInfo', 'saving...');
  } else {
    Session.set('dpActionInfo', 'saved!');
    setTimeout(function() { Session.set('dpActionInfo', null); }, 1000);
  }
};

Template.author.created = function() {
};

Template.author.helpers({
  indexedSlides: function() {
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  }
});

Template.author.rendered = function() {
  this.slideFocusMgr = new SlideFocusMgr;
  commonDPPageSetup();
  Session.set('documentTitle', formatDocumentTitle(this.data.title));
  $(function() {
    $(document).scroll(_.debounce(function() {
      var y = $(this).scrollTop();
      if (y > 79) {
        $('.dp-toolbar').transition({ 'margin-top': '-72px' });
        $('.dp-toolbar .dplogo-block').fadeIn(100);
      } else {
        $('.dp-toolbar').transition({ 'margin-top': '0px' });
        $('.dp-toolbar .dplogo-block').fadeOut(100);
      }
    }, 100));
  });
};

Template.authorNavbar.helpers({
  dpActionInfo: function() {
    return Session.get('dpActionInfo');
  },

  currentUserDisplayName: currentUserDisplayName
});

Template.authorNavbar.events({
  'click #newDeckBtn': function(event) {
    Decks.insert(genNewDeck(), function(err, id) {
      if (err) {
        return alertify.alert('Error: ' + JSON.stringify(err));
      }
      window.location.href = '/author?id=' + id;
    });
  },

  'click #saveBtn': function(event) {
    dpSaveMgr.saveNow();
  }
});

Template.authorToolbar.rendered = function() {
  this.slideFocusMgr = slideFocusMgr;
};

Template.authorToolbar.events({
  'click #newSlideBtn': function(event) {
    dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $push: { 'slides': genEmptySlide('normal') }});
    dpSaveMgr.saveNow();
  },

  'click #sortToggle': genToolbarToggleClickHandler('li:has(#sortToggle)',
    function on(event) {
      var deck = $('.dp-deck');
      deck.find('.slide').hide(0);
      deck.find('.dp-thumbnail').show(0);
      $('.dp-sortable')
        .addClass('dp-sortable-enabled')
        .sortable({ items: '.sortable-block', handle: '.sortable-handle' });
        //.bind('sortupdate', slideOrderUpdated);
    },
    function off(event) {
      var deck = $('.dp-deck');
      deck.find('.slide').show(0);
      deck.find('.dp-thumbnail').hide(0);
      $('.dp-sortable')
        .removeClass('dp-sortable-enabled')
        .sortable('disable');
      slideOrderUpdated();
    }),

  'click #insertTextBlockBtn': genInsertHandler(function(next) {
    next('<div style=""><h3>Hello,world</h3></div>');
  }),

  'click #insertListBlockBtn': genInsertHandler(function(next) {
    next('<div style=""><ul><li>hello</li><li>world</li></ul></div>');
  }),

  'click #insertImageBtn': genInsertHandler(function(next) {
    alertify.prompt('The URI of image',
      'https://graph.facebook.com/minhua.lin.9/picture?type=large',
      function(event, value) {
        next('<div style=""><img src="' + value + '"></img></div>');
      }).setHeader('Insert Image');
  }),

  'click #insertCodeBlockBtn': genInsertHandler(function(next) {
    alertify.codePrompt('Paste code here',
      'console.log(\'hello,world\');',
      function(event, value) {
        next('<div style=""><code>' + value + '</code></div>');
      }).setHeader('Insert Code Block');
  }),

  'click #insertMediaBtn': genInsertHandler(function(next) {
    alertify.codePrompt('Paste media embeding code here',
      '<iframe width="320px" height="240px" src="//www.youtube.com/embed/l6k_5GHwLRA" frameborder="0" allowfullscreen></iframe>',
      function(event, value) {
        next('<div style="position: absolute; text-align: center;">' + value + '</div>');
      }).setHeader('Insert Embedded Media');
  })
});

Template.authorThumbnail.helpers({
  thumbDataURL: function() {
    return Session.get('thumbnail-' + this.index);
  }
});

Template.authorSlide.created = function() {
  this.autorun(function() {
    // depend on the currentData to be notified when slide changed
    Template.currentData();
    var ti = this._templateInstance;
    // but only notify plugin after the templated is actually rendered to some nodes
    if (ti.firstNode && ti.lastNode) {
      renderThumbnail(ti.$('.panel-body').get(0), function(dataURL) {
        Session.set('thumbnail-' + ti.data.index, dataURL);
      });
    }
  });
};

Template.authorSlide.rendered = function() {
  var self = this;
  this.slideFocusMgr = slideFocusMgr;
  renderThumbnail(this.$('.panel-body').get(0), function(dataURL) {
    Session.set('thumbnail-' + self.data.index, dataURL);
  });
};

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
  'click .slide': function(event) {
    var ti = Template.instance();
    if (ti && ti.slideFocusMgr) {
      ti.slideFocusMgr.focus($(event.currentTarget));
    }
  },

  'click #editThisSlide': function(event) {
    var s = $(event.currentTarget).closest('.slide');
    var id = s.attr('slideId');
    var index = s.attr('slideIndex');
    s.removeClass('col-md-6').addClass('col-md-12').addClass('slide-big');
  },

  'click #deleteThisSlide': function(event) {
    var s = $(event.currentTarget).closest('.slide');
    var id = s.attr('slideId');
    var index = s.attr('slideIndex');
    alertify.confirm('Do you want ot delete slide No.' + index + ' ?', function() {
      dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $pull: { 'slides': { 'id': id }}});
      dpSaveMgr.saveNow();
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
    dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: { 'slides': newSlides }});
    dpSaveMgr.saveNow();
  },

  'click .change-slide-type-btn': function(event) {
    var e = $(event.currentTarget);
    var toType = e.attr('id');
    var slideIndex = e.closest('.slide').attr('slideIndex');
    logger.info('will change to:', toType);
    dpPluginChangeType(dpTheDeck._id, slideIndex, toType);
  }
});
