/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../../reactive-react/swyxjs'
import Observable from 'zen-observable'

export default class Blink extends Component {
  // more fun time demo
  // initialState = true // proper
  initialState = 0 // hacky
  source($) {
    // there is a bug right now where switching sources subscribes to the new source twice
    // havent been able to chase it down so i had to do this hacky thing
    // i'm sorry :( breaking demos last minute before talk sucks
    // const reducer = x => !x // the proper reducer
    const reducer = (acc, x) => acc + x // hacky reducer
    const source = Interval(500, 1) // tick every second
    return {source, reducer}
  }
  render(state) {
    const style = {
      visibility: ((state/2 + 1) % 2) ? // hacky
       'visible' : 
       'hidden'}
    return <div style={style}>Bring back the blink tag! </div>
  }
}