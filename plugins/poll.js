;(function() {

  function findVotedValue() {
    var id = Session.get('audienceId');
    var r = _.reduce(dpRunStatus.pluginData.poll, function(memo, v, k) {
      if (v.indexOf(id) >= 0) {
        memo.push(k);
      }
      return memo;
    }, []);
    return ((r.length >= 1) ? r[0] : null);
  }

  function genPieChartData(fields) {
    console.log('before recalc:', fields.pluginData.poll);
    return _.map(fields.pluginData.poll, function(v, k) {
      return { label: '' + k + '(' + v.length + ')', value: v.length };
    });
  }

  var d3PieChartChange = null;

  function d3PieChart() {
    console.log('start d3 pie chart');
    var svg = d3.select('.chart-container svg').append('g');
    svg.append('g').attr('class', 'slices');
    svg.append('g').attr('class', 'labels');
    svg.append('g').attr('class', 'lines');

    var width = 960,
        height = 450,
        radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie().sort(null).value(function(d) {
      return d.value;
    });

    var arc = d3.svg.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

    svg.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    var key = function(d){ return d.data.label; };

    var color = d3.scale.ordinal()
      .domain(['Lorem ipsum', 'dolor sit', 'amet', 'consectetur', 'adipisicing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt'])
      .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

    function change(data) {
      console.log('we got data:', data);
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

      text.enter().append('text').attr('dy', '.35em').text(function(d) {
        return d.data.label;
      });

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

    change(genPieChartData(dpRunStatus));
    d3PieChartChange = change;
  }

  DPPlugins['poll'] = {
    init: function() {
      return {
        question: 'This talk is boring ?',
        anwsers: [ 'Yes', 'No' ]
      };
    },

    templateRendered: {
      'speaker': function() {
        $('.slides').on('runStatusChanged', function(event, id, fields) {
          console.log('statued changed, refresh pie');
          d3PieChartChange(genPieChartData(fields));
        });
        d3PieChart();
      }
    },

    templateHelpers: {
      'audience': function() {
        return {
          voted: function() {
            return findVotedValue();
          }
        };
      },
      'author': function() { return {}; },
      'speaker': function() { return {}; }
    },

    templateEvents: {
      'audience': function() {
        return {
          'click .poll-btn': function(event) {
            console.log('clicked:', event.currentTarget, event);
            var e = $(event.currentTarget);
            var a = e.attr('id');
            var data = {};
            data['pluginData.poll.' + a] = Session.get('audienceId');
            RunStatus.update({ _id: dpRunStatus._id }, { $push: data });
          }
        };
      },
      'author': function() {
        return {};
      },
      'speaker': function() {
        return {};
      }
    }
  };

})();
