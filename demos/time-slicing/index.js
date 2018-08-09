/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactivereact'
import {fromEvent} from '../../reactivereact/swyxjs'
import Observable from 'zen-observable'

import _ from 'lodash';
import Charts from './Charts';
// import Clock from './Clock';
import './index.css';

let cachedData = new Map();

export class App extends Component {
  initialState = ''

  // Random data for the chart
  getStreamData(input) {
    if (cachedData.has(input)) {
      return cachedData.get(input);
    }
    const multiplier = input.length !== 0 ? input.length : 1;
    const complexity =
      (parseInt(window.location.search.substring(1), 10) / 100) * 25 || 25;
    const data = _.range(5).map(t =>
      _.range(complexity * multiplier).map((j, i) => {
        return {
          x: j,
          y: (t + 1) * _.random(0, 255),
        };
      })
    );
    cachedData.set(input, data);
    return data;
  }

  handleChange = createHandler(e => e.target.value)
  source() {
    return {
      source: this.handleChange.$,
      reducer: (_, x) => x
    }
  }

  render(state, stateMap) {
    const Wrapper = 'div'
    const data = this.getStreamData(state);
    return (
      <div className="container">
        <input
          className={'input sync'}
          placeholder="longer input → more components and DOM nodes"
          // defaultValue={state}
          value={state}
          onInput={this.handleChange}
        />
        <Wrapper>
          <div className="demo" id="demo">
            <Charts data={data} />
          </div>
        </Wrapper>
      </div>
    );
  }
}


const container = document.getElementById('app');
mount(<App />, container);
