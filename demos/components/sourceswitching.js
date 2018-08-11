/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../../reactive-react/swyxjs'
import Observable from 'zen-observable'

import Timer from './timer'
import Counter from './counter'

export class SourceSwitching extends Component {
  initialState = true
  toggle = createHandler()
  source($) {
    const source = this.toggle.$
    const reducer = x => !x
    return {source, reducer}
  }
  render(state, stateMap) {
    return <div>
        <button onClick={this.toggle}>Toggle</button>
        {
          state ? this.props.left : this.props.right
        }
      </div>
  }
}

export default function Source() {
  // demonstrate ability to switch sources
  return <SourceSwitching 
          // left={<Counter name="counter b" />} 
          left={<Timer ms={1000}/>} 
          right={<Counter name="counter a" />}
        />
}