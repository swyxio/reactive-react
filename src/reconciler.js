import Observable from 'zen-observable'
import {fromEvent, scan, merge, startWith} from './swyxjs'
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

export const INITIALSOURCE = Symbol('initial source')

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
  let SoS = startWith(UIthread, Observable.from(source$)) // startWith's starter
  return SoS.subscribe(
    src$ => { // this is the current sourceStream we are working with
      if (currentSrc$) console.log('unsub!') || currentSrc$.unsubscribe() // unsub from old stream
      /**** main */
      try {
        console.group('SoS scan')
        const source$ = scan(
          src$, 
          ({instance, state}, nextState) => {
            const streamOutput = renderStream(rootElement, instance, nextState, state)
            console.log({nextState, streamOutput, isNewStream: streamOutput.isNewStream})
            if (streamOutput.isNewStream) { // quick check
              const nextSource$ = streamOutput.source$
              debugger
              emitter.emit(Observable.from(nextSource$)) // update the UI thread; source will switch
            } else {
              const nextinstance = streamOutput.instance
              patch(rootNode, diff(instance.dom, nextinstance.dom)) // render to screen
              return {instance: nextinstance, state: nextState}
            }
          },
          {INITIALSOURCE, instance} // accumulator
        )
        /**** end main */
        currentSrc$ = 
          source$
            // .map(x => console.log('hisdhis', x) || x)
            .subscribe()
      } finally {
        console.groupEnd('SoS scan')
      }
    }
  )
}

// traverse all children and collect a stream of all sources
// AND render. a bit of duplication, but we get persistent instances which is good
function renderStream(element, instance, state = INITIALSOURCE, prevState = INITIALSOURCE) {
  let isNewStream = 
    state !== prevState || 
    false // assume no stream switching by default
  // this is the first ping of data throughout the app
  let source$ = Observable.of(state) 
  const addToStream = source => {
    // visit each source and merge with source$
    console.log('adding ', source)
    if (source) return source$ = merge(source, source$)
  }
  /** core render logic */
  let newInstance
  const { type, props } = element
  const isDomElement = typeof type === "string";
  if (isDomElement) {
    const {children = [], ...rest} = props
    const childInstances = children.map(
      (el, i) => {
        // debugger
        return renderStream(
          el, 
          instance && instance.childInstance && instance.childInstance.childInstances && instance.childInstance.childInstances[i], 
          state, 
          prevState)  // recursion
          .instance
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
      isNewStream = true
      publicInstance = createPublicInstance(element);
    }
    const _state = state === INITIALSOURCE ? publicInstance.initialState : state
    const _prevState = prevState === INITIALSOURCE ? publicInstance.initialState : prevState
    if (publicInstance.source) {
      const src = publicInstance.source(source$)
      // there are two forms of source
      // 1. the reducer form
      if (src.reducer && publicInstance.initialState !== undefined) 
        try {
          console.group('addtoStreamscan')
          addToStream(scan(src.source$, src.reducer, publicInstance.initialState));
        } finally {
          console.groupEnd('addtoStreamscan')
        }
      // 2. and raw stream form
      else addToStream(src);
    }
    const childElement = publicInstance.render ? 
        publicInstance.render(_state, _prevState) : 
        publicInstance;
    const childInstance = renderStream(childElement, instance && instance.childInstance, state, prevState).instance;
    const dom = childInstance.dom
    newInstance = { dom, element, childInstance, publicInstance }
  }
  /** core render logic */
  return {source$, instance: newInstance, isNewStream}
}






/* obsolute render code, RIP */

// // traverse all children and hydrate it with state
// function render(element, instance, state, prevState) {
//   const { type, props } = element;
//   const isDomElement = typeof type === "string";
//   if (isDomElement) {
//     const {children = [], key, ...rest} = props
//     const childInstances = children.map(
//       (el, i) => {
//         // debugger
//         return render(el, instance && instance.childInstance && instance.childInstance.childInstances && instance.childInstance.childInstances[i], state, prevState)  // recursion
//       }
//     );
//     const childDoms = childInstances.map(childInstance => childInstance.dom);
//     let lcaseProps = {}
//     Object.entries(rest).forEach(([k, v]) => lcaseProps[k.toLowerCase()] = v)
//     const dom = type === TEXT_ELEMENT
//       ? new VText(props.nodeValue)
//       : h(type, lcaseProps, childDoms); // equivalent of appendchild
//       // : new VNode(type, rest, childDoms, key);
//     return { dom, element, childInstances }; // instance
//   } else {
//     // debugger
//     // const publicInstance = createPublicInstance(element); // element may change?
//     const publicInstance = instance.publicInstance
//     const _state = state === INITIALSOURCE ? publicInstance.initialState : state
//     const _prevState = prevState === INITIALSOURCE ? publicInstance.initialState : prevState
//     // debugger
//     const childElement = publicInstance.render ? publicInstance.render(_state, _prevState): publicInstance;
//     const childInstance = render(childElement, instance && instance.childInstance, state, prevState);
//     const dom = childInstance.dom
//     return { dom, element, childInstance, publicInstance } // instance
//   }
// }