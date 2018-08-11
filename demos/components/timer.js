/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../../reactive-react/swyxjs'
import Observable from 'zen-observable'

export default class Timer extends Component {
  // demonstrate interval time
  initialState = 0
  source($) {
    const source = Interval(this.props.ms) // tick every second
    const reducer = x => x + 1 // count up
    // source returns an observable
    return scan(source, reducer, 0) // from zero
  }
  render(state, stateMap) {
    return <div> number of seconds elapsed: {state} </div>
  }
}