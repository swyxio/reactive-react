This is a prototype mockup of a "Reactive" version of React.

In this alternate universe, Observables became a part of Javascript.

We take a minimal implementation of Observables, zen-observable.

The React API we are targeting looks something like this:

```js
// with internal timer
class App extends Component {
  source($) {
    return scan(
      Interval(), // tick every second
      x => x+1, // count up
      0         // from zero
    )
  }
  render(state, prevState) {
    const elapsed = state === INITIALSOURCE ? 0 : state
    return <div> number of seconds elapsed: {elapsed} </div>
  }
}

// with state
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
        Count: {state}
        <button onclick={this.increment}>+</button>
        <button onclick={this.decrement}>-</button>
      </div>
  }
}

```