dpMode = null;
dpTheDeck = null;

function waitfor(selector, callback) {
  var r = $(selector);
  if (r.length <= 0) {
    setTimeout(function() { waitfor(selector, callback); }, 500);
  } else {
    callback();
  }
}

function getExt(file) {
  // ext algorithm taken from http://stackoverflow.com/a/12900504
  return file.substr((~-file.lastIndexOf('.') >>> 0) + 2);
}

function qualifyURL(url){
  // http://james.padolsey.com/javascript/getting-a-fully-qualified-url/
  var img = document.createElement('img');
  img.src = url; // set string url
  url = img.src; // get qualified url
  img.src = null; // no server request
  return url;
}

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
      console.log('changed:', i, slideIndex);
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

Template.registerHelper('isEmpty', function(target) {
  return _.isEmpty(target);
});

Meteor.Loader.loadJsAndCss = function(assetArray, callback) {
  function _genLoadCssTask(file) {
    return function(cb) { Meteor.Loader.loadCss(file); cb(); };
  }
  function _genLoadJsTask(file) {
    return function(cb) { Meteor.Loader.loadJs(file, function() { cb(); }); }
  }
  var tasks = [];
  _.each(assetArray, function(file, index) {
    switch (getExt(file).toLowerCase()) {
      case 'css': tasks.push(_genLoadCssTask(file)); break;
      case 'js': tasks.push(_genLoadJsTask(file)); break;
      default: break;
    }
  });
  console.log('tasks is:', tasks);
  async.series(tasks, callback);
};

Router.route('/speaker', function() {
  var self = this;
  dpMode = 'speaker';
  Meteor.Loader.loadJsAndCss([
    'bower_components/reveal.js/css/reveal.min.css',
    'bower_components/reveal.js/css/theme/solarized.css',
    'bower_components/reveal.js/js/reveal.min.js'
  ],
  function() {
    self.render('speaker', {
      data: function() {
        if (self.params.query.id) {
          dpTheDeck = Decks.findOne({ _id: self.params.query.id });
          console.log('find the deck:', dpTheDeck);
          // reset the runStatus first
          return dpTheDeck;
        } else {
          Router.go('/author');
        }
      }
    });
  });
});

