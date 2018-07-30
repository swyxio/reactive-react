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
  const source$ = constructStream(element)
  const initvDOM = render(element)
  const rootNode = createElement(initvDOM)
  container.appendChild(rootNode)
  return scan(
    source$, 
    ({vDOM, state}, nextState) => {
        const nextvDOM = render(element, nextState, state)
        patch(rootNode, diff(vDOM, nextvDOM)) // side effect
        return {vDOM: nextvDOM, state: nextState}
    },
    {vDOM: initvDOM, state: INITIALSOURCE}
  ).subscribe()
}

// traverse all children and hydrate it with state
function render(element, state, prevState) {
  const { type, props } = element;
  const isDomElement = typeof type === "string";
  if (isDomElement) {
    const {children = [], key, ...rest} = props
    const childDoms = children.map(
      el => render(el, state, prevState)  // recursion
    );
    const isTextElement = type === TEXT_ELEMENT;
    const dom = isTextElement
      ? new VText(props.nodeValue)
      : new VNode(type, rest, childDoms, key);
    return dom;
  } else {
    const instance = {};
    const publicInstance = createPublicInstance(element, instance);
    const childElement = publicInstance.render(state, prevState);
    const dom = render(childElement, state, prevState);
    return dom;
  }
}

// traverse all children and collect a stream of all sources
// this means you cant hot swap streams for now which is impt for a real app
function constructStream(rootEl) {
  // this is the first ping of data throughout the app
  let source$ = Observable.of(INITIALSOURCE) 
  traverse(source$, source => {
    // visit each source and merge with source$
    if (source) return source$ = merge(source, source$)
  })(rootEl)
  return source$
  /* alternate approach abandoned for now */
  // // this is the first ping of data throughout the app
  // let data$ = Observable.of(INITIALSOURCE) 
  // // start with null view
  // let view$ = Observable.of(null) 
  // return {data$, view$}
}

function traverse(source$, addToStream) {
  return function traverseWithStream(element){
    const { type, props } = element;
    const isDomElement = typeof type === "string";
  
    if (isDomElement) {
      // updateDomProperties(dom, [], props); // TODO: add event listeners
      const childElements = props.children || [];
      childElements.map(traverseWithStream); // recursion
    } else {
      // Instantiate component element
      const instance = {};
      const publicInstance = createPublicInstance(element, instance);
      addToStream(publicInstance.source(source$));
      const childElement = publicInstance.render();
      traverseWithStream(childElement);
    }
  }
}
