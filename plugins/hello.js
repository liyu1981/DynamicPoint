;(function() {

  DPPlugins['hello'] = {
    genHtml: {
      'speaker': function(slide, runStatus) {
        return '<h2>hello, speaker</h2><p>Let us welcome:<br><span id="audienceList"></span></p>';
      },
      'author': function(slide, runStatus) {
        return '<p>Nothing need to be configured for this slide.</p>';
      },
      'audience': function(slide, runStatus) {
        return '<h2>hello, audience</h2><p>Your name?<br><input id="name" type="text" placeholder="James Bond"></input></p>';
      }
    },

    onSlideRendered: {
      'speaker': function($slideRoot, data) {
        console.log('iam speaker');
        var v = new Blaze.View('audienceList', function() {
          console.log('rendered me?', $al);
          var namelist = _.map(data.runStatus.users, function(name) { return name; }).join(', ');
          $al.html(namelist);
        });
        Blaze.render(v, $al.get());
      },
      'author': function($slideRoot, data) {
      },
      'audience': function($slideRoot, data) {
        console.log('iam audience');
        var d = data;
        var $input = $('input#name', $slideRoot);
        $input.on('change', function(event) {
          var setData = {};
          setData['users.' + d.audience.id] = $input.val();
          RunStatus.update({ _id: d.runStatus._id }, { $set: setData });
        });
      }
    }
  };

})();
