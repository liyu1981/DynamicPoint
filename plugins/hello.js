;(function() {

  DPPlugins['hello'] = {
    genHtml: {
      'speaker': function(slide, runStatus) {
        return '<h2>hello, speaker</h2><p>Let us welcome:<br><span></span></p>';
      },
      'author': function(slide, runStatus) {
        return '<p>Nothing need to be configured for this slide.</p>';
      },
      'audience': function(slide, runStatus) {
        return '<h2>hello, audience</h2><p>Your name?<br><input type="text" placeholder="James Bond"></input></p>';
      }
    },

    onSlideRendered: {
      'speaker': function(slideRoot, slide, runStatus) {
      },
      'author': function(slideRoot, slide, runStatus) {
      },
      'audience': function(slideRoot, slide, runStatus) {
      }
    }
  };

})();
