/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
// import React, {Component} from 'react'
// import {
//   VictoryArea,
//   VictoryAxis,
//   VictoryChart,
//   VictoryBar,
//   VictoryTheme,
//   VictoryScatter,
//   VictoryStack,
// } from 'victory';
import * as d3 from "d3";

const colors = ['#fff489', '#fa57c1', '#b166cc', '#7572ff', '#69a6f9'];

export default class Charts extends Component {
  render() {
    const streamData = this.props.data;
    const data = streamData // [streamData[0]]
    const container = document.getElementById("demo")
    if (!container) return <div>Type something</div> // initial load only

    var margin = { top: 10, right: 20, bottom: 30, left: 30 };
    var width = 565 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // really janky clearance
    const temp = d3.select(".chart")
      .selectAll("svg")
    if (temp._groups[0] && temp._groups[0].length) temp._groups[0]
      .forEach((d, i) => d.parentNode.removeChild(d))
    
    var svg = d3.select('.chart')
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        // .call(responsivefy)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
      
      var xScale = d3.scaleLinear()
        .domain([
          d3.min(data, co => d3.min(co, d => d.x)),
          d3.max(data, co => d3.max(co, d => d.x))
        ])
        .range([0, width]);
      svg
        .append('g')
          .attr('transform', `translate(0, ${height})`)
          .style('stroke', 'yellow')
        .call(d3.axisBottom(xScale).ticks(5));
    
      var yScale = d3.scaleLinear()
        .domain([
          d3.min(data, co => d3.min(co, d => d.y)),
          d3.max(data, co => d3.max(co, d => d.y))
        ])
        .range([height, 0]);
      svg
        .append('g')
        .style('stroke', 'yellow')
        .call(d3.axisLeft(yScale));


      var line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveCatmullRom.alpha(0.5));
    
      svg
        .selectAll('.line')
        .data(data)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d))
        // .style('stroke', (d, i) => ['#FF9900', '#3369E8'][i])
        .style('stroke', (d, i) => colors[i])
        .style('stroke-width', 2)
        .style('fill', 'none');
    // var scale = d3.scaleLinear()
    //   .domain([0, 1000])
    //   .range([0, 1000])
    // const path = d3.select(".chart")
    //   .selectAll("div")
    //   .data(streamData[0].map(x => x.y))
    // // enter
    // path
    //     .enter()
    //     .append("div")
    //     .style("background", "rebeccapurple")
    //     .style("width", function(d) { return scale(d) + "px"; })
    //     .text(function(d) { return d; });
    return (
      <div>
        <div style={{display: 'flex'}}>
          <div className="chart"></div>
          {/* <VictoryChart
            theme={VictoryTheme.material}
            width={400}
            height={400}
            style={{
              parent: {
                backgroundColor: '#222',
              },
            }}>
            <VictoryAxis
              style={{
                axis: {stroke: 'white'},
                tickLabels: {fill: 'white'},
              }}
            />
            <VictoryAxis
              style={{
                axis: {stroke: 'white'},
                tickLabels: {fill: 'white'},
              }}
              dependentAxis
            />
            <VictoryScatter
              data={streamData[0]}
              size={6}
              style={{
                data: {
                  fill: d => colors[d.x % 5],
                },
              }}
            />
          </VictoryChart>

          <VictoryChart
            theme={VictoryTheme.material}
            width={400}
            height={400}
            style={{
              parent: {
                backgroundColor: '#222',
              },
            }}
            domainPadding={[20, 20]}>
            <VictoryAxis
              style={{
                axis: {stroke: 'white'},
                tickLabels: {fill: 'white'},
              }}
            />
            <VictoryAxis
              style={{
                axis: {stroke: 'white'},
                tickLabels: {fill: 'white'},
              }}
              dependentAxis
            />
            <VictoryBar
              data={streamData[0]}
              style={{
                data: {
                  fill: d => colors[d.x % 5],
                  stroke: 'none',
                  padding: 5,
                },
              }}
            />
          </VictoryChart> */}
        </div>
        <div
          style={{
            display: 'flex',
            position: 'relative',
            top: '-50px',
          }}>
          {/* <VictoryChart
            theme={VictoryTheme.material}
            width={800}
            height={350}
            style={{
              parent: {
                backgroundColor: '#222',
              },
            }}>
            <VictoryAxis
              style={{
                axis: {stroke: 'white'},
                tickLabels: {fill: 'white'},
              }}
            />
            <VictoryAxis
              style={{
                axis: {stroke: 'white'},
                tickLabels: {fill: 'white'},
              }}
              dependentAxis
            />
            <VictoryStack>
              {streamData.map((data, i) => (
                <VictoryArea key={i} data={data} colorScale={colors} />
              ))}
            </VictoryStack>
          </VictoryChart> */}
        </div>
      </div>
    );
  }
}


function responsivefy(svg) {
  // get container + svg aspect ratio
  if (!svg.node()) return
  var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMid")
      .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}