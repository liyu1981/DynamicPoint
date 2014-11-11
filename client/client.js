dpMode = null;
dpTheDeck = null;

function genEmptySlide(type) {
  switch(type) {
    default: return { type: 'normal', content: 'hello' }
  }
}

Router.route('/', function() {
  var self = this;
  dpMode = 'audience';
  Meteor.Loader.loadCss('bower_components/reveal.js/css/reveal.min.css');
  Meteor.Loader.loadCss('bower_components/reveal.js/css/theme/solarized.css');
  Meteor.Loader.loadJs('bower_components/reveal.js/js/reveal.min.js', function() {
    self.render('audience', {
      data: function() {
        return Decks.findOne();
      }
    });
  });
});

Template.audience.rendered = function () {
  Reveal.initialize();
};

Router.route('/speaker', function() {
  var self = this;
  dpMode = 'speaker';
  Meteor.Loader.loadCss('bower_components/reveal.js/css/reveal.min.css');
  Meteor.Loader.loadCss('bower_components/reveal.js/css/theme/solarized.css');
  Meteor.Loader.loadJs('bower_components/reveal.js/js/reveal.min.js', function() {
    self.render('speaker');
  });
});

Router.route('/author', function() {
  var self = this;
  dpMode = 'author';
  Meteor.Loader.loadCss('bower_components/medium-editor/dist/css/medium-editor.min.css');
  Meteor.Loader.loadCss('bower_components/medium-editor/dist/css/themes/default.min.css');
  async.series([
      function(cb) { Meteor.Loader.loadJs('bower_components/medium-editor/dist/js/medium-editor.min.js', cb); }
    ],
    function() {
      self.render('author', {
        data: function() {
          var filter = (self.params.query.id ? { _id: self.params.query.id } : {});
          //console.log('filter is:', filter);
          dpTheDeck = Decks.findOne(filter);
          //console.log('got the deck:', dpTheDeck);
          //if (!dpTheDeck) {
          //  // create empty deck
          //  dpTheDeck = Decks.insert({
          //    author: '',
          //    title: '',
          //    created: (new Date()).getTime(),
          //    lastModified: (new Date()).getTime(),
          //    slides: [ genEmptySlide() ]
          //  });
          //}
          return dpTheDeck;
        }
      });
    });
});

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
      //var e = new MediumEditor('.editable'); // start all editableContent
    });
    this.rendered = true;
  }
};

Template.author.events({
  'click #newSlide': function(event) {
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
    //console.log('will:', { _id: dpTheDeck._id }, { $set: v });
    if ( v !== {}) {
      Decks.update({ _id: dpTheDeck._id }, { $set: v });
    }
  }
});

Template.authorSlide.helpers({
  editableContent: function() {
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

Meteor.startup(function () {
});
