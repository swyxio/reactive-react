/** @jsx createElement */
import {mount, createElement, Component, createHandler, INITIALSOURCE} from './src/creat'
import {Interval, scan, startWith, merge, mapToConstant} from './src/swyxjs'
import Observable from 'zen-observable'

class Counter extends Component {
  initialState = 0
  increment = createHandler(e => 1)
  decrement = createHandler(e => -1)
  source($) {
    const source$ = merge(this.increment.$, this.decrement.$)
    const reducer = (acc, n) => acc + n
    // source returns an observable
    return scan(source$, reducer, 0)
  }
  render(state, prevState) {
    return <div>
        Count: {state}
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
  }
}

function App() {
  return <Counter />
}

mount(<App />, document.getElementById('app'))
