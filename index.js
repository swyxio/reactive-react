/** @jsx createElement */
import {mount, createElement, Component, createHandler, INITIALSOURCE} from './src/creat'
import {Interval, scan, startWith, merge, mapToConstant} from './src/swyxjs'
import Observable from 'zen-observable'

class Counter extends Component {
  increment = createHandler(e => 1)
  decrement = createHandler(e => -1)
  source($) {
    const reducer = (acc, n) => acc + n
    // source returns an observable
    return merge(this.increment.$, this.decrement.$)
            |> (_ => scan(_, reducer, 0))
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
