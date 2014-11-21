loadJsAndCss = (function() {
  // augment Meteor.Loader first
  Meteor.Loader.loadJsAndCss = function(assetArray, callback) {
    function _genLoadCssTask(file) { return function(cb) { Meteor.Loader.loadCss(file); cb(); }; }
    function _genLoadJsTask(file) { return function(cb) { Meteor.Loader.loadJs(file, function() { cb(); }); } }
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

  // predef assets
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

  return function(dpMode, assetArray, callback) {
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
})();

Router.onBeforeAction(function () {
  var loginWaived = _.reduce(['/welcome', '/audience', '/speaker'], function(memo, p) { memo[p] = true; return memo; }, {});
  // all properties available in the route function are also available here such as this.params
  if (this.route._path in loginWaived) {
    this.next();
  } else if (!Meteor.userId()) {
    // if the user is not logged in, render the Login template
    this.render('welcome');
  } else {
    // otherwise don't hold up the rest of hooks or our route/action function from running
    this.next();
  }
});

Router.route('/welcome', {
  waitOn: function() {
    dpMode = 'welcome';
    return sub();
  },

  action: function() {
    var self = this;
    loadJsAndCss(dpMode, [
      'bower_components/bigtext/dist/bigtext.js'
    ], function() {
      self.render('welcome');
    });
  }
});

Router.route('/profile', {
  loadingTemplate: 'commonLoading',

  waitOn: function() {
    dpMode = 'profile';
    dpUrlParams = this.params;
    return sub();
  },

  action: function() {
    var self = this;
    loadJsAndCss(dpMode, [
    ], function() {
      self.render('profile');
    });
  }
});

Router.route('/author', {
  loadingTemplate: 'commonLoading',

  waitOn: function() {
    dpMode = 'author';
    dpUrlParams = this.params;
    return sub();
  },

  action: function() {
    var self = this;
    loadJsAndCss(dpMode, [
      'bower_components/medium-editor/dist/css/medium-editor.min.css',
      'bower_components/medium-editor/dist/css/themes/bootstrap.min.css',
      'bower_components/medium-editor/dist/js/medium-editor.min.js',
      'bower_components/html5sortable/jquery.sortable.js',
    ], function() {
      self.render('author');
    });
  },

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

Router.route('/audience', {
  loadingTemplate: 'commonLoading',

  waitOn: function() {
    dpMode = 'audience';
    dpUrlParams = this.params;
    if (!(dpUrlParams.query.runId)) {
      dpUrlParams.query.runId = 'rehearsal';
    }
    return sub();
  },

  action: function() {
    var self = this;
    loadJsAndCss(dpMode, [
    ], function() {
      self.render('audience');
    });
  },

  data: function() {
    if (dpUrlParams.query.id) {
      dpTheDeck = Decks.findOne();
      logger.info('find the deck:', dpTheDeck);
      dpRunStatus = RunStatus.findOne();
      logger.info('find the runStatus:', dpRunStatus);
      if (!(dpTheDeck && dpRunStatus)) { return {}; }
      // now register plugins' events
      _.map(dpTheDeck.slides, function(v) {
        dpPluginRegTemplate(v.type, dpMode);
      });
      return _.extend(dpTheDeck, { runStatus: dpRunStatus });
    } else {
      window.location.href = '/welcome';
    }
  }
});

Router.route('/speaker', {
  loadingTemplate: 'commonLoading',

  waitOn: function() {
    dpMode = 'speaker';
    dpUrlParams = this.params;
    if (!(dpUrlParams.query.runId)) {
      dpUrlParams.query.runId = 'rehearsal';
    }
    return sub();
  },

  action: function() {
    var self = this;
    loadJsAndCss(dpMode, [
    ], function() {
      self.render('speaker');
    });
  },

  data: function() {
    if (dpUrlParams.query.id) {
      dpTheDeck = Decks.findOne();
      logger.info('find the deck:', dpTheDeck);
      dpRunStatus = RunStatus.findOne();
      logger.info('find the runStatus:', dpRunStatus);
      if (!(dpTheDeck && dpRunStatus)) { return {}; }
      // now register plugins' events
      _.map(dpTheDeck.slides, function(v) {
        dpPluginRegTemplate(v.type, dpMode);
      });
      return _.extend(dpTheDeck, { runStatus: dpRunStatus });
    } else {
      window.location.href = '/welcome';
    }
  }
});

Router.route('/qrcode', {
  waitOn: function() {
    dpMode = 'qrcode';
    dpUrlParams = this.params;
    return sub();
  },

  action: function() {
    var self = this;
    loadJsAndCss(dpMode, [
      'bower_components/qrcodejs/qrcode.min.js'
    ], function() {
      if (dpUrlParams.query.id) {
        self.render('qrcode');
      } else {
        window.location.href = '/welcome';
      }
    });
  },

  data: function() {
    return {
      id: dpUrlParams.query.id,
      showall: (dpUrlParams.query.showall ? true : false)
    }
  }
});

Router.route('/pairview', {
  waitOn: function() {
    dpMode = 'pairview';
    return sub();
  },

  action: function() {
    var self = this;
    if (self.params.query.id) {
      self.render('pairview');
    } else {
      window.location.href = '/welcome';
    }
  },

  data: function() {
    return { id: this.params.query.id };
  }
});

Router.route('/superview', {
  waitOn: function() {
    dpMode = 'supreview';
    return sub();
  },

  action: function() {
    var self = this;
    if (self.params.query.id) {
      self.render('superview');
    } else {
      window.location.href = '/welcome';
    }
  },

  data: function() {
    return { id: this.params.query.id };
  }
});
