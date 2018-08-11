/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../../reactive-react/swyxjs'
import Observable from 'zen-observable'

const btnStyle = {
  padding: "10px 20px",
  backgroundColor: "palegoldenrod",
  borderRadius: "10px",
  fontSize: "large",
  margin: "10px",
}

export default class Counter extends Component {
  // demonstrate basic counter
  initialState = 0
  increment = createHandler(e => 1)
  decrement = createHandler(e => -1)
  source($) {
    const source = merge(this.increment.$, this.decrement.$)
    const reducer = (acc, n) => acc + n
    return {source, reducer}
  }
  render(state, stateMap) {
    const {name = "counter"} = this.props
    return <div>
        <p>
        {name}: {state}
        </p>
        <button style={btnStyle } onClick={this.increment}>+</button>
        <button style={btnStyle }  onClick={this.decrement}>-</button>
      </div>
  }
}


export function Counters() {
  // demonstrate independent states
  return <div>
    <Counter name="counter a" />
    <Counter name="counter b" />
    </div>
}