// dpTransformer: simple transform library
// author: LI, Yu <liyu1981@gmail.com>
// deps: underscore (as _) and jquery (as $)

;(function() {

  var eventDomain = '.dptransformer';

// some code is from
/*
 * jqDnR - Minimalistic Drag'n'Resize for jQuery.
 *
 * Copyright (c) 2007 Brice Burgess <bhb@iceburg.net>, http://www.iceburg.net
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * $Version: 2007.08.19 +r2
 */

  var jqdnr = (function() {
    var jqDnR={
      dnr: {},
      e: 0,
      drag:function(v){
        v.preventDefault();
        switch(M.k) {
          case 'd': // drag
            E.css({ left: M.X+v.pageX-M.pX, top: M.Y+v.pageY-M.pY });
            break;
          case 'rs-n':
            E.css({ height: Math.max(v.pageY-M.pY-M.H, 0) });
            break;
          case 'rs-s':
            E.css({ height: Math.max(v.pageY-M.pY+M.H, 0) });
            break;
          case 'rs-e':
            console.log('current: ', v.pageX, M.pX, M.W);
            E.css({ width: Math.max(v.pageX-M.pX+M.W, 0) });
            break;
          case 'rs-w':
            console.log('current: ', v.pageX, M.pX, M.W);
            E.css({
              left: Math.max(M.X - v.pageX, 0),
              width: Math.max(M.W - v.pageX, 1)
            });
            break;
          case 'rs-nw':
            E.css({
              width: Math.max(v.pageX-M.pX+M.W, 0),
              height: Math.max(v.pageY-M.pY-M.H, 0)
            });
            break;
          case 'rs-ne':
            E.css({
              width: Math.max(v.pageX-M.pX-M.W, 0),
              height: Math.max(v.pageY-M.pY-M.H, 0)
            });
            break;
          case 'rs-sw':
            E.css({
              width: Math.max(v.pageX-M.pX+M.W, 0),
              height: Math.max(v.pageY-M.pY+M.H, 0)
            });
            break;
          case 'rs-se':
            E.css({
              width: Math.max(v.pageX-M.pX-M.W, 0),
              height: Math.max(v.pageY-M.pY+M.H, 0)
            });
            break;
        }
        return false;
      },
      stop: function() {
        E.css('opacity', M.o);
        $(document).off('mousemove'+eventDomain).off('mouseup'+eventDomain);
      }
    };

    var J=jqDnR,
        M=J.dnr,
        E=J.e,
        i=function(e,h,k){
          return e.each(function(){
            h=(h)?$(h,e):e;
            h.on('mousedown'+eventDomain, {e:e, k:k}, function(v) {
              v.preventDefault();
              var d=v.data, p={}, E=d.e;
              // attempt utilization of dimensions plugin to fix IE issues
              // if(E.css('position') != 'relative'){try{E.position(p);}catch(e){}}
              M={
                X:  p.left||f('left')||0,
                Y:  p.top||f('top')||0,
                W:  f('width')||E[0].scrollWidth||0,
                H:  f('height')||E[0].scrollHeight||0,
                pX: v.pageX,
                pY: v.pageY,
                k:  d.k,
                o:  E.css('opacity')
              };
              E.css({opacity:0.8});
              $(document).on('mousemove'+eventDomain, jqDnR.drag).on('mouseup'+eventDomain, jqDnR.stop);
              return false;
            });
          });
        },
        f = function(k) {
          return parseInt(E.css(k))||false;
        };

      return i;
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
    switch(k) {
      case 'nw':
      case 'ne':
      case 'sw':
      case 'se':
      case 'n':
      case 's':
      case 'w':
      case 'e':
        jqdnr(this.element, '.dptc-resize-' + k, 'rs-' + k);
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
})();
