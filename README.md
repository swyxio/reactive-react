This is a prototype mockup of a "Reactive" version of React.

In this alternate universe, Observables became a part of Javascript.

We take a minimal implementation of Observables, zen-observable.

The React API we are targeting looks something like this:

```js
// with internal timer
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

// with state
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

// taking info from event handler
class Echo extends Component {
  handler = createHandler(e => e.target.value)
  initialState = 'hello world'
  source($) {
    const source$ = this.handler.$
    const reducer = (acc, n) => n
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

```