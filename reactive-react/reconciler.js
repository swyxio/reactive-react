import Observable from 'zen-observable'
import {fromEvent, scan, merge, startWith, switchLatest} from './swyxjs'
import { updateDomProperties } from "./updateProperties";
import { TEXT_ELEMENT } from "./element";
import { createPublicInstance } from "./component";
import { createChangeEmitter } from 'change-emitter'

var h = require('virtual-dom/h');
var VNode = require("virtual-dom/vnode/vnode")
var VText = require("virtual-dom/vnode/vtext")
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

export const stateMap = new Map()
// let circuitBreaker = -20

const emitter = createChangeEmitter()
// single UI thread; this is the observable that sticks around and swaps out source$
const UIthread = new Observable(observer => {
  emitter.listen(x => {
    debugger // success! thread switching!
    observer.next(x)
  })
})
// mount the vdom on to the dom and 
// set up the runtime from sources and
// patch the vdom
// ---
// returns an unsubscribe method you can use to unmount
export function mount(rootElement, container) {
  // initial, throwaway-ish frame
  let {source$, instance} = renderStream(rootElement, {})
  const rootNode = createElement(instance.dom)
  container.appendChild(rootNode) // initial mount
  let currentSrc$ = null
  let SoS = startWith(UIthread, source$) // stream of streams
  return SoS.subscribe(
    src$ => { // this is the current sourceStream we are working with
      if (currentSrc$) console.log('unsub!') || currentSrc$.unsubscribe() // unsub from old stream
      /**** main */
      const source2$ = scan(
        src$, 
        ({instance, stateMap}, nextState) => {
          const streamOutput = renderStream(rootElement, instance, nextState, stateMap)
          // console.log({nextState, streamOutput, isNewStream: streamOutput.isNewStream})
          if (streamOutput.isNewStream) { // quick check
            const nextSource$ = streamOutput.source$
            debugger
            emitter.emit(nextSource$) // update the UI thread; source will switch
          } else {
            const nextinstance = streamOutput.instance
            patch(rootNode, diff(instance.dom, nextinstance.dom)) // render to screen
            return {instance: nextinstance, state: nextState}
          }
        },
        {stateMap, instance} // accumulator
      )
      /**** end main */
      // debugger
      currentSrc$ = 
        source2$
          .subscribe()
    }
  )
}

// traverse all children and collect a stream of all sources
// AND render. a bit of duplication, but we get persistent instances which is good
function renderStream(element, instance, state, prevState) {
  // this is a separate function because scope gets messy when being recursive
  let isNewStream = false // assume no stream switching by default
  // this is the first ping of data throughout the app
  let source$ = Observable.of(state) 
  const addToStream = source => {
    // visit each source and merge with source$
    if (source) return source$ = merge(source, source$)
  }
  const markNewStream = () => isNewStream = true
  const newInstance = render(source$, addToStream, markNewStream)(element, instance, state, prevState)
  return {source$, instance: newInstance, isNewStream}
}

/** core render logic */
function render(source$, addToStream, markNewStream) {
  return function renderWithStream(element, instance, state, prevState) {
    let newInstance
    const { type, props } = element
    const isDomElement = typeof type === "string";
    if (isDomElement) {
      const {children = [], ...rest} = props
      const childInstances = children.map(
        (el, i) => {
          // debugger
          // if (circuitBreaker++ > 0) debugger
          return renderWithStream(
            el, 
            instance && instance.childInstance && instance.childInstance.childInstances && instance.childInstance.childInstances[i], 
            state, 
            prevState)  // recursion
        }
      );
      const childDoms = childInstances.map(childInstance => childInstance.dom);
      let lcaseProps = {}
      Object.entries(rest).forEach(([k, v]) => lcaseProps[k.toLowerCase()] = v)
      const dom = type === TEXT_ELEMENT
        ? new VText(props.nodeValue)
        : h(type, lcaseProps, childDoms); // equivalent of appendchild
      newInstance = { dom, element, childInstances };
    } else { // component element
      let publicInstance 
      if (instance && instance.publicInstance) { // might have to do more diffing of props
        // just reuse old instance if it already exists
        publicInstance = instance && instance.publicInstance
      } else {
        // debugger
        markNewStream()
        publicInstance = createPublicInstance(element);
      }
      const _state = state === INITIALSOURCE ? publicInstance.initialState : state
      const _prevState = prevState === INITIALSOURCE ? publicInstance.initialState : prevState
      if (publicInstance.source) {
        const src = publicInstance.source(source$)
        // there are two forms of Component.source
        // 1. the reducer form
        if (src.reducer && publicInstance.initialState !== undefined)  {
          addToStream(scan(src.source$, src.reducer, publicInstance.initialState))
        } else { // 2. and raw stream form
          addToStream(src);
        }
      }
      const childElement = publicInstance.render ? 
          publicInstance.render(_state, _prevState) : 
          publicInstance;
      // if (circuitBreaker++ > 0) debugger
      const childInstance = renderWithStream(childElement, instance && instance.childInstance, state, prevState)
      const dom = childInstance.dom
      newInstance = { dom, element, childInstance, publicInstance }
    }
    return newInstance
  }
}
