;(function() {
  // we need underscore (as _) and jquery (as $)

  function DPTransformer(element, options) {
    console.log('fdafa:', options);
    // querySelector if string
    this.element = (typeof element === 'string' ?  $(element) : (element.jquery ? element : $(element)));
    this.options = _.extend({}, this.options);
    this.mergeOptions(options);
    this.ui = this.createUI(this.options.ui);
    this.enable();
  }

  DPTransformer.prototype.mergeOptions = function(options) {
    _.extend(this.options, options);
    this.parseUIOptions();
  };

  DPTransformer.prototype.parseUIOptions = function() {
    var self = this;
    var s = this.options.ui;
    if (s) {
      this.options.ui = {};
      if (s === 'all') { s = 'nw ne sw se n s w e r'; }
      _.each(s.split(' '), function(v) { self.options.ui[v] = true; });
    }
  };

  DPTransformer.prototype.createUI = function(options) {
    var html = [
      '<div class="dp-transformer-control">',
      (options.nw ? '<span class="dptc dptc-resize-nw"></span>' : ''),
      (options.ne ? '<span class="dptc dptc-resize-ne"></span>' : ''),
      (options.sw ? '<span class="dptc dptc-resize-sw"></span>' : ''),
      (options.se ? '<span class="dptc dptc-resize-se"></span>' : ''),
      (options.n ? '<span class="dptc dptc-resize-n"></span>' : ''),
      (options.s ? '<span class="dptc dptc-resize-s"></span>' : ''),
      (options.w ? '<span class="dptc dptc-resize-w"></span>' : ''),
      (options.e ? '<span class="dptc dptc-resize-e"></span>' : ''),
      (options.r ? '<span class="dptc dptc-rotate"></span>' : ''),
      '</div>',
      ''
    ].join('');
    return $(html)[0];
  };

  DPTransformer.prototype.enable = function() {
    this.element.append(this.ui);
  };

  DPTransformer.prototype.disable = function() {
    this.ui.remove();
  };

  console.log('will define DPTransformer');
  window.DPTransformer = DPTransformer;
})();
