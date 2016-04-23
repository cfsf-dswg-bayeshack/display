//adapted from: https://github.com/wrobstory/d3.chart.choropleth
(function() {
  d3.chart('Choropleth', {
    initialize: function() {
      var chart = this;

      chart.brews = {
        BuGn: ["#EDF8FB", "#CCECE6", "#CCECE6", "#66C2A4", "#41AE76", "#238B45", "#005824"],
        q9s: ["q0-9", "q1-9", "q2-9", "q3-9", "q4-9", "q5-9", "q6-9", "q7-9", "q8-9"]
      };
      chart.w = chart.base.attr('width') || 960;
      chart.h = chart.base.attr('height') || 500;
      chart._gender = chart._gender || 'male';
      chart._range = chart._range || chart.brews.BuGn;
      chart._domain = chart._domain || 0;
      chart._path = d3.geo.path();
      chart._projection = chart._projection || d3.geo.mercator();
      chart._scale = chart._scale || 1000;
      chart._boundaryClass = chart._boundaryClass || 'boundary';

      chart.quantize = d3.scale.quantize()
        .domain(chart._domain)
        .range(chart._range);

      function dataBind(data) {

        var chart = this.chart();

        chart.geo_data = data.Geo;
        chart.data = data.ToBind;

        var getMax = function(data) {
          var maxVal = -1;
          var maxId = null;
          for (var id in data) {
            var value = data[id];
            if (value > maxVal) {
              maxId = id;
              maxVal = value;
            }
          }
          return maxVal;
        };

        chart._domain = chart._domain === 0 ? [0, getMax(chart.data)] : chart._domain;
        chart.quantize.domain(chart._domain).range(chart._range);

        return this.selectAll("path")
                   .data(chart.geo_data);
      }

      function insert() {
        var chart = this.chart();
        var scale = chart._scale;
        return this.append("path")
          .attr('class', function(d){ return chart.quantize(chart.data[d.id]) })
          // .style("fill", function (d) { return chart.quantize(chart.data[d.id]); })
          .classed(chart._boundaryClass, true)
          .attr("d", chart._path.projection(
            chart._projection
              .scale(chart._scale)
              .translate([chart.w / 2, chart.h / 2]))
          );
      }

      var mapBase = this.base
        .append('g')
        .classed('geodata', true)
        .attr('height', chart.h)
        .attr('width', chart.w);

      chart.layer('map', mapBase, {
          dataBind: dataBind,
          insert: insert
      });

      // from here...
      // var onEnter = function() {
      //   this.attr('x', function(d, i) {
      //     return chart.x(i) - 0.5;
      //   })
      //   .attr('y', function(d) {
      //     return chart.h - chart.margins.bottom -
      //       chart.margins.top - chart.y(chart.datamax - d.value) - 0.5;
      //   })
      //   .attr('val', function(d) {
      //     return d.value;
      //   })
      //   .attr('width', chart.bar_width)
      //   .attr('height', function(d) {
      //     return chart.y(chart.datamax - d.value);
      //   })
      //   .attr('class', function(d) {
      //     return 'bar ' + chart._gender + ' ' + chart.quantize(d.value);
      //   });
      // };
      // chart.layer('map').on('enter', onEnter);
      // chart.layer('map').on('update', onEnter);
      //...to here is to do updates
    },


    width: function(newWidth) {
      if (arguments.length === 0) { return this.w; }
      this.w = newWidth;
      return this;
    },

    height: function(newHeight) {
      if (arguments.length === 0) { return this.h; }
      this.h = newHeight;
      return this;
    },

    gender: function(newGender) {
      if (arguments.length === 0) { return this._gender; }
      this._gender = newGender;
      return this;
    },

    boundaryClass: function(newBoundary) {
      if (arguments.length === 0) { return this._boundaryClass; }
      this._boundaryClass = newBoundary;
      return this;
    },

   range: function(newRange) {
     if (arguments.length === 0) { return this._range; }
      this._range = this.brews[newRange];
      return this;
    },

   domain: function(newDomain) {
     if (arguments.length === 0) { return this._domain; }
      this._domain= newDomain;
      return this;
    },

    projection: function(newProj) {
      if (arguments.length === 0) { return this._projection; }
      this._projection= newProj;
      return this;
    },

    scale: function(newScale) {
      if (arguments.length === 0) { return this._scale; }
      this._scale = newScale;
      return this;
    }

  });
}());