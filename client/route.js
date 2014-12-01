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

// waitOn wrapper of loadJs and loadCss
waitOnJsAndCss = (function() {
  function wrapFile(file) {
    return file;
  }

  // augment Meteor.Loader first
  Meteor.Loader.loadJsAndCss = function(assetArray, callback) {
    function _genLoadCssTask(file) {
      var f = wrapFile(file);
      return function(cb) {
        if (!Meteor.Loader.loaded(f)) {
          Meteor.Loader.loadCss(f);
        }
        cb();
      };
    }
    function _genLoadJsTask(file) {
      var f = wrapFile(file);
      return function(cb) {
        if (!Meteor.Loader.loaded(f)) {
          Meteor.Loader.loadJs(f, function() { cb(); });
        } else {
          cb();
        }
      }
    }
    var tasks = [];
    _.each(assetArray, function(file, index) {
      switch (getExt(file).toLowerCase()) {
        case 'css': tasks.push(_genLoadCssTask(file)); break;
        case 'js': tasks.push(_genLoadJsTask(file)); break;
        default: break;
      }
    });
    logger.info('will inject js & css:', assetArray);
    async.series(tasks, function() {
      callback();
    });
  };

  return function(dpMode, assetArray) {
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

    var depReady = false;
    var dep = new Tracker.Dependency;
    Meteor.Loader.loadJsAndCss(_.union(commonAA, assetArray), function() {
      depReady = true;
      dep.changed();
    });

    return [{
      ready: function() {
        dep.depend();
        return depReady;
      }
    }];
  };
})();

// hack to setup global custom loading template, as I can not make the official example work
// example: https://github.com/EventedMind/iron-router/blob/devel/examples/loading_plugin/loading_plugin.js
// ref: https://github.com/EventedMind/iron-router/blob/devel/lib/hooks.js
Iron.Router.hooks.loading = function () {
  // if we're ready just pass through
  if (this.ready()) {
    this.next();
    return;
  }

  var template = this.lookupOption('loadingTemplate');
  this.render(template || Template['dpLoading']);
  this.renderRegions();
};

Router.onBeforeAction((function() {
  var loginWaived = _.reduce(['/welcome', '/audience', '/speaker'], function(memo, p) { memo[p] = true; return memo; }, {});
  return function () {
    if (loginWaived[this.route._path]) {
      this.next();
    } else if (!Meteor.userId()) {
      // if the user is not logged in, render the Login template
      window.location.href = '/welcome';
    } else {
      // otherwise don't hold up the rest of hooks or our route/action function from running
      this.next();
    }
  };
})());

Router.route('/welcome', {
  waitOn: function() {
    dpMode = 'welcome';
    return _.union(sub(), waitOnJsAndCss(dpMode, [
      'bower_components/bigtext/dist/bigtext.js'
    ]));;
  }
});

Router.route('/profile', {
  waitOn: function() {
    dpMode = 'profile';
    dpUrlParams = this.params;
    return _.union(sub(), waitOnJsAndCss(dpMode, [
    ]));
  },

  onRerun: function() {
    if (!dpUrlParams.query.id) {
      window.location.href = '/welcome';
    }
    this.next();
  },

  data: function() {
    return Decks.find({ ownerId: dpUrlParams.query.id }).fetch();
  }
});

Router.route('/author', {
  waitOn: function() {
    dpMode = 'author';
    dpUrlParams = this.params;
    return _.union(sub(), waitOnJsAndCss(dpMode, [
      'bower_components/MutationObserver-shim/dist/mutationobserver.min.js',
      'bower_components/html5sortable/jquery.sortable.js',
      'bower_components/ckeditor/ckeditor.js',
      'bower_components/ckeditor/lang/en.js',
      'bower_components/ckeditor/styles.js',
      'bower_components/ckeditor/plugins/font/plugin.js',
      'bower_components/ckeditor/plugins/panelbutton/plugin.js',
      'bower_components/ckeditor/plugins/colorbutton/plugin.js',
      'bower_components/ckeditor/plugins/font/lang/en.js',
      'bower_components/ckeditor/plugins/colorbutton/lang/en.js',
      'bower_components/draggabilly/dist/draggabilly.pkgd.min.js'
    ]));
  },

  onRerun: function() {
    if (!dpUrlParams.query.id) {
      window.location.href = '/welcome';
    }
    // now register plugins' events
    dpPluginRegAllTemplate(dpMode);
    this.next();
  },

  data: function() {
    // cache the result in dpTheDeck
    dpTheDeck = Decks.findOne({ _id: dpUrlParams.query.id });
    logger.info('find the deck:', dpTheDeck);
    return dpTheDeck;
  }
});

Router.route('/audience', {
  waitOn: function() {
    dpMode = 'audience';
    dpUrlParams = this.params;
    if (!(dpUrlParams.query.runId)) {
      dpUrlParams.query.runId = 'rehearsal';
    }
    return _.union(sub(), waitOnJsAndCss(dpMode, []));
  },

  onRerun: function() {
    if (!dpUrlParams.query.id) {
      window.location.href = '/welcome';
    }
    // now register plugins' events
    dpPluginRegAllTemplate(dpMode);
    this.next();
  },

  data: function() {
    console.log('found', Decks.find().fetch());
    dpTheDeck = Decks.findOne();
    logger.info('find the deck:', dpTheDeck);
    dpRunStatus = RunStatus.findOne();
    logger.info('find the runStatus:', dpRunStatus);
    if (!(dpTheDeck && dpRunStatus)) { return null; }
    return _.extend(dpTheDeck, { runStatus: dpRunStatus });
  }
});

Router.route('/speaker', {
  waitOn: function() {
    dpMode = 'speaker';
    dpUrlParams = this.params;
    if (!(dpUrlParams.query.runId)) {
      dpUrlParams.query.runId = 'rehearsal';
    }
    return _.union(sub(), waitOnJsAndCss(dpMode, []));
  },

  onRerun: function() {
    if (!dpUrlParams.query.id) {
      window.location.href = '/welcome';
    }
    dpPluginRegAllTemplate(dpMode);
    this.next();
  },

  data: function() {
    dpTheDeck = Decks.findOne();
    logger.info('find the deck:', dpTheDeck);
    dpRunStatus = RunStatus.findOne();
    logger.info('find the runStatus:', dpRunStatus);
    if (!(dpTheDeck && dpRunStatus)) { return null; }
    return _.extend(dpTheDeck, { runStatus: dpRunStatus });
  }
});

Router.route('/qrcode', {
  waitOn: function() {
    dpMode = 'qrcode';
    dpUrlParams = this.params;
    return _.union(sub(), waitOnJsAndCss(dpMode, [
      'bower_components/qrcodejs/qrcode.min.js'
    ]));
  },

  onRerun: function() {
    if (!dpUrlParams.query.id) {
      window.location.href = '/welcome';
    }
    this.next();
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

  onRerun: function() {
    if (!this.params.query.id) {
      window.location.href = '/welcome';
    }
    this.next();
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

  onRerun: function() {
    if (!this.params.query.id) {
      window.location.href = '/welcome';
    }
    this.next();
  },

  data: function() {
    return { id: this.params.query.id };
  }
});
