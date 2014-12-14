/* jquery horizon tab plugin for dp
 * author: LI, YU <liyu1981@gmail.com>
 */

;(function ($, window, document, undefined) {

    function dpLayoutTabActive($tab, $trigger, callback) {
      var p = $tab.parent();
      var bg = $trigger.parent(); // should be .dp-btn-group
      bg.find('.btn').removeClass('active');
      var l = $tab.prev().length || 0;
      var w = $tab.outerWidth(true);
      p.find('.dp-slide-layout-tab').css('transform', sprintf('translateX(-%dpx)', l*w));
      callback && callback();
    }

    // data api
    $(document).on('click.dpHorizonTab', '[data-toggle="dpHorizonTab"]', function(event) {
      var $trigger = $(event.currentTarget);
      dpLayoutTabActive($($trigger.attr('data-target')), $trigger, function() {
        $trigger.toggleClass('active');
      });
    });

})(jQuery, window, document);

