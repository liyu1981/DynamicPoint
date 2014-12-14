function SlideFocusMgr() {
  this.currentSlide = null;
  Session.set('focusSlideType', '');
  Session.set('currentSlideIndex', 0);
}

SlideFocusMgr.prototype.focus = function(node) {
  if (this.currentSlide !== null && this.currentSlide.get(0) == node.get(0)) { return; }
  if (this.currentSlide !== null) {
    this.currentSlide.removeClass('dp-slide-focused');
  }
  this.currentSlide = node;
  this.currentSlide.addClass('dp-slide-focused');
  Session.set('focusSlideType', this.currentSlide.attr('slideType'));
};

SlideFocusMgr.prototype.focusChangeType = function(type) {
  Session.set('focusSlideType', this.currentSlide.attr('slideType'));
};

SlideFocusMgr.prototype.defocus = function() {
  var old = null;
  if (this.currentSlide) {
    this.currentSlide.removeClass('dp-slide-focused');
    old = this.currentSlide;
    this.currentSlide = null;
  }
  Session.set('focusSlideType', '');
  return old;
};

var slideFocusMgr = null;

function genToolbarToggleClickHandler(target, onCb, offCb) {
  return function(event) {
    var t = $(target);
    if (t.hasClass('active')) {
      // re-active all links
      t.closest('.dp-toolbar').find('.navbar-collapse a').removeClass('disabled');
      t.removeClass('active');
      offCb(event);
    } else {
      // disable all links first
      t.closest('.dp-toolbar').find('.navbar-collapse a').addClass('disabled');
      t.addClass('active');
      t.find('a').removeClass('disabled'); // re-active our link
      onCb(event);
    }
  };
}

function slideOrderUpdated() {
  var children = $('.dp-deck-thumb').find('.thumb');
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
    logger.info('order changed:', changes, children);
  if (!_.isEmpty(changes)) {
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
}

function addNewSlide(layoutId, callback) {
  var c = DPConf.findOne({}, { layouts: 1 });
  if (c && c.layouts) {
    var l = _.find(c.layouts, function(layout) { return layout.id === layoutId; });
    var data = {};
    if (l) { data['content'] = l.content; }
    dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $push: { 'slides': genEmptySlide('normal', data) } });
    dpSaveMgr.saveNow();
  }
  callback();
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
  // create our slideFocusMgr
  slideFocusMgr = new SlideFocusMgr();
  // and save it in the plugin meta
  DPPlugins._meta.slideFocusMgr = slideFocusMgr;
  // defaultly we show pager (as we are not in thumb previewing)
  Session.set('showPager', true);
};

Template.author.helpers({
  indexedSlides: function() {
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  },

  showPager: function() {
    return Session.get('showPager');
  }
});

Template.author.rendered = function() {
  commonDPPageSetup();
  Session.set('documentTitle', formatDocumentTitle(this.data.title));
  $(function() {
    // keyboard shortcuts
    Mousetrap.bind('left', function() {
      var csi = Session.get('currentSlideIndex');
      var total = _.isArray(dpTheDeck.slides) ? dpTheDeck.slides.length : 0;
      if (_.isNumber(csi) && csi + 1 < total) {
        Session.set('currentSlideIndex', csi+1);
        slideFocusMgr.focus($(sprintf('[slideIndex="%s"]', csi+1)));
      }
    });
    Mousetrap.bind('right', function() {
      var csi = Session.get('currentSlideIndex');
      if (_.isNumber(csi) && csi - 1 >= 0) {
        Session.set('currentSlideIndex', csi-1);
        slideFocusMgr.focus($(sprintf('[slideIndex="%s"]', csi-1)));
      }
    });
  });
  // and try to focus the first slide
  slideFocusMgr.focus(this.$('.dp-slide-current .slide'));
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
  },

  'change #titleInput': function(event) {
    dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: { 'title': $(event.currentTarget).val().trim() }});
  }
});

Template.authorToolbar.helpers({
  calcSlideTemplateAuthorTool: function() {
    var fst = Session.get('focusSlideType');
    return dpMode + '-slide-' + fst + '-authortool';
  }
});

