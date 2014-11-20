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
  async.series(tasks, callback);
};

loadJsAndCss = function(dpMode, assetArray, callback) {
  var alertifyAA = [
    'bower_components/alertify-js/build/css/alertify.min.css',
    'bower_components/alertify-js/build/css/themes/default.css',
    'bower_components/alertify-js/build/alertify.min.js',
    'js/alertifyext.js'
  ];
  var revealjsAA = [
    'bower_components/reveal.js/css/reveal.min.css',
    'bower_components/reveal.js/css/theme/solarized.css',
    'bower_components/reveal.js/js/reveal.min.js'
  ];
  var commonAA = [];
  switch(dpMode) {
    case 'welcome':
      commonAA = _.union(alertifyAA);
      break;
    case 'profile':
      commonAA = _.union(alertifyAA);
      break;
    case 'author':
      commonAA = _.union(alertifyAA);
      break;
    case 'audience':
      commonAA = _.union(revealjsAA);
      break;
    case 'speaker':
      commonAA = _.union(revealjsAA);
      break;
    case 'qrcode':
    case 'pairview':
    case 'superview':
    case 'export':
      break;
  };
  var aa = _.union(commonAA, assetArray);
  Meteor.Loader.loadJsAndCss(aa, callback);
};

Router.route('/welcome', function() {
  var self = this;
  dpMode = 'welcome';
  loadJsAndCss(dpMode,
    [
      'bower_components/bigtext/dist/bigtext.js'
    ],
    function() {
      self.render('welcome');
    });
});

Router.route('/profile', function() {
  var self = this;
  dpMode = 'profile';
  dpUrlParams = this.params;
  if (dpUrlParams.query.id) {
    sub(function() {
      loadJsAndCss(dpMode, [
      ], function() {
        self.render('profile');
      });
    });
  } else {
    window.location.href = '/welcome';
  }
});

Router.route('/author', function() {
  var self = this;
  dpMode = 'author';
  dpUrlParams = this.params;
  sub(function() {
    loadJsAndCss(dpMode, [
      'bower_components/medium-editor/dist/css/medium-editor.min.css',
      'bower_components/medium-editor/dist/css/themes/bootstrap.min.css',
      'bower_components/medium-editor/dist/js/medium-editor.min.js',
      'bower_components/html5sortable/jquery.sortable.js',
    ], function() {
      self.render('author');
    });
  });
}, {
  data: function() {
    if (dpUrlParams.query.id) {
      dpTheDeck = Decks.findOne({ _id: dpUrlParams.query.id });
    } else {
      dpTheDeck = {};
    }
    logger.info('find the deck:', dpTheDeck);
    return dpTheDeck || {};
  }
});

Router.route('/audience', function() {
  var self = this;
  dpMode = 'audience';
  dpUrlParams = this.params;
  if (!(dpUrlParams.query.runId)) {
    dpUrlParams.query.runId = 'rehearsal';
  }
  sub(function() {
    loadJsAndCss(dpMode, [
    ], function() {
      self.render('audience')
    });
  });
},
{
  data: function() {
    if (dpUrlParams.query.id) {
      dpTheDeck = Decks.findOne();
      logger.info('find the deck:', dpTheDeck);
      dpRunStatus = RunStatus.findOne();
      logger.info('find the runStatus:', dpRunStatus);
      if (!(dpTheDeck && dpRunStatus)) {
        return { notAvaliable: true };
      }
      // now register plugins' events
      _.map(dpTheDeck.slides, function(v) {
        dpPluginRegTemplate(v.type, dpMode, { runStatusId: dpUrlParams.query.id, audience: Session.get('audience') });
      });
      return _.extend(dpTheDeck, { runStatus: dpRunStatus });
    } else {
      window.location.href = '/welcome';
    }
  }
});

Router.route('/speaker', function() {
  var self = this;
  dpMode = 'speaker';
  dpUrlParams = this.params;
  if (!(dpUrlParams.query.runId)) {
    dpUrlParams.query.runId = 'rehearsal';
  }
  sub(function() {
    loadJsAndCss(dpMode, [
    ], function() {
      self.render('speaker');
    });
  });
},
{
  data: function() {
    if (dpUrlParams.query.id) {
      dpTheDeck = Decks.findOne();
      logger.info('find the deck:', dpTheDeck);
      dpRunStatus = RunStatus.findOne();
      logger.info('find the runStatus:', dpRunStatus);
      if (!(dpTheDeck && dpRunStatus)) {
        return {};
      }
      // now register plugins' events
      _.map(dpTheDeck.slides, function(v) {
        dpPluginRegTemplate(v.type, dpMode, { runStatusId: dpRunStatus._id });
      });
      return _.extend(dpTheDeck, { runStatus: dpRunStatus });
    } else {
      window.location.href = '/welcome';
    }
  }
});

Router.route('/qrcode', function() {
  var self = this;
  dpMode = 'qrcode';
  dpUrlParams = this.params;
  loadJsAndCss(dpMode, [
    'bower_components/qrcodejs/qrcode.min.js'
  ], function() {
    if (dpUrlParams.query.id) {
      self.render('qrcode');
    } else {
      window.location.href = '/welcome';
    }
  });
}, {
  data: function() {
    return {
      id: dpUrlParams.query.id,
      showall: (dpUrlParams.query.showall ? true : false)
    }
  }
});

Router.route('/pairview', function() {
  var self = this;
  dpMode = 'pairview';
  if (self.params.query.id) {
    self.render('pairview', {
      data: { id: self.params.query.id }
    });
  } else {
    window.location.href = '/welcome';
  }
});

Router.route('/superview', function() {
  var self = this;
  dpMode = 'supreview';
  if (self.params.query.id) {
    self.render('superview', {
      data: { id: self.params.query.id }
    });
  } else {
    window.location.href = '/welcome';
  }
});
