/** @jsx createElement */
import {mount, createElement, Component, createHandler, INITIALSOURCE} from './src/creat'
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


function App() {
  // return <Echo />
  // return <Counter />
  return <Timer />
}

mount(<App />, document.getElementById('app'))
