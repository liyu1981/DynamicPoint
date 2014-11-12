dpMode = null;
dpTheDeck = null;

function genEmptySlide(type) {
  switch(type) {
    default: return {
      id: Random.id(),
      type: 'normal',
      content: 'hello'
    };
  }
}

function waitfor(selector, callback) {
  var r = $(selector);
  if (r.length <= 0) {
    setTimeout(function() { waitfor(selector, callback); }, 500);
  } else {
    callback();
  }
}

Template.registerHelper('isEmpty', function(target) {
  if (target) {
    return _.isEmpty(target);
  } else {
    return false;
  }
});

Router.route('/speaker', function() {
  var self = this;
  dpMode = 'speaker';
  Meteor.Loader.loadCss('bower_components/reveal.js/css/reveal.min.css');
  Meteor.Loader.loadCss('bower_components/reveal.js/css/theme/solarized.css');
  async.series([
      function(cb) { Meteor.Loader.loadJs('bower_components/reveal.js/js/reveal.min.js', function() { cb(); }); }
    ],
    function() {
      self.render('speaker', {
        data: function() {
          if (self.params.query.id) {
            dpTheDeck = Decks.findOne({ _id: self.params.query.id });
            console.log('find the deck:', dpTheDeck);
            return dpTheDeck;
          } else {
            Router.go('/author');
          }
        }
      });
    });
});

Router.route('/author', function() {
  var self = this;
  dpMode = 'author';
  Meteor.Loader.loadCss('bower_components/medium-editor/dist/css/medium-editor.min.css');
  Meteor.Loader.loadCss('bower_components/medium-editor/dist/css/themes/default.min.css');
  Meteor.Loader.loadCss('bower_components/alertify-js/build/css/alertify.min.css');
  Meteor.Loader.loadCss('bower_components/alertify-js/build/css/themes/default.css');
  async.series([
      function(cb) { Meteor.Loader.loadJs('bower_components/medium-editor/dist/js/medium-editor.min.js', function() { cb(); }); },
      function(cb) { Meteor.Loader.loadJs('bower_components/alertify-js/build/alertify.min.js', function() { cb(); }); }
    ],
    function() {
      self.render('author', {
        data: function() {
          var filter = (self.params.query.id ? { _id: self.params.query.id } : {});
          dpTheDeck = Decks.findOne(filter);
          console.log('find the deck:', dpTheDeck);
          if (!dpTheDeck) {
            dpTheDeck = {};
          }
          return dpTheDeck;
        }
      });
    });
});

Router.route('/', function() {
  var self = this;
  dpMode = 'audience';
  Meteor.Loader.loadCss('bower_components/reveal.js/css/reveal.min.css');
  Meteor.Loader.loadCss('bower_components/reveal.js/css/theme/solarized.css');
  async.series([
      function(cb) { Meteor.Loader.loadJs('bower_components/reveal.js/js/reveal.min.js', function() { cb(); }); }
    ],
    function() {
      self.render('audience', {
        data: function() {
          if (self.params.query.id) {
            dpTheDeck = Decks.findOne({ _id: self.params.query.id });
            console.log('find the deck:', dpTheDeck);
            return dpTheDeck;
          } else {
            Router.go('/author');
          }
        }
      });
    });
});

Template.audience.rendered = function () {
  if (!this.rendered) {
    $(function() {
      waitfor('.slides section', function() {
        Reveal.initialize();
        Decks.find({ _id: dpTheDeck._id }, { runStatus: 1 }).observeChanges({
          changed: function(id, fields) {
            console.log('changes:', id, fields);
            Reveal.slide(fields.runStatus.curIndex.indexh, fields.runStatus.curIndex.indexv);
          }
        });
      });
    });
    this.rendered = true;
  }
};

Template.speaker.rendered = function() {
  if (!this.rendered) {
    $(function() {
      waitfor('.slides section', function() {
        Reveal.initialize();
        Reveal.addEventListener('slidechanged', function(event) {
          // event.previousSlide, event.currentSlide, event.indexh, event.indexv
          console.log('slide changed to:', event);
          Decks.update({ _id: dpTheDeck._id }, { $set: { 'runStatus.curIndex': { indexh: event.indexh, indexv: event.indexv } } });
        });
      });
    });
    this.rendered = true;
  }
};

