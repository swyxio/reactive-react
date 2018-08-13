/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../../reactive-react/swyxjs'
import Observable from 'zen-observable'

const btnStyle = {
  padding: "10px 20px",
  backgroundColor: "palegoldenrod",
  borderRadius: "5px",
  fontSize: "large",
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
        <h4>Crappy Bird: <small>Match the bird to the target!</small></h4>
        <div style={{display: 'grid', gridTemplateColumns: '150px auto auto'}}>
          <div>{ Math.abs(input - target) < 20 ? '👍 Good 👍' : '☠️ LOSING! ☠️'}</div>
          <div style={{textAlign: 'center'}}>Bird</div>
          <div style={{textAlign: 'center'}}>Target</div>
          <div style={{display: 'grid', alignItems: 'center', justifyContent: 'center'}}>
            <button style={btnStyle} onClick={this.increment}>+</button>
          </div>
          <div style={{height: 400, backgroundColor: 'rgba(0,0,0,0.3)'}}>
            <div style={{paddingTop: (100 - input) * 3}}>
              <div style={{fontSize: '3em', backgroundColor: 'rgba(80,0,0,0.3)'}}>
              💩
              </div>
            </div>
          </div>
          <div style={{height: 400, backgroundColor: 'rgba(0,0,0,0.3)'}}>
            <div style={{paddingTop: (100 - target) * 3}}>
              <div style={{fontSize: '3em', backgroundColor: 'rgba(0,80,0,0.3)'}}>
              🎯
              </div>
            </div>
          </div>
        </div>
      </div>
  }
}


        // {/* <p>Bird: <input type="range" value={input} min={0} max={100} /></p>
        // <p>Target: <input type="range" value={Math.round(target)} min={0} max={100} /></p> */}