Template.authorToolbar.events({
  'click #newSlideToggle': genToolbarToggleClickHandler('li:has(#newSlideToggle)',
    function on(event) {
      var t = $(event.currentTarget);
      var option = _.extend({}, t.data());
      option['$target'] = t;
      logger.info('fdafad', t, $(t.attr('data-target')));
      $(t.attr('data-target')).data('toggle', t).popoverX(option).popoverX('show');
    },
    function off(event) {
      var t = $(event.currentTarget);
      $(t.attr('data-target')).popoverX('hide');
    }),

  'click #sortToggle': genToolbarToggleClickHandler('li:has(#sortToggle)',
    function on(event) {
      var dc = $('.dp-container');
      var dd = dc.find('.dp-deck');
      var ddt = dc.find('.dp-deck-thumb-container');
      dd.addClass('dp-zoom-out').afterTransition(function() {
        ddt.show(0, function() {
          dd.hide(0);
        });
      });
      Session.set('showPager', false);
      slideFocusMgr.defocus();
      dc.find('.dp-sortable').addClass('dp-sortable-enabled').sortable({
        items: '.sortable-block',
        handle: '.sortable-handle'
      });
    },
    function off(event) {
      var dc = $('.dp-container');
      var dd = dc.find('.dp-deck');
      var ddt = dc.find('.dp-deck-thumb-container');
      ddt.hide(0, function() {
        dd.show(0, function() {
          dd.removeClass('dp-zoom-out');
        });
      });
      Session.set('showPager', true);
      slideFocusMgr.focus(dd.find('.dp-slide-current .slide'));
      dc.find('.dp-sortable').removeClass('dp-sortable-enabled').sortable('disable');
      slideOrderUpdated();
    })
});

Template.authorDeckThumb.helpers({
  thumbContent: function() {
    var thumbTpl = [
      '<div class="dp-slide-preview-thumb">',
      '<div class="dp-slide-preview-thumb-content reveal">',
      '<div class="slides dp-slides">',
      '<section class="present">',
      '%s',
      '</section>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
    if (this.type === 'normal') {
      return sprintf(thumbTpl, this.content);
    } else {
      return sprintf(thumbTpl, '<div class="sl-block" data-block-type="text" style="left: 105px; top: 100px;"><div class="sl-block-content"><h1>No Preview</h1></div></div>');
      //return sprintf('<div class="dp-slide-preview-thumb"><h2><i class="fa fa-child"></i></h2></div>');
    }
  }
});

Template.authorSlide.rendered = function() {
  var self = this;
  this.slideFocusMgr = slideFocusMgr;
};

Template.authorSlide.helpers({
  calcSlideTemplate: function() {
    if (this.type in DPPlugins) {
      return dpMode + '-slide-' + this.type;
    } else {
      return 'author-slide-normal';
    }
  },

  calcSlideTemplateToolBar: function() {
    if (this.type in DPPlugins) {
      return dpMode + '-slide-' + this.type + '-toolbar';
    } else {
      return 'author-slide-normal-toolbar';
    }
  },

  allSlideTypes: function() {
    var self = this;
    return _.reject(dpPluginGetAllTypes(), function(t) { return t.id === self.type; });
  },

  displayType: function() {
    var self = this;
    var alltypes = dpPluginGetAllTypes();
    var t = _.find(alltypes, function(t) { return t.id === self.type });
    return t ? t.displayName : this.type;
  },

  calcDpPositionClass: function() {
    var csi = Session.get('currentSlideIndex');
    if (this.index === csi) {
      return 'dp-slide-current';
    } else if (this.index < csi && this.index + 1 === csi) {
      return 'dp-slide-prev';
    } else if (this.index > csi && this.index - 1 === csi) {
      return 'dp-slide-next';
    } else {
      return 'dp-slide-other';
    }
  },

  calcDpPositionStyle: function() {
    var csi = Session.get('currentSlideIndex');
    if (this.index === csi) {
      return '';
    } else if (this.index < csi) {
      return '';
    } else {
      return '';
    }
  }
});

Template.authorSlide.events({
  'click .slide': function(event) {
    var ti = Template.instance();
    if (ti && ti.slideFocusMgr) {
      ti.slideFocusMgr.focus($(event.currentTarget));
    }
  },

  'click .dp-slide-container': function(event) {
    var t = $(event.currentTarget);
    if (t.hasClass('dp-slide-prev') || t.hasClass('dp-slide-next')) {
      var s = t.find('.slide');
      Session.set('currentSlideIndex', parseInt(s.attr('slideIndex')));
      var ti = Template.instance();
      if (ti && ti.slideFocusMgr) {
        ti.slideFocusMgr.focus(s);
      }
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
    dpPluginChangeType(dpTheDeck._id, slideIndex, toType);
  }
});

Template.authorPager.helpers({
  pagers: function() {
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  },

  calcDpPositionClass: function() {
    var csi = Session.get('currentSlideIndex');
    if (this.index === csi) {
      return 'badge-active';
    } else {
      return '';
    }
  }
});

Template.authorPager.events({
  'click .badge': function(event) {
    var t = $(event.currentTarget);
    Session.set('currentSlideIndex', parseInt(t.attr('slideIndex')));
  }
});

Template.authorPopoverNewSlideLayouts.helpers({
  slideLayouts: function() {
    var conf = DPConf.findOne({}, { layouts: 1 });
    return conf.layouts || [];
  }
});

Template.authorPopoverNewSlideLayouts.events({
  'click .dp-slide-layout-thumb': function(event) {
    var t = $(event.currentTarget);
    var p = t.closest('.popover');
    var tg = p.data('toggle');
    addNewSlide(t.attr('layoutId'), function() {
      p.data('toggle', null);
      tg && tg.click();
    });
  }
});
