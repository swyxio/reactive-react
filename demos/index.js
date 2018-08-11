/** @jsx createElement */
import {mount, createElement, Component, createHandler} from '../reactive-react'
import {Interval, scan, startWith, merge, mapToConstant} from '../reactive-react/swyxjs'
import Observable from 'zen-observable'

import {Timer, Blink, Counter, Counters, CrappyBird, Source, SourceSwitching} from './components'
// import {Counter} from './components'

import './eleventy.css'
import './custom.css'


function App() {
  return <Source />
}

// class App extends Component {
//   initialState = "counter"
//   router = createHandler(e => e.target.name)
//   source($) {
//     return this.router.$
//   }
//   render(state) {
//     // const Display = {
//     //   'counter': () => <Counter name="Counter Count:"/>,
//     //   'timer': () => <Timer />,
//     //   'blink': () => <Blink ms={500} />,
//     //   'crappy': () => <CrappyBird />,
//     // }[state]
//     return <div className="container">
//               <header>
//                 <ul className="nav">
//                     <li><a href="#" name="counter" onClick={this.router}>Counter
//                       <small>Data stream</small>
//                     </a></li>
//                     <li><a href="#" name="timer" onClick={this.router}>Timer
//                       <small>Time stream</small>
//                     </a></li>
//                     <li><a href="#" name="blink" onClick={this.router}>Blink
//                       <small>Time stream</small>
//                     </a></li>
//                     <li><a href="#" name="crappy" onClick={this.router}>Crappy Bird
//                       <small>Data + Time</small>
//                     </a></li>
//                 </ul>
//                 <h5>reactive-react</h5>
//                 <p class="subtitle">{state}</p>
//               </header>
//               {/* <Timer /> */}
//               <Counter name="Counter Count:"/>
//               {/* {state === 'timer' ? 
//               <Timer /> : 
//               <Counter name="Counter Count:"/>} */}
//             </div>
//   }
// }

mount(<App />, document.getElementById('app'))
