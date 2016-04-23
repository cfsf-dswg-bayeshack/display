// https://github.com/misoproject/d3.chart/wiki/quickstart
(function() {
  d3.chart("Circles", {

  initialize: function() {
    // create a base scale we will use later.
    this.xScale = d3.scale.linear();

    var circlesBase = this.base.append("g")
        .classed("circles", true)
        .attr("height", this.h)
        .attr("width", this.w);

    this.layer("circles", circlesBase, {
      dataBind: function(data) {
        var chart = this.chart();

        // update the domain of the xScale since it depends on the data
        chart.xScale.domain(d3.extent(data));

        // return a data bound selection for the passed in data.
        return this.selectAll("circle")
          .data(data);

      },
      insert: function() {
        var chart = this.chart();

        // update the range of the xScale (account for radius width)
        // on either side
        chart.xScale.range([chart.r, chart.w - chart.r]);

        // setup the elements that were just created
        return this.append("circle")
          .classed("circle", true)
          .style("fill", "red")
          .attr("cy", chart.h/2)
          .attr("r", chart.r);
      },

      // setup an enter event for the data as it comes in:
      events: {
        "enter" : function() {
          var chart = this.chart();

          // position newly entering elements
          return this.attr("cx", function(d) {
            return chart.xScale(d);
          });
        }
      }
    });
  },

  // configures the width of the chart.
  // when called without arguments, returns the
  // current width.
  width: function(newWidth) {
    if (arguments.length === 0) {
      return this.w;
    }
    this.w = newWidth;
    return this;
  },

  // configures the height of the chart.
  // when called without arguments, returns the
  // current height.
  height: function(newHeight) {
    if (arguments.length === 0) {
      return this.h;
    }
    this.h = newHeight;
    return this;
  },

  // configures the radius of the circles in the chart.
  // when called without arguments, returns the
  // current radius.
  radius: function(newRadius) {
   if (arguments.length === 0) {
      return this.r;
    }
    this.r = newRadius;
    return this;
  }
  });
}());
