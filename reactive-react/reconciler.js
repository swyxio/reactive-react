import Observable from 'zen-observable'
import {fromEvent, scan, merge, startWith, switchLatest} from './swyxjs'
// import { updateDomProperties } from "./updateProperties";
import { TEXT_ELEMENT } from "./element";
import { createPublicInstance } from "./component";
var h = require('virtual-dom/h');
// var VNode = require("virtual-dom/vnode/vnode")
var VText = require("virtual-dom/vnode/vtext")

const circuitBreakerflag = true // set true to enable debugger in infinite loops
let circuitBreaker = -1000
// traverse all children and collect a stream of all sources
// AND render. a bit of duplication, but we get persistent instances which is good
export function renderStream(element, instance, state, stateMap) {
  // this is a separate function because scope gets messy when being recursive
  let isNewStream = false // assume no stream switching by default
  // this is the first ping of data throughout the app
  let source = Observable.of(state) 
  const addToStream = _source => {
    // visit each source and merge with source
    if (_source) return source = merge(source, _source)
  }
  const markNewStream = () => isNewStream = true
  const newInstance = render(source, addToStream, markNewStream)(element, instance, state, stateMap)
  return {source, instance: newInstance, isNewStream}
}

/** core render logic */
export function render(source, addToStream, markNewStream) { // this is the nonrecursive part
  return function renderWithStream(element, instance, state, stateMap) { // recursive part
    let newInstance
    const { type, props } = element
  
    const isDomElement = typeof type === "string";
    if (circuitBreakerflag && circuitBreaker++ > 0) debugger
    const {children = [], ...rest} = props
    if (isDomElement) {
      const childInstances = children.map(
        (el, i) => {
          // ugly but necessary to allow functional children
          // mapping element's children to instance's childInstances
          const _childInstances = instance && (instance.childInstance || instance.childInstances[i])
          return renderWithStream(  // recursion
            el, 
            _childInstances, 
            state, 
            stateMap) 
        }
      );
      const childDoms = childInstances.map(childInstance => childInstance.dom);
      let lcaseProps = {}
      Object.entries(rest).forEach(([k, v]) => lcaseProps[formatProps(k)] = v)
      const dom = type === TEXT_ELEMENT
        ? new VText(props.nodeValue)
        : h(type, lcaseProps, childDoms); // equivalent of appendchild
      newInstance = { dom, element, childInstances };
    } else { // component element
      let publicInstance 
      // debugger
      if (instance && instance.publicInstance && instance.element.type === element.type) { // might have to do more diffing of props
        // just reuse old instance if it already exists
        publicInstance = instance && instance.publicInstance
      } else {
        // console.log(instance, element, instance && instance.element === element)
        // debugger
        markNewStream() // mark as dirty in parent scope; will rerender
        publicInstance = createPublicInstance(element);
      }
      let localState = stateMap.get(publicInstance)
      if (localState === undefined) localState = publicInstance.initialState
      publicInstance.state = localState // for access with this.state
      if (Object.keys(rest).length) publicInstance.props = rest // update with new props // TODO: potentially buggy
      // console.log({rest})
      if (publicInstance.source) {
        const src = publicInstance.source(source)
        // there are two forms of Component.source
        const src$ = src.reducer && publicInstance.initialState !== undefined ? 
            // 1. the reducer form
            scan(src.source, 
              src.reducer || ((_, x) => x), // default to noop reducer
              publicInstance.initialState) : 
            // 2. and raw stream form
            src
        addToStream(src$
          .map(event => {
            stateMap.set(publicInstance, event)
            return {instance: publicInstance, event} // tag it to the instance
          }) 
        );
      }
      const childElement = publicInstance.render ? 
          publicInstance.render(localState, stateMap) : 
          publicInstance;

      const childInstance = renderWithStream(childElement, instance && instance.childInstance, state, stateMap)
      const dom = childInstance.dom
      newInstance = { dom, element, childInstance, publicInstance }
    }
    return newInstance
  }
}

function formatProps(k) {
  if (k.startsWith('on')) return k.toLowerCase()
  return k
}