/** @jsx createElement */
import {mount, createElement, Component, createHandler, INITIALSOURCE} from './reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from './src/swyxjs'
import Observable from 'zen-observable'

// class Counter extends Component {
//   initialState = 0
//   increment = createHandler(e => console.log('hi') || 1)
//   decrement = createHandler(e => console.log('hi2') ||  -1)
//   source($) {
//     const source$ = merge(this.increment.$, this.decrement.$)
//     const reducer = (acc, n) => console.log({acc}) || acc + n
//     // source returns an observable
//     return scan(source$, reducer, 0)
//   }
//   render(state, prevState) {
//     return <div>
//         Count: {state}
//         <button onClick={this.increment}>+</button>
//         <button onClick={this.decrement}>-</button>
//       </div>
//   }
// }

class Timer extends Component {
  initialState = 0
  source($) {
    const reducer = x => x + 1 // count up
    const source$ = Interval() // tick every second
    // source returns an observable
    return scan(source$, reducer, 0) // from zero
  }
  render(state, prevState) {
    return <div> number of seconds elapsed: {state} </div>
  }
}

class Blink extends Component {
  initialState = true
  source($) {
    const reducer = x => !x
    // tick every ms milliseconds
    const source$ = Interval(this.props.ms) 
    // source can also return an observable
    return scan(source$, reducer, true)
  }
  render(state) {
    const style = {display: state ? 'block' : 'none'}
    return <div style={style}>Bring back the blink tag! </div>
  }
}


function App() {
  // return <Echo />
  // return <Counter />
  // return <Timer />
  return <Blink ms={500} />
}

mount(<App />, document.getElementById('app'))
