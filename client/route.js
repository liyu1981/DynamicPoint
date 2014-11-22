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

  var d3AA = [
    'bower_components/d3/d3.min.js'
  ];

  return function(dpMode, assetArray, callback) {
    var commonAA = [];
    switch(dpMode) {
      case 'welcome':
      case 'profile':
      case 'author':
        commonAA = _.union(alertifyAA);
        break;
      case 'audience':
      case 'speaker':
        commonAA = _.union(revealjsAA, d3AA);
        break;
      case 'qrcode':
      case 'pairview':
      case 'superview':
      case 'export':
        break;
    };
    Meteor.Loader.loadJsAndCss(_.union(commonAA, assetArray), callback);
  };
})();

Router.onBeforeAction((function() {
  var loginWaived = _.reduce(['/welcome', '/audience', '/speaker'], function(memo, p) { memo[p] = true; return memo; }, {});
  return function () {
    if (loginWaived[this.route._path]) {
      this.next();
    } else if (!Meteor.userId()) {
      this.render('welcome'); // if the user is not logged in, render the Login template
    } else {
      this.next(); // otherwise don't hold up the rest of hooks or our route/action function from running
    }
  };
})());

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
      logger.info('find the deck:', dpTheDeck);
      return dpTheDeck || {};
    } else {
      window.location.href = '/welcome';
    }
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
