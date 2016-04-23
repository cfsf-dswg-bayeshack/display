var colorMap = d3.map()

var allData

var width = 960,
    height = 500,
    active = d3.select(null);

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");

svg
    .call(zoom) // delete this line to disable free zooming
    .call(zoom.event);

let quantize = d3.scale.quantize()
    .range(d3.range(9).map(function(i) { return 'q' + i + '-9' }))


queue()
  .defer(d3.json, 'data/topo/us-states-10m.json')
  .defer(d3.csv, 'data/data.csv') //data file here
  .await(renderFirst)

function renderFirst(error, us, rawdata) {
  if (error) throw error;

  allData = rawdata

  var year = 2015
  var data = chooseYear(rawdata, year)
  setColorKey(data)

  g.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked)
      .attr("class", function(d){
        return 'state ' + quantize(colorMap.get(d.id))
      })

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

  // g.selectAll('path')
  //     .data(topojson.feature(us, us.objects.counties).features)
  //   .enter().append("path")
  //     .attr("d", path)
  //     .attr('class', 'county')
};

function chooseYear(rawdata, year) {
  // filter data for just one year
  var result = []
  rawdata.forEach(function(d){
    if(+d.year === year) result.push(d)
  })
  return result
}

function setColorKey (data) {
  data.forEach(function(d){
    colorMap.set(d.id, +d.value);
  })
  quantize.domain( d3.extent(data,function(d){return +d.value}) )
}

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}


/* page listeners */
d3.select('#data-year-dropdown').on('change', function(){
  return dispatcher.changeYear(+this.value);
})

/* dispatcher events */
let dispatcher = d3.dispatch('changeYear')
dispatcher.on('changeYear', function(year){
  var data = chooseYear(allData, year)
  setColorKey(data)

  d3.selectAll(".state")
      .attr("class", function(d){
        return 'state ' + quantize(colorMap.get(d.id))
      })
})
