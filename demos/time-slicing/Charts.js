/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
import * as d3 from "d3";

const colors = ['#fff489', '#fa57c1', '#b166cc', '#7572ff', '#69a6f9'];

export default class Charts extends Component {
  render() {
    const data = this.props.data;
    const container = document.getElementById("demo")
    if (!container) return <div>Type something</div> // initial load only
    bottomChart(data)
    leftChart(data)
    rightChart(data)
    return (
      <div>
        <h2 style={{textAlign: 'center'}}>number of datapoints: {data[0].length * 5}</h2>
        <div style={{display: 'flex', paddingBottom: 20}}>
          <div className="leftchart"></div>
          <div className="rightchart"></div>
        </div>
        <div
          style={{
            display: 'flex',
            position: 'relative',
            // top: '-50px',
          }}>
          <div className="bottomchart"></div>
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

function bottomChart(data) {

  var margin = { top: 10, right: 20, bottom: 30, left: 30 };
  var width = 565 * 2 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // really janky clearance
  const temp = d3.select(".bottomchart")
    .selectAll("svg")
  if (temp._groups[0] && temp._groups[0].length) temp._groups[0]
    .forEach((d, i) => d.parentNode.removeChild(d))
  
  var svg = d3.select('.bottomchart')
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

    var area = d3.area()
      .x(d => xScale(d.x))
      .y0(yScale(yScale.domain()[0]))
      .y1(d => yScale(d.y))
      .curve(d3.curveCatmullRom.alpha(0.5));
  
    svg
      .selectAll('.area')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'area')
      .attr('d', d => area(d))
      .style('stroke', (d, i) => colors[i])
      .style('stroke-width', 2)
      .style('fill', (d, i) => colors[i])
      .style('fill-opacity', 0.5)
}



function rightChart(data) {

  var margin = { top: 10, right: 20, bottom: 30, left: 30 };
  var width = 565 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // really janky clearance
  const temp = d3.select(".rightchart")
    .selectAll("svg")
  if (temp._groups[0] && temp._groups[0].length) temp._groups[0]
    .forEach((d, i) => d.parentNode.removeChild(d))
  
  var svg = d3.select('.rightchart')
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
}


function leftChart(data) {

  var margin = { top: 10, right: 20, bottom: 30, left: 30 };
  var width = 565 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // really janky clearance
  const temp = d3.select(".leftchart")
    .selectAll("svg")
  if (temp._groups[0] && temp._groups[0].length) temp._groups[0]
    .forEach((d, i) => d.parentNode.removeChild(d))
  
  var svg = d3.select('.leftchart')
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

    var circlesArr = svg
      .selectAll('.ball')
      .data(data)
      .enter()
      .append('g')
      .each(function(d, i) {
        var node = d3.select(this).selectAll('g')
          .data(d)
          .enter()
          .append('g')
          .attr('class', 'ball')
          .attr('transform', d => {
            return `translate(${xScale(d.x)}, ${yScale(d.y)})`;
          });
        node
          .append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', d => 5)
          .style('fill-opacity', 0.5)
          .style('fill', colors[i]);
      })
}