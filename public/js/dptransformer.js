// dpTransformer: simple transform library
// author: LI, Yu <liyu1981@gmail.com>
// deps: underscore (as _) and jquery (as $)

;(function(window, _, $) {

  // some code is from : jqDnR - Minimalistic Drag'n'Resize for jQuery.
  // http://jquery.iceburg.net/jqDnR/
  var jqdnr = (function() {

    var evdomain = '.dptransformer';

    function css(e, k) {
      return parseInt(e.css(k))||false;
    }

    var jqDnR = { dnr: {}, e: 0 }, M = jqDnR.dnr, E = jqDnR.e;

    var dragActions = {
      //  case 'd': // drag
      //    E.css({ left: M.X+v.pageX-M.pX, top: M.Y+v.pageY-M.pY });
      //  case 'rs-n':
      //    E.css({ top: Math.max(M.Y + v.pageY - M.pY, 0), height: Math.max(M.H + M.pY - v.pageY, 0) });
      //    break;
      //  case 'rs-s':
      //    E.css({ height: Math.max(v.pageY-M.pY+M.H, 0) });
      //    break;
      'rs-e.text': function(v) {
        E.css({ width: Math.max(v.pageX-M.pX+M.W, 0) });
      },
      'rs-w.text': function(v) {
        E.css({ left: Math.max(M.X + v.pageX - M.pX, 0), width: Math.max(M.W + M.pX - v.pageX, 0) });
      },
      //  case 'rs-nw':
      //    E.css({ width: Math.max(v.pageX-M.pX+M.W, 0), height: Math.max(v.pageY-M.pY-M.H, 0) });
      //    break;
      //  case 'rs-ne':
      //    E.css({ width: Math.max(v.pageX-M.pX-M.W, 0), height: Math.max(v.pageY-M.pY-M.H, 0) });
      //    break;
      //  case 'rs-sw':
      //    E.css({ width: Math.max(v.pageX-M.pX+M.W, 0), height: Math.max(v.pageY-M.pY+M.H, 0) });
      //    break;
      //  case 'rs-se':
      //    E.css({ width: Math.max(v.pageX-M.pX-M.W, 0), height: Math.max(v.pageY-M.pY+M.H, 0) });
      //    break;
    };

    jqDnR.drag = function(v) {
      v.preventDefault();
      v.stopPropagation();
      var a = dragActions[sprintf('%s.%s', M.k, M.t)];
      a && a(v);
    };

    jqDnR.stop = function(v) {
      v.preventDefault();
      v.stopPropagation();
      E.css('opacity', M.o);
      $(document).off('mousemove'+evdomain).off('mouseup'+evdomain);
    };

    return function(e, h, k, t) {
      // e : jq objs
      // h : handle
      // k : kind of direction
      // t : block type
      h = (h ? $(h, e) : e);
      h.on('mousedown'+evdomain, {e: e, k: k, t: t}, function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var d=ev.data;
        E=d.e;
        M={
          X:  css(E, 'left')||0,
          Y:  css(E, 'top')||0,
          W:  css(E, 'width')||E[0].scrollWidth||0,
          H:  css(E, 'height')||E[0].scrollHeight||0,
          pX: ev.pageX,
          pY: ev.pageY,
          k:  d.k,
          t:  d.t,
          o:  E.css('opacity')
        };
        E.css({opacity:0.8});
        $(document).on('mousemove'+evdomain, jqDnR.drag).on('mouseup'+evdomain, jqDnR.stop);
      });
    };
  })();

  function DPTransformer(element, options) {
    // querySelector if string
    this.element = (typeof element === 'string' ?  $(element) : (element.jquery ? element : $(element)));
    this.options = _.extend({}, this.options);
    this._unbinder = [];
    this.mergeOptions(options);
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
      if (s === 'all') { s = 'nw ne sw se n s w e'; }
      //if (s === 'all') { s = 'nw ne sw se n s w e r'; }
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

  DPTransformer.prototype._eventBinder = function(k) {
    // k: kind of direction
    var t = this.element.attr('data-block-type') || 'text';
    switch(k) {
      case 'nw':
      case 'ne':
      case 'sw':
      case 'se':
      case 'n':
      case 's':
      case 'w':
      case 'e':
        jqdnr(this.element, '.dptc-resize-' + k, 'rs-' + k, t);
        this._unbinder.push(function() { this.element.find('.dptc-resize-' + k).off('mousedown.dptransformer'); });
        break;
      case 'r':
        break;
    }
  };

  DPTransformer.prototype.bindUIEvents = function() {
    var self = this;
    _.each(this.options.ui, function(v, k) {
      self._eventBinder.call(self, k);
    });
  };

  DPTransformer.prototype.unbindUIEvents = function() {
    var self = this;
    _.each(this._unbinder, function(v) {
      v.call(self);
    });
    this._unbinder = [];
  };

  DPTransformer.prototype.enable = function() {
    this.ui = this.createUI(this.options.ui);
    this.element.append(this.ui);
    this.bindUIEvents();
  };

  DPTransformer.prototype.disable = function() {
    this.unbindUIEvents();
    this.ui.remove();
  };

  window.DPTransformer = DPTransformer;

})(window, _, jQuery);
