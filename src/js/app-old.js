// (function() {
  'use strict'
  function dropdown(selector, timeframe){
    let yearChooser= document.getElementById(selector+'-year-dropdown')
    let span = [];

    if (timeframe === 'past'){
      span = [1920, 2010];
    }else{
      span = [2010, 2100];
    }

    clearOptions()
    for(let i=span[0]; i<span[1]; i++){
      addOption(i);
    }

    function addOption(el,i, arr){
      var option = document.createElement("option");
      option.value = el;
      option.text = el;
      // if (el == '2009')
      //   option.selected = true;
      yearChooser.appendChild(option);
    }
    function clearOptions(){
      var myNode = yearChooser;
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }
    }
  }
  dropdown('defaultData', 'past')




  class Dataset {
    constructor(selector){
      this.selector = selector;
      this.boundary = 'state';
      this.geo = '1113810002';
    }
    dataByBoundary(val){
      let result = {}
      this.rawData.forEach((boundary)=>{
        result[boundary.id] = boundary[val];
      })
      return result;
    }
    setDropdown(annum){
      let selList = document.getElementById(this.selector+'-year-dropdown');
      for (let i = 0; i < selList.options.length; i++) {
       let tmpOptionText = selList.options[i].text;
       if(tmpOptionText == annum) selList.selectedIndex = i;
     }
    }
    get model(){
      return d3.select('#'+this.selector+'-model-dropdown').node().value;
    }
    get parameter(){
        return d3.select('input[name=radio-parameter]:checked').node().value;
    }
    get year(){
      return d3.select('#'+this.selector+'-year-dropdown').node().value;
    }
    get yearJson(){
      return 'data/'+ this.model +'/annual/'+this.year+'.json'
    }
    get basinJson(){
      return 'data/'+ this.model +'/basin/'+this.geo+'.json'
    }


  };

  // tooltip methods
  let tt = {
    init: function(element){
      d3.select(element).append('div')
          .attr('id', 'tooltip')
          .attr('class', 'hidden')
        .append('span')
          .attr('class', 'value')
    },
    follow: function(element, caption, options) {
      element.on('mousemove', null);
      element.on('mousemove', function() {
        let position = d3.mouse(document.body);
        d3.select('#tooltip')
          .style('top', ( (position[1] + 30)) + "px")
          .style('left', ( position[0]) + "px");
        d3.select('#tooltip .value')
          .html(caption);
      });
      d3.select('#tooltip').classed('hidden', false);
    },
    hide: function() {
      d3.select('#tooltip').classed('hidden', true);
    }
  }




  let margin = {top: 0, left: 40, bottom: 40, right: 0},
      width = parseInt(d3.select('#map_container').style('width')),
      // width = window.getComputedStyle(document.getElementById("map_container"), null).getPropertyValue("width"),
      barchartWidth = parseInt(d3.select('#defaultData').style('width')) - margin.left - margin.right
    // width = width - margin.left - margin.right
  let mapRatio = 1,
      height = width * mapRatio,
      barchartHeight = (width/3)- margin.top - margin.bottom,
      scaleMultiplier = 1.4 // TODO: set this programmitically with bounding box from turf

  let x = d3.scale.ordinal()
      .rangeRoundBands([0, barchartWidth], .1);

  let y = d3.scale.linear()
      .range([barchartHeight, 0]);

  let xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  let yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  let mapsvg = d3.select('#map_container').append('svg')
      .attr('height', height)
      .attr('id','map')
  var barsvg = d3.select('#defaultData').append('svg')
      .attr('height', barchartHeight)
      .attr('id','barchart')

  let colorMap = d3.map(),
      keymap = []

  let quantize = d3.scale.quantize()
      .range(d3.range(9).map(function(i) { return 'q' + i + '-9' }))

  let prettify = d3.format(".01f")

  // let tiler = d3.geo.tile()
  //     .size([width, height])

  let projection = d3.geo.albersUsa()
      // .center([-98.585522, 39.8333333])
      .scale(width*scaleMultiplier)
      .translate([width / 2, height / 2])

  var zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(1)
      .scaleExtent([1, 5])
      .on("zoom", zoomed);

  let path = d3.geo.path()
      .projection(projection)

  mapsvg.append('g')
      .attr('class', 'geoBoundaries')

  mapsvg.call(zoom)

  mapsvg.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(0,10)");

  let legend = d3.legend.color()
    .labelFormat(d3.format(".0f"))
    // .ascending( ()=>{(Dataset.parameter === 'temp') ? true : false })
    .shapeWidth(width*.8/9)
    .shapePadding(6)
    .orient('horizontal')
    .useClass(true)
    .scale(quantize);

  tt.init('body')


  function zoomed() {
    var g = d3.select('#map_container .geoBoundaries');
    g.style("stroke-width", 1 / d3.event.scale + "px");
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }


