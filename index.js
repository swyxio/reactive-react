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

class Echo extends Component {
  handler = createHandler(e => console.log('sldkj') || e.target.value)
  initialState = 'hello world'
  source($) {
    const source$ = this.handler.$
    const reducer = (_, n) => n
    // source returns an object
    return {source$, reducer}
  }
  render(state, prevState) {
    return <div>
        <input value={state} onInput={this.handler}/>
        {state}
      </div>
  }
}

function App() {
  return <Echo />
}

mount(<App />, document.getElementById('app'))
