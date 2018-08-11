This is a prototype mockup of a "Reactive" version of React.

In this alternate universe, Observables became a part of Javascript.

We take a minimal implementation of Observables, zen-observable.


# Try it out

`yarn start` to run the demo locally

# The `reactive-react` API

The React API we are targeting looks something like this (see `/demos` for actual examples):

```js
class Counter extends Component {
  // demonstrate basic counter
  initialState = 0
  increment = createHandler(e => 1)
  decrement = createHandler(e => -1)
  source($) {
    const source = merge(this.increment.$, this.decrement.$)
    const reducer = (acc, n) => acc + n
    return {source, reducer}
  }
  render(state, stateMap) {
    const {name = "counter"} = this.props
    return <div>
        {name}: {state}
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
    const source = this.handler.$
    const reducer = (acc, n) => n
    return {source, reducer}
  }
  render(state, prevState) {
    return <div>
        <input value={state} onInput={this.handler}/>
        {state}
      </div>
  }
}

class Timer extends Component {
  // demonstrate interval time
  initialState = 0
  source($) {
    const reducer = x => x + 1 // count up
    const source = Interval(this.props.ms) // tick every second
    // source returns an observable
    return scan(source, reducer, 0) // from zero
  }
  render(state, stateMap) {
    return <div> number of seconds elapsed: {state} </div>
  }
}

class Blink extends Component {
  // more fun time demo
  initialState = true
  source($) {
    const reducer = x => !x
    // tick every ms milliseconds
    const source = Interval(this.props.ms) 
    // source can also return an observable
    return scan(source, reducer, true)
  }
  render(state) {
    const style = {display: state ? 'block' : 'none'}
    return <div style={style}>Bring back the blink tag! </div>
  }
}

class CrappyBird extends Component {
  // merging time and counter
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
        <button onClick={this.increment}>+</button>
        <h1>Crappy bird</h1>
        <p>Bird: <input type="range" value={input} min={0} max={100} /></p>
        <p>Target: <input type="range" value={Math.round(target)} min={0} max={100} /></p>
      </div>
  }
}

function Counters() {
  // demonstrate independent states
  return <div>
    <Counter name="counter a" />
    <Counter name="counter b" />
    </div>
}
function Source() {
  // demonstrate ability to switch sources
  return <SourceSwitching 
          left={<Timer ms={1000}/>} 
          right={<Counter name="counter a" />}
        />
}

class SourceSwitching extends Component {
  initialState = true
  toggle = createHandler()
  source($) {
    const source = this.toggle.$
    const reducer = x => !x
    return {source, reducer}
  }
  render(state, stateMap) {
    return <div>
        <button onClick={this.toggle}>Toggle</button>
        {
          state ? this.props.left : this.props.right
        }
      </div>
  }
}

```

# Local development

`yarn run build` and then `npm publish` (but its under my namespace @swyx/reactive-react cos someone else has the generic one)