let defaultData = new Dataset('defaultData')

  // download data and draw map
  queue()
    .defer(d3.json, 'data/topo/us-states-10m.json')
    .defer(d3.json, defaultData.yearJson)
    // .defer(d3.json, defaultData.basinJson)
    .await(renderFirst)

  function renderFirst(error, geo, data, annual) {


    // defaultData.rawData = data;
    // defaultData.basinData = annual;
    // defaultData.topo = topojson.feature(geo, geo.objects['states']).features;
    // // let dataBind = defaultData.dataByTract();
    // // mapchart.draw({'Geo': topoFeat, 'ToBind': dataBind});
    // mapsvg.call(renderGeo, defaultData);
    // // updateGeo(defaultData);
    // // drawLegend();
    // // barsvg.call(renderBarChart, defaultData);
  };



  /* map drawing and updating methods :
   * renderX = first time
   * drawX   = general
   * updateX = redraw
   */
  function drawLegend(){
    mapsvg.select(".legendQuant")
      .call(legend);
  }

  function renderGeo(svg, dataset){
    d3.select('.geoBoundaries')
      .selectAll('.' + dataset.boundary)
        .data(dataset.topo)
      .enter().append('path')
        .attr('class', dataset.boundary)
        .attr('d', path)
        .on('click', function(d){ return dispatcher.changeGeo(d.id) })
        .on('mouseover', function(d) {
          let me = d3.select(this),
              value = colorMap.get(d.id),
              thisText = d.properties.state + '<br>FIPS id: ' + d.id + '<br> value: '+ prettify(value);
          tt.follow(me, thisText)
          // return setTitle(value)
        })
        .on("mouseout", tt.hide )
  }

  function renderBarChart(svg, dataset){
    let param = dataset.parameter
    x.domain(dataset.basinData.map(function(d) { return d.year}));
    y.domain(d3.extent(dataset.basinData, function(d) { return d[param]; } ));
    let domain = y.domain();
    if(param === 'temp'){ domain = [domain[1], domain[0]] }
    quantize.domain(domain);
    let chart = svg.append('g')//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform",  function(d) {
          return 'translate(0,' + barchartHeight + ')'
        })
        .attr('text-anchor', 'start')
        .call(xAxis)
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    chart.append("g")
        .attr("class", "y axis")
        .attr("transform",  function(d) {
          return 'translate('+margin.left+',0)'
        })
        .call(yAxis)
    chart.selectAll(".bar")
        .data(dataset.basinData)
      .enter().append("rect")
      // .enter().append("circle")
        .attr('class', function(d){
          return 'bar ' + quantize(d[param])
        })
        // .attr("cx", function(d) { return x(d.year); })
        // .attr("cy", function(d) { return y(d[param]); })
        // .attr("r", '5')
        .attr("x", function(d) { return x(d.year); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d[param]); })
        .attr("height", function(d) { return barchartHeight - y(d[param]); })
        .on("mouseover", function(d){
          var me = d3.select(this),
              thisText = d.year + ': '+ prettify(d[param]);
          return tt.follow(me, thisText);
        } )
        .on("mouseout", tt.hide )
        .on('click', function(d){
          return dispatcher.changeYear(d.year)
        })
    // svg.classed('hidden', true);
  }

  function updateBarChart(dataset){
    let param = dataset.parameter
    x.domain(dataset.basinData.map(function(d) {return d.year}));
    y.domain(d3.extent(dataset.basinData, function(d) { return d[param]; } ));
    let domain = y.domain();
    if(param === 'temp'){ domain = [domain[1], domain[0]] }
    quantize.domain(domain);

    let bars = d3.selectAll('.bar')
    bars.data(dataset.basinData)
        .attr('class', function(d){
          return 'bar ' + quantize(d[param])
        })
        // .attr("cy", function(d) { return y(d[param]); })
        .attr("y", function(d) { return y(d[param]); })
        .attr("height", function(d) { return barchartHeight - y(d[param]); })
        .on("mouseover", function(d){
          var me = d3.select(this),
              thisText = d.year + ': '+ prettify(d[param]);
          return tt.follow(me, thisText);
        })

    d3.select('.y.axis').call(yAxis);
    // d3.select('.x.axis').call(xAxis);
    // barsvg.classed('hidden', false);
  }

  function updateGeo(dataset){
    keymap.length = 0;
    let param = dataset.parameter;
    keymap = dataset.rawData.map((boundary)=>{
      colorMap.set(boundary.id, +boundary[param]);
      return +boundary[param];
    })
    let domain = d3.extent(keymap);
    if(reverse){ domain = [domain[1], domain[0]] };
    quantize.domain(domain);
    // drawLegend();

    let boundaries = mapsvg.select('.geoBoundaries').selectAll('.'+ dataset.boundary)
    boundaries
      .attr('class', function(d){
        return dataset.boundary+ ' ' + quantize(colorMap.get(d.id))
      });
  }




  /* page listeners */
  d3.select('#defaultData-year-dropdown').on('change', function(){
    return dispatcher.changeYear();
  })
  d3.selectAll('input[name=radio-parameter]').on('change', function(){
    return dispatcher.changeParameter();
  })
  d3.select('#defaultData-model-dropdown').on('change', function(){
    return dispatcher.changeModel();
  })
  // d3.select(window).on('resize', resize);




  /* dispatcher events */
  let dispatcher = d3.dispatch('changeGeo', 'changeParameter', 'changeYear', 'changeModel')
  dispatcher.on('changeGeo', function(geo){
    defaultData.geo = geo;
    d3.json( defaultData.basinJson, function(data){
      defaultData.basinData = data;
      updateBarChart(defaultData);
    })
  })
  dispatcher.on('changeParameter', function(){
    console.log('asdf')
    updateGeo(defaultData);
    updateBarChart(defaultData);
  })
  dispatcher.on('changeYear', function(year){
    if (year) {
      defaultData.setDropdown(year);
    }
    year = year || defaultData.year;
    d3.json(defaultData.yearJson, function(data){
      defaultData.rawData = data;
      updateGeo(defaultData);
    })
  })
  dispatcher.on('changeModel', function(){
    if(defaultData.model==='HST'){ dropdown('defaultData', 'past'); }
    else{ dropdown('defaultData','future');}
    dispatcher.changeYear();
    dispatcher.changeGeo(defaultData.geo);
  })


  // function renderTiles(svg, type) {
  //   svg.append('g')
  //       .attr('class', type)
  //     .selectAll('g')
  //       .data(tiler
  //         .scale(projection.scale() * 2 * Math.PI)
  //         .translate(projection([0, 0])))
  //     .enter().append('g')
  //       .each(function(d) {
  //         let g = d3.select(this)
  //         // d3.json('http://' + ['a', 'b', 'c'][(d[0] * 31 + d[1]) % 3] + '.tile.openstreetmap.us/vectiles-' + type + '/' + d[2] + '/' + d[0] + '/' + d[1] + '.json', function(error, json) {
  //         // use the locally cached tiles
  //         d3.json('data/osm/' + ['a', 'b', 'c'][(d[0] * 31 + d[1]) % 3] + '-highroad-'+ d[2] + '-' + d[0] + '-' + d[1] + '.json', function(error, json) {
  //           g.selectAll('path')
  //               .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key }))
  //             .enter().append('path')
  //               .attr('class', function(d) { return d.properties.kind })
  //               .attr('d', path)
  //         })
  //       })
  // }

  // function resize() {
  //   // adjust things when the window size changes
  //   width = parseInt(d3.select('#map_container').style('width'));
  //   barchartWidth = parseInt(d3.select('#barchart_container').style('width'));
  //   width = width - margin.left - margin.right;
  //   height = width * mapRatio;
  //
  //   // update projection
  //   projection
  //       .translate([width / 2, height / 2])
  //       .scale(width*scaleMultiplier);
  //   x.rangeRoundBands([0, barchartWidth], .1);
  //   xAxis.scale(x)
  //   barsvg.select(".x.axis")
  //       .call(xAxis)
  //   barsvg.selectAll(".x text")
  //         .attr("y", 0)
  //         .attr("x", 9)
  //         .attr("dy", ".35em")
  //         .style("text-anchor", "start")
  //
  //   // resize the map container
  //   mapsvg
  //       .style('width', width + 'px')
  //       .style('height', height + 'px');
  //   barsvg
  //       .style('width', barchartWidth + 'px');
  //
  //   barsvg.selectAll(".bar")
  //     .attr("width", x.rangeBand())
  //     .attr("x", function(d) { return x(d.category); })
  //
  //   // resize the map
  //   mapsvg.select('.geoBoundaries').attr('d', path);
  //   mapsvg.selectAll('.' + Dataset.boundary).attr('d', path);
  // }




  function setTitle(newTitle){
    d3.select('#selected-title').text(newTitle);
  }


// })()