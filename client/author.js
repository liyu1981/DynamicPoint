function SlideFocusMgr() {
  this.currentSlide = null;
  Session.set('focusSlideType', '');
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

//function renderThumbnail(divNode, callback) {
//  //logger.info('will render thumb:', divNode);
//  var w = 640;
//  var h = 480;
//  html2canvas(divNode, {
//    onrendered: function(canvas) {
//      var ec = document.createElement('canvas');
//      ec.setAttribute('width', w);
//      ec.setAttribute('height', h);
//      var ctx = ec.getContext('2d');
//      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
//      var dataURL = ec.toDataURL();
//      callback(dataURL);
//    }
//  });
//}

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
};

Template.author.helpers({
  indexedSlides: function() {
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  }
});

Template.author.rendered = function() {
  commonDPPageSetup();
  Session.set('documentTitle', formatDocumentTitle(this.data.title));
  $(function() {
    $(document).scroll(_.debounce(function() {
      var y = $(this).scrollTop();
      if (y > 60) {
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
  },

  'change #titleInput': function(event) {
    dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: { 'title': $(event.currentTarget).val().trim() }});
  }
});

Template.authorToolbar.helpers({
  calcSlideTemplateAuthorTool: function() {
    var fst = Session.get('focusSlideType');
    return dpMode + '-slide-' + fst + '-authortool';
  },

  slideLayouts: function() {
    var r = [];
    for (var i=0; i<10; i++) {
      r.push({
        id: i,
        content: sprintf('<section class="present"><div class="sl-block" data-block-type="text"><div class="sl-block-content"><h2>Template %d</h2></div></div></section>', i)
      });
    }
    return r;
  }
});

Template.authorToolbar.events({
  'click #newSlideToggle': genToolbarToggleClickHandler('li:has(#newSlideToggle)',
    function on(event) {
      var t = $(event.currentTarget);
      var option = _.extend({}, t.data());
      option['$target'] = t;
      $(t.attr('data-target'))
        .off('shown.bs.modal').on('shown.bs.modal', function(e) {
          //dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $push: { 'slides': genEmptySlide('normal') }});
          //dpSaveMgr.saveNow();
        })
        //.off('hidden.bs.modal').on('hidden.bs.modal', function(e) {
        //  t.click();
        //})
        .popoverX(option)
        .popoverX('show');
    },
    function off(event) {
      var t = $(event.currentTarget);
      $(t.attr('data-target')).popoverX('hide');
    }),

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
    })
});

Template.authorThumbnail.helpers({
  thumbDataURL: function() {
    return Session.get('thumbnail-' + this.index);
  },

  thumbContent: function() {
    var thumbTpl = [
      '<div class="dp-slide-preview-thumb">',
      '<div class="dp-slide-preview-thumb-content reveal">',
      '<div class="slides" style="width: 960px; height: 700px; left: -390px; top: -290px;">',
      '%s',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
    if (this.type === 'normal') {
      return sprintf(thumbTpl, this.content);
    } else {
      return sprintf('<h2><i class="fa fa-child"></i></h2>');
    }
  }
});

Template.authorSlide.created = function() {
  //this.autorun(function() {
  //  // depend on the currentData to be notified when slide changed
  //  Template.currentData();
  //  var ti = this._templateInstance;
  //  // but only notify plugin after the templated is actually rendered to some nodes
  //  if (ti.firstNode && ti.lastNode) {
  //    renderThumbnail(ti.$('.panel-body').get(0), function(dataURL) {
  //      Session.set('thumbnail-' + ti.data.index, dataURL);
  //    });
  //  }
  //});
};

Template.authorSlide.rendered = function() {
  var self = this;
  this.slideFocusMgr = slideFocusMgr;
  //renderThumbnail(this.$('.panel-body').get(0), function(dataURL) {
  //  Session.set('thumbnail-' + self.data.index, dataURL);
  //});
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
    dpPluginChangeType(dpTheDeck._id, slideIndex, toType);
  }
});
