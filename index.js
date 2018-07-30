/** @jsx createElement */
import {mount, createElement, Component, createHandler, INITIALSOURCE} from './src/creat'
import {Interval, scan, startWith, merge, mapToConstant} from './src/swyxjs'
import Observable from 'zen-observable'

// class App extends Component {
//   source($) {
//     return scan(
//       Interval(), // tick every second
//       x => x+1, // count up
//       0         // from zero
//     )
//   }
//   render(state, prevState) {
//     const elapsed = state === INITIALSOURCE ? 0 : state
//     return <div> number of seconds elapsed: {elapsed} </div>
//   }
// }

class Test extends Component {
  render() {
    return <h1>Title</h1>
  }
}

class App extends Component {
  increment = createHandler(e => 1)
  decrement = createHandler(e => -1)
  source($) {
    const source$ = merge(this.increment.$, this.decrement.$)
    const reducer = (acc, n) => acc + n
    return scan(source$, reducer, 0)
  }
  render(state) {
    return <div>
        {/* <Test/>  */}
        Count: {state}
        <button onclick={this.increment}>+</button>
        <button onclick={this.decrement}>-</button>
      </div>
  }
}


mount(<App />, document.getElementById('app'))
