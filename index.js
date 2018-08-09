/** @jsx createElement */
import {mount, createElement, Component, createHandler} from './reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from './reactive-react/swyxjs'
import Observable from 'zen-observable'


function App() {
  return <Counter name="Counter Count:"/>
  // return <Counters/>
  // return <Timer />
  // return <Blink ms={500} />
  // return <CrappyBird />
  // return <Source />
}

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

class Timer extends Component {
  // demonstrate interval time
  initialState = 0
  source($) {
    const source = Interval(this.props.ms) // tick every second
    const reducer = x => x + 1 // count up
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
  // merging time and coutner
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
          // left={<Counter name="counter b" />} 
          left={<Timer ms={1000}/>} 
          right={<Counter name="counter a" />}
        />
}

mount(<App />, document.getElementById('app'))