Router.route('/', function() {
  var self = this;
  dpMode = 'audience';
  Meteor.Loader.loadJsAndCss([
    'bower_components/reveal.js/css/reveal.min.css',
    'bower_components/reveal.js/css/theme/solarized.css',
    'bower_components/reveal.js/js/reveal.min.js'
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

Router.route('/author', function() {
  var self = this;
  dpMode = 'author';
  Meteor.Loader.loadJsAndCss([
    'bower_components/medium-editor/dist/css/medium-editor.min.css',
    'bower_components/medium-editor/dist/css/themes/bootstrap.min.css',
    'bower_components/alertify-js/build/css/alertify.min.css',
    'bower_components/alertify-js/build/css/themes/default.css',
    'bower_components/medium-editor/dist/js/medium-editor.min.js',
    'bower_components/alertify-js/build/alertify.min.js',
    'bower_components/html5sortable/jquery.sortable.js',
    'js/alertifyext.js'
  ],
  function() {
    self.render('author', {
      data: function() {
        if (self.params.query.id) {
          dpTheDeck = Decks.findOne({ _id: self.params.query.id });
        } else {
          dpTheDeck = {};
        }
        console.log('find the deck:', dpTheDeck);
        return dpTheDeck || {};
      }
    });
  });
});

Router.route('/export', function() {
  var self = this;
  dpMode = 'export';
  Meteor.Loader.loadJsAndCss([
    'bower_components/blob/Blob.js',
    'bower_components/FileSaver/FileSaver.min.js'
  ],
  function() {
    if (self.params.query.id) {
      dpTheDeck = Decks.findOne({ _id: self.params.query.id });
      console.log('find the deck:', dpTheDeck, { _id: self.params.query.id });
      if (dpTheDeck) {
        var datastr = JSON.stringify(_.pick(dpTheDeck, 'author', 'title', 'created', 'lastModified', 'slides'), null, '  ');
        var blob = new Blob([datastr], { type: "text/plain;charset=utf-8" });
        saveAs(blob, dpTheDeck._id + '.dp');
        setTimeout(function() { window.close(); }, 1000); // auto-close window after 1s
      }
    } else {
      Router.go('/author');
    }
  });
});

Router.route('/superview', function() {
  var self = this;
  if (self.params.query.id) {
    self.render('superview', {
      data: { id: self.params.query.id }
    });
  } else {
    Router.go('/author');
  }
});

Router.route('/pairview', function() {
  var self = this;
  if (self.params.query.id) {
    self.render('pairview', {
      data: { id: self.params.query.id }
    });
  } else {
    Router.go('/author');
  }
});

Router.route('/qrcode', function() {
  var self = this;
  Meteor.Loader.loadJsAndCss([
    'bower_components/qrcodejs/qrcode.min.js'
  ],
  function() {
    if (self.params.query.id) {
      self.render('qrcode', {
        data: {
          id: self.params.query.id,
          showall: (self.params.query.showall ? true : false)
        }
      });
    } else {
      Router.go('/author');
    }
  });
});

Template.audience.rendered = function () {
  if (!this.rendered) {
    $(function() {
      waitfor('.slides section', function() {
        Reveal.initialize({
          keyboard: false,
          touch: false,
          controls: false
        });
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
    return _.map(this.slides, function(e, i) { return _.extend(e, { index: i }) });
  }
});

Template.author.rendered = function() {
  $(function() {
    $('body')
      .addClass('dp-author') // add the global dp-author class
      .addClass('dp-author-theme-specklednoise') // default theme
      ;
    alertify.defaults.transition = 'pulse';
  });
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
  },

  'click #importMenu': function(event) {
    console.log($('#importMenuFileSelector'));
    $('#importMenuFileSelector')
      .on('change', function(event) {
        console.log('changed', event.target.files);
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
      console.log('now off');
      $('.sortable')
        .removeClass('sortable-enabled')
        .sortable('disable');
      slideOrderUpdated();
    }),

    'click #insertImageBtn': genInsertHandler(function(next) {
      alertify.prompt('The URI of image',
        'https://graph.facebook.com/minhua.lin.9/picture?type=large',
        function(event, value) {
          console.log('got image URI:', value);
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
    alertify.confirm('Do you want ot delete No.' + index + 'slide ?', function() {
      Decks.update({ _id: dpTheDeck._id }, { $pull: { 'slides': { 'id': id } } });
    }).setHeader('Caution!');
  },

  'click #duplicateThisSlide': function(event) {
    var s = $(event.currentTarget).closest('.slide');
    var index = s.attr('slideIndex');

    // $position should be faster, but can only use with mongo 2.6
    // Decks.update({ _id: dpTheDeck._id }, { $push: { 'slides': { $each: [ cloneSlide(dpTheDeck.slides[index]) ] , $position: index } } });

    // turn to naive way with mongo 2.4
    var newSlides = dpTheDeck.slides;
    newSlides.splice(index, 0, cloneSlide(dpTheDeck.slides[index]));
    Decks.update({ _id: dpTheDeck._id }, { $set: { 'slides': newSlides }});
  }
});

Template.qrcode.rendered = function() {
  $(function() {
    $('body')
      .addClass('dp-author') // add the global dp-author class
      .addClass('dp-author-theme-specklednoise') // default theme
      ;
    waitfor('.qrcode-container', function() {
      $('.qrcode-container').each(function(index, elem) {
        var e = $(elem);
        new QRCode(elem, qualifyURL(e.attr('rawUrl')));
      });
    });
  });
};

Meteor.startup(function () {
});
