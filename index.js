/** @jsx createElement */
import {mount, createElement, Component, createHandler} from './reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from './reactive-react/swyxjs'
import Observable from 'zen-observable'

// class Counter extends Component {
//   initialState = 0
//   increment = createHandler(e => 1)
//   decrement = createHandler(e => -1)
//   source($) {
//     const source = merge(this.increment.$, this.decrement.$)
//     const reducer = (acc, n) => acc + n
//     return {source, reducer}
//   }
//   render(state, prevState) {
//     const {name = "counter"} = this.props
//     return <div>
//         {name}: {state}
//         <button onClick={this.increment}>+</button>
//         <button onClick={this.decrement}>-</button>
//       </div>
//   }
// }

// class Timer extends Component {
//   initialState = 0
//   source($) {
//     const reducer = x => x + 1 // count up
//     const source = Interval() // tick every second
//     // source returns an observable
//     return scan(source, reducer, 0) // from zero
//   }
//   render(state, prevState) {
//     return <div> number of seconds elapsed: {state} </div>
//   }
// }

// class Blink extends Component {
//   initialState = true
//   source($) {
//     const reducer = x => !x
//     // tick every ms milliseconds
//     const source = Interval(this.props.ms) 
//     // source can also return an observable
//     return scan(source, reducer, true)
//   }
//   render(state) {
//     const style = {display: state ? 'block' : 'none'}
//     return <div style={style}>Bring back the blink tag! </div>
//   }
// }




class CrappyBird extends Component {
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
  render(state, prevState) {
    const {input, target} = state
    return <div>
        <button onClick={this.increment}>+</button>
        <h1>Crappy bird</h1>
        <p>Bird: <input type="range" value={input} min={0} max={100} /></p>
        <p>Target: <input type="range" value={Math.round(target)} min={0} max={100} /></p>
      </div>
  }
}


function App() {
  // return <Echo />
  // return <Counter />
  // return <Timer />
  // return <Blink ms={500} />
  return <CrappyBird />
}

mount(<App />, document.getElementById('app'))
