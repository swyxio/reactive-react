/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../reactive-react/swyxjs'
import Observable from 'zen-observable'

import {Timer, Blink, Counter, Counters, CrappyBird, Source, SourceSwitching} from './components'
// import {Counter} from './components'

import './eleventy.css'
import './custom.css'

class App extends Component {
  initialState = 'counter'
  router = createHandler(e => e.target.name)
  source() {
    return {source: this.router.$}
  }
  render(state) {
    const NavLi = ({pageName}) => (
      <li>
        <button name={pageName} onClick={this.router}>{pageName}</button>
      </li>
    )
    return <div className="container">
              <header>
                <ul className="nav">
                        <NavLi pageName="counter"/>
                        <NavLi pageName="timer"/>
                    </ul>
                    <h5>reactive-react</h5>
                    <p class="subtitle">{state}</p>
              </header>
              {/* <h2>This site is a starting point</h2>
              <p>From this point we should already have:</p> */}
              <Counter name="Counter Count:"/>
              <Timer />
            </div>
  }
  // return <Counter name="Counter Count:"/>
  // return <Counters/>
  // return <Timer />
  // return <Blink ms={500} />
  // return <CrappyBird />
  // return <Source />
}


mount(<App />, document.getElementById('app'))
