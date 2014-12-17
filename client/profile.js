var runStatusLists = new ReactiveDict;

Template.profileDeckListItem.helpers({
  runStatusList: function() {
    var self = this;
    var l = runStatusLists.get(this.id);
    if (!l) {
      Meteor.call('listRunStatus', this.id, function(err, data) {
        //logger.info('will listRunStatus set', self.id, data);
        runStatusLists.set(self.id, data);
      });
    }
    return l;
  },

  thumbContent: function() {
    var thumbTpl = [
      '<div class="dp-slide-preview-thumb-content reveal">',
      '<div class="slides dp-slides">',
      '<section class="present">',
      '%s',
      '</section>',
      '</div>',
      '</div>'
    ].join('');
    var s = this.slides[0] || {};
    if (s.type === 'normal') {
      return sprintf(thumbTpl, s.content);
    } else {
      return sprintf(thumbTpl, '<div class="sl-block" data-block-type="text" style="left: 105px; top: 100px;"><div class="sl-block-content"><h1>No Preview</h1></div></div>');
    }
  }});

Template.profileDeckList.helpers({
  decks: function() {
    var r =  _.map(_.sortBy(this, function(d) { return 0 - d.created; }), function(d) {
      return {
        id: d._id,
        title: d.title,
        created: Math.floor(d.created/1000),
        author: d.author,
        slides: d.slides
      };
    });
    return r;
  }
});

Template.profile.rendered = function() {
  commonDPPageSetup();
  Session.set('documentTitle', formatDocumentTitle(currentUserDisplayName()));
};

Template.profile.helpers({
  currentUserDisplayName: currentUserDisplayName
});

Template.profile.events({
  'click #newDeckBtn': function(event) {
    Meteor.call('newDeck', function(err) {
      if (err) {
        return alertify.alert('Error: ' + JSON.stringify(err));
      }
    });
  },

  'click .delete-this-deck': function(event) {
    var e = $(event.currentTarget);
    var di = e.closest('.dp-deck-item');
    var deckId = di.attr('deckId');
    alertify.confirm('Do you want ot delete Deck: ' + deckId + ' ?', function() {
      Decks.remove({ _id: deckId });
    }).setHeader('Caution!');
  },

  'click .duplicate-this-deck': function(event) {
    var e = $(event.currentTarget);
    var di = e.closest('dp-deck-item');
    var deckId = di.attr('deckId');
    var deck = Decks.findOne({ _id: deckId });
    Decks.insert(genNewDeck(deck));
  }
});
