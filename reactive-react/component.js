// import { reconcile } from "./reconciler";
import {Interval, scan, startWith, merge, mapToConstant} from './swyxjs'

export class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  // setState(partialState) {
  //   this.state = Object.assign({}, this.state, partialState);
  //   updateInstance(this.__internalInstance);
  // }

  // class method because it feeds in this.initialState
  combineReducer(obj) {
    const sources = Object.entries(obj).map(([k,fn]) => {
      let subReducer = fn(obj)
      // there are two forms of return the subreducer can have
      // straight stream form
      // or object form where we need to scan it into string
      if (subReducer.source) { // object form
        subReducer = scan(subReducer.source, 
          subReducer.reducer || ((_, n) => n), 
          this.initialState[k]
        )
      }
      return subReducer
        .map(x => ({[k]: x})) // map to its particular namespace
    })
    const source = merge(...sources)
    const reducer = (acc, n) => ({...acc, ...n})
    return {source, reducer}
  }
}

// function updateInstance(internalInstance) {
//   const parentDom = internalInstance.dom.parentNode;
//   const element = internalInstance.element;
//   reconcile(parentDom, internalInstance, element);
// }

export function createPublicInstance(element/*, internalInstance*/) {
  const { type, props } = element;
  const publicInstance = new type(props);
  // publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}
