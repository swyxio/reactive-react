import Observable from 'zen-observable'
import {fromEvent, scan, merge} from './swyxjs'
import { updateDomProperties } from "./updateProperties";
import { TEXT_ELEMENT } from "./element";
import { createPublicInstance } from "./component";
var h = require('virtual-dom/h');
var VNode = require("virtual-dom/vnode/vnode")
var VText = require("virtual-dom/vnode/vtext")
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

export const INITIALSOURCE = Symbol('initial source')

// mount the vdom on to the dom and 
// set up the runtime from sources and
// patch the vdom
// ---
// returns an unsubscribe method you can use to unmount
export function mount(element, container) {
  const {source$, initInstance} = constructStream(element)
  const rootNode = createElement(initInstance.dom)
  container.appendChild(rootNode) // initial mount
  return scan(
    source$, 
    ({instance, state}, nextState) => {
        console.log({state})
        const nextinstance = render(element, instance, nextState, state)
        patch(rootNode, diff(instance.dom, nextinstance.dom)) // render to screen
        return {instance: nextinstance, state: nextState}
    }
    ,{instance: initInstance, state: INITIALSOURCE}
  ).subscribe()
}

// traverse all children and hydrate it with state
function render(element, instance, state, prevState) {
  const { type, props } = element;
  const isDomElement = typeof type === "string";
  if (isDomElement) {
    const {children = [], key, ...rest} = props
    const childInstances = children.map(
      (el, i) => {
        // debugger
        return render(el, instance.childInstance && instance.childInstance.childInstances && instance.childInstance.childInstances[i], state, prevState)  // recursion
      }
    );
    const childDoms = childInstances.map(childInstance => childInstance.dom);
    const dom = type === TEXT_ELEMENT
      ? new VText(props.nodeValue)
      : h(type, rest, childDoms); // equivalent of appendchild
      // : new VNode(type, rest, childDoms, key);
    return { dom, element, childInstances }; // instance
  } else {
    // debugger
    // const publicInstance = createPublicInstance(element); // element may change?
    const publicInstance = instance.publicInstance
    const childElement = publicInstance.render ? publicInstance.render(state, prevState): publicInstance;
    const childInstance = render(childElement, instance, state, prevState);
    const dom = childInstance.dom
    return { dom, element, childInstance, publicInstance } // instance
  }
}

// traverse all children and collect a stream of all sources
// AND render. a bit of duplication, but we get persistent instances which is good
function constructStream(rootEl) {
  // this is the first ping of data throughout the app
  let source$ = Observable.of(INITIALSOURCE) 
  const addToStream = source => {
    // visit each source and merge with source$
    if (source) return source$ = merge(source, source$)
  }
  const initInstance = instantiate(source$, addToStream)(rootEl)
  return {source$, initInstance}
}

function instantiate(source$, addToStream) {
  return function instantiateWithStream(element){
    const { type, props } = element
    const isDomElement = typeof type === "string";
    if (isDomElement) {
      const {children = [], ...rest} = props
      const childInstances = children.map(instantiateWithStream);
      const childDoms = childInstances.map(childInstance => childInstance.dom);
      const dom = type === TEXT_ELEMENT
        ? new VText(props.nodeValue)
        : h(type, rest, childDoms); // equivalent of appendchild
        // : new VNode(type, rest, childDoms, key); // equivalent of appendchild

      // ******
      // updateDomProperties(dom, [], props); // TODO: add event listeners
      // ******
      const instance = { dom, element, childInstances };
      return instance;

    } else {
      // component element
      const publicInstance = createPublicInstance(element);
      // console.log({publicInstance, element})
      if (publicInstance.source)
      addToStream(publicInstance.source(source$)); // extra
      const childElement = publicInstance.render ? publicInstance.render(INITIALSOURCE) : publicInstance;
      const childInstance = instantiateWithStream(childElement);
      const dom = childInstance.dom
      const instance = { dom, element, childInstance, publicInstance }
      // debugger
      return instance
    }
  }
}
