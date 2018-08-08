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
    const container = document.getElementById("demo")
    if (!container) return <div>Type something</div>
    const temp = d3.select(".chart")
      .selectAll("div")
    if (temp._groups[0] && temp._groups[0].length) temp._groups[0]
      .forEach((d, i) => d.parentNode.removeChild(d))
    // console.log({streamData: streamData[0]})
    var scale = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, 1000])
    const path = d3.select(".chart")
      .selectAll("div")
      .data(streamData[0].map(x => x.y))
    // enter
    path
        .enter()
        .append("div")
        .style("background", "rebeccapurple")
        .style("width", function(d) { return scale(d) + "px"; })
        .text(function(d) { return d; });
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
