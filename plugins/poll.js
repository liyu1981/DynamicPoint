function genPieChartData(dpprt, data, slideId) {
  slideId = slideId || 'deck';
  return _.map(dpprt.getPluginData(data, slideId), function(v, k) {
    return { label: '' + k + '(' + v.length + ')', value: v.length };
  });
}

var d3PieChartChange = null;

function d3PieChart() {
  var svg = d3.select('.chart-container svg').append('g');
  svg.append('g').attr('class', 'slices');
  svg.append('g').attr('class', 'labels');
  svg.append('g').attr('class', 'lines');

  var width = 960,
      height = 450,
      radius = Math.min(width, height) / 2;

  var pie = d3.layout.pie().sort(null).value(function(d) { return d.value; });
  var arc = d3.svg.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.4);
  var outerArc = d3.svg.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);
  svg.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
  var key = function(d){ return d.data.label; };
  var color = d3.scale.ordinal().domain(['Yes', 'No']).range(['#98abc5', '#d0743c']);

  function change(data) {
    console.log('change called:', data);
    /* ------- PIE SLICES -------*/
    var slice = svg.select('.slices').selectAll('path.slice').data(pie(data), key);

    slice.enter().insert('path').style('fill', function(d) { return color(d.data.label); }).attr('class', 'slice');

    slice.transition().duration(1000).attrTween('d', function(d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        return arc(interpolate(t));
      };
    });

    slice.exit().remove();

    /* ------- TEXT LABELS -------*/
    var text = svg.select('.labels').selectAll('text').data(pie(data), key);

    text.enter().append('text').attr('dy', '.35em').text(function(d) { return d.data.label; });

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000).attrTween('transform', function(d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);
        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
        return 'translate('+ pos +')';
      };
    }).styleTween('text-anchor', function(d){
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        return midAngle(d2) < Math.PI ? 'start':'end';
      };
    });

    text.exit().remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/
    var polyline = svg.select('.lines').selectAll('polyline').data(pie(data), key);

    polyline.enter().append('polyline');

    polyline.transition().duration(1000).attrTween('points', function(d){
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);
        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
        return [arc.centroid(d2), outerArc.centroid(d2), pos];
      };
    });

    polyline.exit().remove();
  };

  d3PieChartChange = change;
}

DPPlugins['poll'] = {
  displayName: 'Poll',

  init: function() {
    return {
      question: 'This talk is boring ?',
      anwsers: [ 'Yes', 'No' ]
    };
  },

  template: {
    rendered: {
      'speaker': function() {
        var self = this;
        var dpprt = Template.instance().dpprt;
        var slideId = this.data.id;
        $('.slides').on('runStatusChanged', function(event, id, fields) {
          d3PieChartChange(genPieChartData(dpprt, { runStatus: fields }, slideId));
        });
        d3PieChart();
        d3PieChartChange(genPieChartData(dpprt, self.data, slideId));
      }
    },

    helpers: {
      'audience': function() {
        return {
          voted: function() {
            var dpprt = Template.instance().dpprt;
            var id = Session.get('audienceId');
            var r = _.reduce(dpprt.getPluginData(dpRunStatus, this.id), function(memo, v, k) {
              if (v.indexOf(id) >= 0) {
                memo.push(k);
              }
              return memo;
            }, []);
            return ((r.length >= 1) ? r[0] : null);
          }
        };
      }
    },

    events: {
      'audience': function() {
        return {
          'click .poll-btn': function(event) {
            var dpprt = Template.instance().dpprt;
            var e = $(event.currentTarget);
            var s = e.closest('section');
            var data = {};
            var pluginDataPrefix = dpprt.getPluginDataPrefix(s.attr('id'));
            data[pluginDataPrefix + e.attr('id')] = Session.get('audienceId');
            dpprt.update({ $push: data });
          }
        };
      },

      'author': function() {
        return {
          'change form#pollForm': function(event) {
            var s = $(event.currentTarget).closest('.slide');
            var slideIndex = s.attr('slideIndex');
            var formdata = {
              question: s.find('input.q').val(),
              anwsers: []
            };
            s.find('input.a').each(function(index, a) { formdata.anwsers.push($(a).val()); });
            var setData = {};
            setData['slides.' + slideIndex + '.content'] = formdata;
            dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $set: setData });
            dpSaveMgr.saveNow();
          },

          'click #addOption': function(event) {
            var s = $(event.currentTarget).closest('.slide');
            var slideIndex = s.attr('slideIndex');
            var optionName = 'option' + (dpTheDeck.slides[slideIndex].content.anwsers.length + 1);
            var pushData = {};
            pushData['slides.' + slideIndex + '.content.anwsers'] = optionName;
            dpSaveMgr.add(Decks, 'update', dpTheDeck._id, { $push: pushData });
            dpSaveMgr.saveNow();
          }
        };
      }
    }
  }
};
