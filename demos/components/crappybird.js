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

export default class CrappyBird extends Component {
  // merging time and coutner
  initialState = {
    input: 50,
    target: 50
  }
  increment = createHandler(e => 3)
  source($) {
    return this.combineReducer({
      input: () => {
        const source = merge(this.increment.$, Interval(200,-1))
        const reducer = (acc, x) => Math.max(0,acc + x)
        return {source, reducer}
      },
      target: () => {
        const source = Interval(200)
        const reducer = (acc) => {
          const int = acc + Math.random() * 8 - 4
          return int - (int-50)/30 // bias toward 50
        }
        return {source, reducer}
      }
    })
  }
  render(state, stateMap) {
    const {input, target} = state
    return <div>
        <h4>Crappy bird</h4>
        <p>Match the bird to the target!</p>
        <button style={btnStyle}  onClick={this.increment}>+</button>
        <p>Bird: <input type="range" value={input} min={0} max={100} /></p>
        <p>Target: <input type="range" value={Math.round(target)} min={0} max={100} /></p>
      </div>
  }
}