Template.author.helpers({
  indexedSlides: function() {
    //return this.slides;
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  }
});

Template.author.rendered = function() {
  if (!this.rendered) {
    $(function() {
      $('body').addClass('dp-author'); // add the global dp-author class
      // init alertify
      //(function registerAlertifyDialogs() {
      //  if (!alertify.slideConfirm) {
      //    alertify.dialog('slideConfirm',
      //      function factory() {
      //        return {
      //          main: function(message, owner) {
      //            this.message = message;
      //            this.owner = owner;
      //          },
      //          prepare: function() {
      //            // the owner panel
      //            var o = $(this.owner);
      //            var offset = o.offset();
      //            var ow = o.outerWidth();
      //            var oh = o.outerHeight();

      //            // hack the dimmer to cover the panel
      //            var dimmer = $('.alertify .ajs-dimmer');
      //            dimmer.css({
      //              'top': offset.top,
      //              'left': offset.left,
      //              'width': ow,
      //              'height': oh,
      //              'border-radius': '4px'
      //            });

      //            // hack the dialog shown in the center of panel
      //            this.set('movable', false);
      //            var dialog = $('.alertify .ajs-dialog');
      //            dialog.css({ 'margin': '0px 0px' });
      //            var dw = dialog.outerWidth();
      //            var dh = dialog.outerHeight();
      //            this.moveTo(offset.left + ((ow - dw)/2), offset.top + ((oh - dh)/2));

      //            // now load the message as usual
      //            this.setHeader('Please confirm');
      //            this.setContent(this.message);
      //          }
      //        };
      //      },
      //      false,
      //      'confirm');
      //  }
      //})();
      alertify.defaults.transition = 'pulse';
    });
    this.rendered = true;
  }
};

Template.author.events({
  'click #newDeckBtn': function(event) {
    Decks.insert({
      author: 'John Smith',
      title: 'New DynamicPoint Deck',
      created: (new Date()).getTime(),
      lastModified: (new Date()).getTime(),
      slides: [ genEmptySlide() ]
    }, function(err, id) {
      if (err) {
        return alertify.alert('Error: ' + JSON.stringify(err));
      }
      Router.go(window.location.pathname + '?id=' + id);
    });
  },

  'click #newSlideBtn': function(event) {
    Decks.update({ _id: dpTheDeck._id }, { $push: { slides: genEmptySlide() } });
  },

  'click #saveBtn': function(event) {
    var v = {}
    $('.slide .content').each(function(i, elem) {
      var e = $(elem);
      var index = parseInt(e.attr('slideIndex'));
      var h = e.html().trim();
      if (h !== dpTheDeck.slides[index].content) {
        v['slides.' + index + '.content'] = h;
      }
    });
    if ( v !== {}) {
      Decks.update({ _id: dpTheDeck._id }, { $set: v });
    }
  }
});

Template.authorSlide.helpers({
  editableContent: function() {
    // have to do this to overcome the contenteditable issue of meteor now
    // ref: https://github.com/meteor/meteor/issues/1964
    return '<div class="content editable" slideIndex="' + this.index + '">' + this.content + '</div>';
  }
});

Template.authorSlide.created = function() {
};

Template.authorSlide.rendered = function() {
  if (!this.rendered) {
    var e = new MediumEditor('.editable'); // kick off the editable
    this.rendered = true;
  }
};

Template.authorSlide.events({
  'click #deleteThisSlide': function(event) {
    var s = $(event.currentTarget).closest('.slide');
    var id = s.attr('slideId');
    var index = s.attr('slideIndex');
    //alertify.slideConfirm('Do you want ot delete slide: ' + index + ' ?', s.find('.dp-panel'), function() {
    alertify.confirm('Do you want ot delete slide: ' + index + ' ?', function() {
      Decks.update({ _id: dpTheDeck._id }, { $pull: { 'slides': { 'id': id } } });
    });
  }
});

Meteor.startup(function () {
});
