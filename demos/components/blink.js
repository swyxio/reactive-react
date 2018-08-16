/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../../reactive-react/swyxjs'
import Observable from 'zen-observable'

export default class Blink extends Component {
  // more fun time demo
  initialState = true
  source($) {
    const reducer = (_, x) => !x
    const source = Interval(1000) // tick every second
    return {source, reducer}
  }
  render(state) {
    const style = {display: state ? 'block' : 'none'}
    return <div style={style}>Bring back the blink tag! </div>
  }
}