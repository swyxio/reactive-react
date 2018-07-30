/** @jsx createElement */
import {mount, createElement, Component, INITIALSOURCE} from './src/creat'
import {Ticker, scan} from './src/swyxjs'
import Observable from 'zen-observable'

class App extends Component {
  source($) {
    return scan(
      Ticker(), // tick every second
      x => x+1, // count up
      0         // from zero
    )
  }
  render(state, prevState) {
    const elapsed = state === INITIALSOURCE ? 0 : state
    return <div> number of seconds elapsed: {elapsed} </div>
  }
}

mount(<App />, document.getElementById('app'))
