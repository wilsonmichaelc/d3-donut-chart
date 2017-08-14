function donutChart() {
  var width,
    height,
    margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    },
    //colour = d3.scaleOrdinal(d3.schemeCategory20c), // colour scheme
    color = d3.scaleOrdinal()
        .domain(["Missing", "Hold", "Available", "Requested", "In-Use"])
        .range(["#006584", "#128fa0", "#939598", "#002b4d", "#f2f2f2"]),
    variable, // value in data that will dictate proportions on chart
    category, // compare data by
    padAngle, // effectively dictates the gap between slices
    floatFormat = d3.format('.4r'),
    cornerRadius, // sets how rounded the corners are on each slice
    percentFormat = d3.format(',.2%');

  var currentIndex = -1;
  var buttonColor = '#128fa0';

  function chart(selection) {
    selection.each(function(data) {
      // generate chart

      // ===========================================================================================
      // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
      var radius = Math.min(width, height) / 2;

      // creates a new pie generator
      var pie = d3.pie()
        .value(function(d) {
          return floatFormat(d[variable]);
        })
        .sort(null);

      // contructs and arc generator. This will be used for the donut. The difference between outer and inner
      // radius will dictate the thickness of the donut
      var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.6)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle);

      // this arc is used for aligning the text labels
      var outerArc = d3.arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.9);
      // ===========================================================================================

      // ===========================================================================================
      // append the svg object to the selection
      var svg = selection.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
      // ===========================================================================================

      // ===========================================================================================
      // g elements to keep elements within svg modular
      svg.append('g').attr('class', 'slices');
      svg.append('g').attr('class', 'labelName');
      svg.append('g').attr('class', 'count');
      svg.append('g').attr('class', 'lines');
      // ===========================================================================================

      // ===========================================================================================
      // add and colour the donut slices
      var path = svg.select('.slices')
        .datum(data).selectAll('path')
        .data(pie)
        .enter().append('path')
        .attr('fill', function(d) {
          return color(d.data[category]);
        })
        .attr('d', arc);
      // ===========================================================================================

      // ===========================================================================================
      // add text labels
      var label = svg.select('.labelName').selectAll('text')
        .data(pie).enter().append('text')
            .attr('dy', '.35em')
            .attr('id', function(d){
              return d.data.Category;
            })
            .html(function(d) {
              // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
              var rt = '<tspan>' + d.data[category] + '</tspan>';
              var lt = '<tspan>' + d.data[category] + '</tspan>';
              return (midAngle(d)) < Math.PI ? rt : lt;
              //return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
            })
            .attr('transform', function(d) {

              // effectively computes the centre of the slice.
              // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
              var pos = outerArc.centroid(d);

              // changes the point to be on left or right depending on where label is.
              var offset = (midAngle(d)) < Math.PI ? 10 : -10;
              pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1) + offset;
              return 'translate(' + pos + ')';
            })
            .style('text-anchor', function(d) {
              // if slice centre is on the left, anchor text to start, otherwise anchor to end
              return (midAngle(d)) < Math.PI ? 'start' : 'end';
            });


      // Add a button for the count
      var count = svg.select('.count').selectAll('text')
        .data(pie).enter().append('text')
            .attr('dy', '.35em')
            .html(function(d) {
              // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
              var rt = '<tspan>' + d.data[variable] + '</tspan>';
              var lt = '<tspan>' + d.data[variable] + '</tspan>';
              return (midAngle(d)) < Math.PI ? rt : lt;
            })
            .attr('transform', function(d) {

              // effectively computes the centre of the slice.
              // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
              var pos = outerArc.centroid(d);

              // changes the point to be on left or right depending on where label is.
              var width = parseInt(window.getComputedStyle(d3.select('#'+d.data.Category).node()).width);
              var offset = (midAngle(d)) < Math.PI ? (width+30) : (width-30);
              pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1) + offset;
              return 'translate(' + pos + ')';
            })
            // .attr('stroke-width', .5)
            // .attr('stroke', 'black')
            .style('text-anchor', function(d) {
              // if slice centre is on the left, anchor text to start, otherwise anchor to end
              return (midAngle(d)) < Math.PI ? 'start' : 'end';
            });
      var border = svg.select('.count').selectAll('rect')
        .data(pie).enter().append('rect')
            .attr('dy', '.35em')
            .attr('transform', function(d) {
              // effectively computes the centre of the slice.
              // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
              var pos = outerArc.centroid(d);

              // changes the point to be on left or right depending on where label is.
              var width = parseInt(window.getComputedStyle(d3.select('#'+d.data.Category).node()).width);
              var offset = (midAngle(d)) < Math.PI ? (width+10) : (width-70);
              pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1) + offset;
              pos[1] = pos[1] - 13;
              return 'translate(' + pos + ')';
            })
            .on('click', function(d){
              var idx = d.index;
              if(currentIndex !== idx){
                d3.selectAll("rect").each(function(d,i) {
                  if(i === currentIndex) {
                      d3.select(this).attr('stroke-width', 1);
                      d3.select(this).style('fill', 'rgba(0, 0, 0, 0.0)');
                  }
                })
                // d3.select(this).attr('stroke', buttonColor);
                d3.select(this).attr('stroke-width', 2);
                currentIndex = idx;
              }else{
                currentIndex = -1;
              }
            })
            .on('mouseover', function(d){
              // d3.select(this).attr('stroke', buttonColor);
              d3.select(this).attr('stroke-width', 2);
              d3.select(this).style('fill', 'rgba(18, 143, 160, 0.1)');
              // d3.select(this).attr('stroke-width', function(d){
              //   return d.index === currentIndex ? 2 : 1;
              // })
              d3.select(this).style("cursor", "pointer");
            })
            .on('mouseout', function(d){
              d3.select(this).attr('stroke-width', function(d){
                return d.index === currentIndex ? 2 : 1;
              });
              d3.select(this).style('fill', function(d){
                return d.index === currentIndex ? 'rgba(18, 143, 160, 0.1)' : 'rgba(0, 0, 0, 0.0)';
              });
              // d3.select(this).attr('stroke-width', 1);
              d3.select(this).style("cursor", "default");
            })
            .attr('width', 60)
            .attr('height', 25)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('stroke-linecap', 'round')
            .style('fill', 'rgba(0, 0, 0, 0.0)')
            .attr('stroke', buttonColor);

      // ===========================================================================================

      // ===========================================================================================
      // add lines connecting labels to slice. A polyline creates straight lines connecting several points
      var polyline = svg.select('.lines')
        .selectAll('polyline')
        .data(pie)
        .enter().append('polyline')
        .attr('points', function(d) {

          // see label transform function for explanations of these three lines.
          var pos = outerArc.centroid(d);
          pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
          return [arc.centroid(d), outerArc.centroid(d), pos]
        });
      // ===========================================================================================

      // ===========================================================================================
      // add tooltip to mouse events on slices and labels
      d3.selectAll('.labelName text, .slices path').call(toolTip);
      // ===========================================================================================

      // ===========================================================================================
      // Functions

      // calculates the angle for the middle of a slice
      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }

      // function that creates and adds the tool tip to a selected element
      function toolTip(selection) {

        // add tooltip (svg circle element) when mouse enters label or slice
        selection.on('mouseenter', function(data) {

          svg.append('text')
            .attr('class', 'toolCircle')
            .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
            .html(toolTipHTML(data)) // add text to the circle.
            .style('font-size', '.9em')
            .style('text-anchor', 'middle'); // centres text in tooltip

          svg.append('circle')
            .attr('class', 'toolCircle')
            .attr('r', radius * 0.55) // radius of tooltip circle
            .style('fill', color(data.data[category])) // colour based on category mouse is over
            .style('fill-opacity', 0.35);

        });

        // remove the tooltip when mouse leaves the slice/label
        selection.on('mouseout', function() {
          d3.selectAll('.toolCircle').remove();
        });
      }

      // function to create the HTML string for the tool tip. Loops through each key in data object
      // and returns the html string key: value
      function toolTipHTML(data) {

        var tip = '',
          i = 0;

        for (var key in data.data) {

          // if value is a number, format it as a percentage
          var value = (!isNaN(parseFloat(data.data[key]))) ? data.data[key] : data.data[key];

          // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
          // tspan effectively imitates a line break.
          if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
          else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
          i++;
        }

        return tip;
      }
      // ===========================================================================================

    });
  }

  // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  chart.margin = function(value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  chart.radius = function(value) {
    if (!arguments.length) return radius;
    radius = value;
    return chart;
  };

  chart.padAngle = function(value) {
    if (!arguments.length) return padAngle;
    padAngle = value;
    return chart;
  };

  chart.cornerRadius = function(value) {
    if (!arguments.length) return cornerRadius;
    cornerRadius = value;
    return chart;
  };

  chart.colour = function(value) {
    if (!arguments.length) return colour;
    colour = value;
    return chart;
  };

  chart.variable = function(value) {
    if (!arguments.length) return variable;
    variable = value;
    return chart;
  };

  chart.category = function(value) {
    if (!arguments.length) return category;
    category = value;
    return chart;
  };

  return chart;
}
