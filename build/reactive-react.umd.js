(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('zen-observable'), require('change-emitter'), require('zen-observable/extras'), require('virtual-dom/h'), require('virtual-dom/vnode/vtext'), require('virtual-dom/diff'), require('virtual-dom/patch'), require('virtual-dom/create-element')) :
	typeof define === 'function' && define.amd ? define(['exports', 'zen-observable', 'change-emitter', 'zen-observable/extras', 'virtual-dom/h', 'virtual-dom/vnode/vtext', 'virtual-dom/diff', 'virtual-dom/patch', 'virtual-dom/create-element'], factory) :
	(factory((global['reactive-react'] = global['reactive-react'] || {}),global.Observable,global.changeEmitter,global.zenObservable_extras,global.h,global.VText,global.diff,global.patch,global.createElement));
}(this, (function (exports,Observable,changeEmitter,zenObservable_extras,h,VText,diff,patch,createElement) { 'use strict';

Observable = 'default' in Observable ? Observable['default'] : Observable;
h = 'default' in h ? h['default'] : h;
VText = 'default' in VText ? VText['default'] : VText;
diff = 'default' in diff ? diff['default'] : diff;
patch = 'default' in patch ? patch['default'] : patch;
createElement = 'default' in createElement ? createElement['default'] : createElement;

var TEXT_ELEMENT = "TEXT ELEMENT";

function createElement$1(type, config) {
  var _ref;

  var props = Object.assign({}, config);

  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var hasChildren = args.length > 0;
  var rawChildren = hasChildren ? (_ref = []).concat.apply(_ref, args) : [];
  props.children = rawChildren.filter(function (c) {
    return c != null && c !== false;
  }).map(function (c) {
    return c instanceof Object ? c : createTextElement(c);
  });
  return { type: type, props: props };
}

function createTextElement(value) {
  return createElement$1(TEXT_ELEMENT, { nodeValue: value });
}

function createHandler(_fn) {
  var emitter = changeEmitter.createChangeEmitter();
  var handler = function handler(x) {
    emitter.emit(x);
  };
  handler.$ = new Observable(function (observer) {
    return emitter.listen(function (value) {
      observer.next(_fn ? _fn(value) : value);
    });
  });
  return handler;
}

var NOINIT = Symbol('NO_INITIAL_VALUE');
function scan(obs, cb) {
  var seed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : NOINIT;

  var sub = void 0,
      acc = seed,
      hasValue = false;
  var hasSeed = acc !== NOINIT;
  return new Observable(function (observer) {
    sub = obs.subscribe(function (value) {
      if (observer.closed) return;
      var first = !hasValue;
      hasValue = true;
      if (!first || hasSeed) {
        try {
          acc = cb(acc, value);
        } catch (e) {
          return observer.error(e);
        }
        observer.next(acc);
      } else {
        acc = value;
      }
    });
    return sub;
  });
}

// Flatten a collection of observables and only output the newest from each




function startWith(obs, val) {
  return new Observable(function (observer) {
    observer.next(val); // immediately output this value
    var handler = obs.subscribe(function (x) {
      return observer.next(x);
    });
    return function () {
      return handler();
    };
  });
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import { reconcile } from "./reconciler";
var Component = function () {
  function Component(props) {
    _classCallCheck(this, Component);

    this.props = props;
    this.state = this.state || {};
  }

  // setState(partialState) {
  //   this.state = Object.assign({}, this.state, partialState);
  //   updateInstance(this.__internalInstance);
  // }

  // class method because it feeds in this.initialState


  _createClass(Component, [{
    key: 'combineReducer',
    value: function combineReducer(obj) {
      var _this = this;

      var sources = Object.entries(obj).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            fn = _ref2[1];

        var subReducer = fn(obj);
        // there are two forms of return the subreducer can have
        // straight stream form
        // or object form where we need to scan it into string
        if (subReducer.source && subReducer.reducer) {
          // object form
          subReducer = scan(subReducer.source, subReducer.reducer || function (_, n) {
            return n;
          }, _this.initialState[k]);
        }
        return subReducer.map(function (x) {
          return _defineProperty({}, k, x);
        }); // map to its particular namespace
      });
      var source = zenObservable_extras.merge.apply(undefined, _toConsumableArray(sources));
      var reducer = function reducer(acc, n) {
        return _extends({}, acc, n);
      };
      return { source: source, reducer: reducer };
    }
  }]);

  return Component;
}();

// function updateInstance(internalInstance) {
//   const parentDom = internalInstance.dom.parentNode;
//   const element = internalInstance.element;
//   reconcile(parentDom, internalInstance, element);
// }

function createPublicInstance(element /*, internalInstance*/) {
  var type = element.type,
      props = element.props;

  var publicInstance = new type(props);
  // publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}

var _slicedToArray$1 = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// import { updateDomProperties } from "./updateProperties";
// import VNode from "virtual-dom/vnode/vnode"
// const circuitBreakerflag = false // set true to enable debugger in infinite loops
// let circuitBreaker = -50
// traverse all children and collect a stream of all sources
// AND render. a bit of duplication, but we get persistent instances which is good
function renderStream(element, instance, state, stateMap) {
  // this is a separate function because scope gets messy when being recursive
  var isNewStream = false; // assume no stream switching by default
  // this is the first ping of data throughout the app
  var source = Observable.of(state);
  var addToStream = function addToStream(_source) {
    // visit each source and merge with source
    if (_source) return source = zenObservable_extras.merge(source, _source);
  };
  var markNewStream = function markNewStream() {
    return isNewStream = true;
  };
  var newInstance = render(source, addToStream, markNewStream)(element, instance, state, stateMap);
  return { source: source, instance: newInstance, isNewStream: isNewStream };
}

/** core render logic */
function render(source, addToStream, markNewStream) {
  // this is the nonrecursive part
  return function renderWithStream(element, instance, state, stateMap) {
    // recursive part
    var newInstance = void 0;
    var type = element.type,
        props = element.props;


    var isDomElement = typeof type === "string";
    // if (circuitBreakerflag && circuitBreaker++ > 0) debugger

    var _props$children = props.children,
        children = _props$children === undefined ? [] : _props$children,
        rest = _objectWithoutProperties(props, ['children']);

    if (isDomElement) {
      var childInstances = children.map(function (el, i) {
        // ugly but necessary to allow functional children
        // mapping element's children to instance's childInstances
        var _childInstances = instance && (instance.childInstance || instance.childInstances[i]);
        return renderWithStream( // recursion
        el, _childInstances, state, stateMap);
      });
      var childDoms = childInstances.map(function (childInstance) {
        return childInstance.dom;
      });
      var lcaseProps = {};
      Object.entries(rest).forEach(function (_ref) {
        var _ref2 = _slicedToArray$1(_ref, 2),
            k = _ref2[0],
            v = _ref2[1];

        return lcaseProps[formatProps(k)] = v;
      });
      var dom = type === TEXT_ELEMENT ? new VText(props.nodeValue) : h(type, lcaseProps, childDoms); // equivalent of appendchild
      newInstance = { dom: dom, element: element, childInstances: childInstances };
    } else {
      // component element
      var publicInstance = void 0;
      // debugger
      if (instance && instance.publicInstance && instance.element === element) {
        // might have to do more diffing of props
        // just reuse old instance if it already exists
        publicInstance = instance && instance.publicInstance;
      } else {
        markNewStream(); // mark as dirty in parent scope; will rerender
        publicInstance = createPublicInstance(element);
      }
      var localState = stateMap.get(publicInstance);
      if (localState === undefined) localState = publicInstance.initialState;
      publicInstance.state = localState; // for access with this.state
      if (Object.keys(rest).length) publicInstance.props = rest; // update with new props // TODO: potentially buggy
      // console.log({rest})
      if (publicInstance.source) {
        var src = publicInstance.source(source);
        // there are two forms of Component.source
        var src$ = src.reducer && publicInstance.initialState !== undefined ?
        // 1. the reducer form
        scan(src.source, src.reducer, publicInstance.initialState) :
        // 2. and raw stream form
        src;
        addToStream(src$.map(function (event) {
          stateMap.set(publicInstance, event);
          return { instance: publicInstance, event: event // tag it to the instance
          };
        }));
      }
      var childElement = publicInstance.render ? publicInstance.render(localState, stateMap) : publicInstance;

      var childInstance = renderWithStream(childElement, instance && instance.childInstance, state, stateMap);
      var _dom = childInstance.dom;
      newInstance = { dom: _dom, element: element, childInstance: childInstance, publicInstance: publicInstance };
    }
    return newInstance;
  };
}

function formatProps(k) {
  if (k.startsWith('on')) return k.toLowerCase();
  return k;
}

var stateMapPointer = new Map();

var emitter = changeEmitter.createChangeEmitter();
// single UI thread; this is the observable that sticks around and swaps out source
var UIthread = new Observable(function (observer) {
  emitter.listen(function (x) {
    // debugger // success! thread switching!
    observer.next(x);
  });
});
// mount the vdom on to the dom and 
// set up the runtime from sources and
// patch the vdom
// ---
// returns an unsubscribe method you can use to unmount
function mount(rootElement, container) {
  // initial, throwaway-ish frame
  var _renderStream = renderStream(rootElement, {}, undefined, stateMapPointer),
      source = _renderStream.source,
      instance = _renderStream.instance;

  var instancePointer = instance;
  var rootNode = createElement(instance.dom);
  var containerChild = container.firstElementChild;
  if (containerChild) {
    container.replaceChild(rootNode, containerChild); // hot reloaded mount
  } else {
    container.appendChild(rootNode); // initial mount
  }
  var currentSrc$ = null;
  var SoS = startWith(UIthread, source); // stream of streams
  return SoS.subscribe(function (src$) {
    // this is the current sourceStream we are working with
    if (currentSrc$) console.log('unsub!') || currentSrc$.unsubscribe(); // unsub from old stream
    /**** main */
    var source2$ = scan(src$, function (_ref, nextState) {
      var instance = _ref.instance,
          stateMap = _ref.stateMap;

      var streamOutput = renderStream(rootElement, instance, nextState, stateMap);
      if (streamOutput.isNewStream) {
        // quick check
        var nextSource$ = streamOutput.source;
        // debugger
        instancePointer = streamOutput.instance;
        patch(rootNode, diff(instance.dom, instancePointer.dom)); // render to screen
        emitter.emit(nextSource$); // update the UI thread; source will switch
      } else {
        var nextinstance = streamOutput.instance;
        patch(rootNode, diff(instance.dom, nextinstance.dom)); // render to screen
        return { instance: nextinstance, stateMap: stateMap };
      }
    }, { instance: instancePointer, stateMap: stateMapPointer // accumulator
    });
    /**** end main */
    currentSrc$ = source2$.subscribe();
  });
}

var index = {
  renderStream: renderStream,
  createElement: createElement$1,
  createHandler: createHandler,
  Component: Component,
  mount: mount
};

exports['default'] = index;
exports.createElement = createElement$1;
exports.createHandler = createHandler;
exports.Component = Component;
exports.renderStream = renderStream;
exports.mount = mount;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3RpdmUtcmVhY3QudW1kLmpzIiwic291cmNlcyI6WyIuLi9yZWFjdGl2ZS1yZWFjdC9lbGVtZW50LmpzIiwiLi4vcmVhY3RpdmUtcmVhY3Qvc3d5eGpzLmpzIiwiLi4vcmVhY3RpdmUtcmVhY3QvY29tcG9uZW50LmpzIiwiLi4vcmVhY3RpdmUtcmVhY3QvcmVjb25jaWxlci5qcyIsIi4uL3JlYWN0aXZlLXJlYWN0L3NjaGVkdWxlci5qcyIsIi4uL3JlYWN0aXZlLXJlYWN0L2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPYnNlcnZhYmxlIGZyb20gJ3plbi1vYnNlcnZhYmxlJ1xuaW1wb3J0IHsgY3JlYXRlQ2hhbmdlRW1pdHRlciB9IGZyb20gJ2NoYW5nZS1lbWl0dGVyJ1xuXG5leHBvcnQgY29uc3QgVEVYVF9FTEVNRU5UID0gXCJURVhUIEVMRU1FTlRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodHlwZSwgY29uZmlnLCAuLi5hcmdzKSB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnKTtcbiAgY29uc3QgaGFzQ2hpbGRyZW4gPSBhcmdzLmxlbmd0aCA+IDA7XG4gIGNvbnN0IHJhd0NoaWxkcmVuID0gaGFzQ2hpbGRyZW4gPyBbXS5jb25jYXQoLi4uYXJncykgOiBbXTtcbiAgcHJvcHMuY2hpbGRyZW4gPSByYXdDaGlsZHJlblxuICAgIC5maWx0ZXIoYyA9PiBjICE9IG51bGwgJiYgYyAhPT0gZmFsc2UpXG4gICAgLm1hcChjID0+IGMgaW5zdGFuY2VvZiBPYmplY3QgPyBjIDogY3JlYXRlVGV4dEVsZW1lbnQoYykpO1xuICByZXR1cm4geyB0eXBlLCBwcm9wcyB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0RWxlbWVudCh2YWx1ZSkge1xuICByZXR1cm4gY3JlYXRlRWxlbWVudChURVhUX0VMRU1FTlQsIHsgbm9kZVZhbHVlOiB2YWx1ZSB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhhbmRsZXIoX2ZuKSB7XG4gIGNvbnN0IGVtaXR0ZXIgPSBjcmVhdGVDaGFuZ2VFbWl0dGVyKClcbiAgbGV0IGhhbmRsZXIgPSB4ID0+IHtcbiAgICBlbWl0dGVyLmVtaXQoeClcbiAgfVxuICBoYW5kbGVyLiQgPSBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuKHZhbHVlID0+IHtcbiAgICAgIG9ic2VydmVyLm5leHQoX2ZuID8gX2ZuKHZhbHVlKSA6IHZhbHVlKVxuICAgIH1cbiAgICApXG4gIH0pXG4gIHJldHVybiBoYW5kbGVyXG59IiwiaW1wb3J0IE9ic2VydmFibGUgZnJvbSAnemVuLW9ic2VydmFibGUnXG5leHBvcnQgeyBtZXJnZSwgY29tYmluZUxhdGVzdCwgemlwIH0gZnJvbSAnemVuLW9ic2VydmFibGUvZXh0cmFzJ1xuXG5leHBvcnQgZnVuY3Rpb24gSW50ZXJ2YWwodGljayA9IDEwMDAsIHRpY2tEYXRhID0gU3ltYm9sKCd0aWNrJykpIHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBsZXQgdGltZXIgPSAoKSA9PiBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgdGlja0RhdGEgPT09ICdmdW5jdGlvbicpIHRpY2tEYXRhID0gdGlja0RhdGEoKVxuICAgICAgb2JzZXJ2ZXIubmV4dCh0aWNrRGF0YSk7XG4gICAgICB0aW1lcigpXG4gICAgICAvLyBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgIH0sIHRpY2spO1xuICAgIHRpbWVyKClcbiAgXG4gICAgLy8gT24gdW5zdWJzY3JpcHRpb24sIGNhbmNlbCB0aGUgdGltZXJcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZnJvbUV2ZW50KGVsLCBldmVudFR5cGUpIHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBjb25zdCBoYW5kbGVyID0gZSA9PiBvYnNlcnZlci5uZXh0KGUpXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGhhbmRsZXIpXG4gICAgLy8gb24gdW5zdWIsIHJlbW92ZSBldmVudCBsaXN0ZW5lclxuICAgIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlcilcbiAgfSlcbn1cblxuY29uc3QgTk9JTklUID0gU3ltYm9sKCdOT19JTklUSUFMX1ZBTFVFJylcbmV4cG9ydCBmdW5jdGlvbiBzY2FuKG9icywgY2IsIHNlZWQgPSBOT0lOSVQpIHtcbiAgbGV0IHN1YiwgYWNjID0gc2VlZCwgaGFzVmFsdWUgPSBmYWxzZVxuICBjb25zdCBoYXNTZWVkID0gYWNjICE9PSBOT0lOSVRcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBzdWIgPSBvYnMuc3Vic2NyaWJlKHZhbHVlID0+IHtcbiAgICAgIGlmIChvYnNlcnZlci5jbG9zZWQpIHJldHVyblxuICAgICAgbGV0IGZpcnN0ID0gIWhhc1ZhbHVlO1xuICAgICAgaGFzVmFsdWUgPSB0cnVlXG4gICAgICBpZiAoIWZpcnN0IHx8IGhhc1NlZWQgKSB7XG4gICAgICAgIHRyeSB7IGFjYyA9IGNiKGFjYywgdmFsdWUpIH1cbiAgICAgICAgY2F0Y2ggKGUpIHsgcmV0dXJuIG9ic2VydmVyLmVycm9yKGUpIH1cbiAgICAgICAgb2JzZXJ2ZXIubmV4dChhY2MpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFjYyA9IHZhbHVlXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gc3ViXG4gIH0pXG59XG5cbi8vIEZsYXR0ZW4gYSBjb2xsZWN0aW9uIG9mIG9ic2VydmFibGVzIGFuZCBvbmx5IG91dHB1dCB0aGUgbmV3ZXN0IGZyb20gZWFjaFxuZXhwb3J0IGZ1bmN0aW9uIHN3aXRjaExhdGVzdChoaWdoZXJPYnNlcnZhYmxlKSB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgbGV0IGN1cnJlbnRPYnMgPSBudWxsXG4gICAgcmV0dXJuIGhpZ2hlck9ic2VydmFibGUuc3Vic2NyaWJlKHtcbiAgICAgIG5leHQob2JzKSB7XG4gICAgICAgIGlmIChjdXJyZW50T2JzKSBjdXJyZW50T2JzLnVuc3Vic2NyaWJlKCkgLy8gdW5zdWIgYW5kIHN3aXRjaFxuICAgICAgICBjdXJyZW50T2JzID0gb2JzLnN1YnNjcmliZShvYnNlcnZlci5zdWJzY3JpYmUpXG4gICAgICB9LFxuICAgICAgZXJyb3IoZSkge1xuICAgICAgICBvYnNlcnZlci5lcnJvcihlKSAvLyB1bnRlc3RlZFxuICAgICAgfSxcbiAgICAgIGNvbXBsZXRlKCkge1xuICAgICAgICAvLyBpIGRvbnQgdGhpbmsgaXQgc2hvdWxkIGNvbXBsZXRlP1xuICAgICAgICAvLyBvYnNlcnZlci5jb21wbGV0ZSgpXG4gICAgICB9XG4gICAgfSlcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBUb0NvbnN0YW50KG9icywgdmFsKSB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgY29uc3QgaGFuZGxlciA9IG9icy5zdWJzY3JpYmUoKCkgPT4gb2JzZXJ2ZXIubmV4dCh2YWwpKVxuICAgIHJldHVybiBoYW5kbGVyXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFdpdGgob2JzLCB2YWwpIHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBvYnNlcnZlci5uZXh0KHZhbCkgLy8gaW1tZWRpYXRlbHkgb3V0cHV0IHRoaXMgdmFsdWVcbiAgICBjb25zdCBoYW5kbGVyID0gb2JzLnN1YnNjcmliZSh4ID0+IG9ic2VydmVyLm5leHQoeCkpXG4gICAgcmV0dXJuICgpID0+IGhhbmRsZXIoKVxuICB9KVxufSIsIi8vIGltcG9ydCB7IHJlY29uY2lsZSB9IGZyb20gXCIuL3JlY29uY2lsZXJcIjtcbmltcG9ydCB7SW50ZXJ2YWwsIHNjYW4sIHN0YXJ0V2l0aCwgbWVyZ2UsIG1hcFRvQ29uc3RhbnR9IGZyb20gJy4vc3d5eGpzJ1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUgfHwge307XG4gIH1cblxuICAvLyBzZXRTdGF0ZShwYXJ0aWFsU3RhdGUpIHtcbiAgLy8gICB0aGlzLnN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdGF0ZSwgcGFydGlhbFN0YXRlKTtcbiAgLy8gICB1cGRhdGVJbnN0YW5jZSh0aGlzLl9faW50ZXJuYWxJbnN0YW5jZSk7XG4gIC8vIH1cblxuICAvLyBjbGFzcyBtZXRob2QgYmVjYXVzZSBpdCBmZWVkcyBpbiB0aGlzLmluaXRpYWxTdGF0ZVxuICBjb21iaW5lUmVkdWNlcihvYmopIHtcbiAgICBjb25zdCBzb3VyY2VzID0gT2JqZWN0LmVudHJpZXMob2JqKS5tYXAoKFtrLGZuXSkgPT4ge1xuICAgICAgbGV0IHN1YlJlZHVjZXIgPSBmbihvYmopXG4gICAgICAvLyB0aGVyZSBhcmUgdHdvIGZvcm1zIG9mIHJldHVybiB0aGUgc3VicmVkdWNlciBjYW4gaGF2ZVxuICAgICAgLy8gc3RyYWlnaHQgc3RyZWFtIGZvcm1cbiAgICAgIC8vIG9yIG9iamVjdCBmb3JtIHdoZXJlIHdlIG5lZWQgdG8gc2NhbiBpdCBpbnRvIHN0cmluZ1xuICAgICAgaWYgKHN1YlJlZHVjZXIuc291cmNlICYmIHN1YlJlZHVjZXIucmVkdWNlcikgeyAvLyBvYmplY3QgZm9ybVxuICAgICAgICBzdWJSZWR1Y2VyID0gc2NhbihzdWJSZWR1Y2VyLnNvdXJjZSwgXG4gICAgICAgICAgc3ViUmVkdWNlci5yZWR1Y2VyIHx8ICgoXywgbikgPT4gbiksIFxuICAgICAgICAgIHRoaXMuaW5pdGlhbFN0YXRlW2tdXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdWJSZWR1Y2VyXG4gICAgICAgIC5tYXAoeCA9PiAoe1trXTogeH0pKSAvLyBtYXAgdG8gaXRzIHBhcnRpY3VsYXIgbmFtZXNwYWNlXG4gICAgfSlcbiAgICBjb25zdCBzb3VyY2UgPSBtZXJnZSguLi5zb3VyY2VzKVxuICAgIGNvbnN0IHJlZHVjZXIgPSAoYWNjLCBuKSA9PiAoey4uLmFjYywgLi4ubn0pXG4gICAgcmV0dXJuIHtzb3VyY2UsIHJlZHVjZXJ9XG4gIH1cbn1cblxuLy8gZnVuY3Rpb24gdXBkYXRlSW5zdGFuY2UoaW50ZXJuYWxJbnN0YW5jZSkge1xuLy8gICBjb25zdCBwYXJlbnREb20gPSBpbnRlcm5hbEluc3RhbmNlLmRvbS5wYXJlbnROb2RlO1xuLy8gICBjb25zdCBlbGVtZW50ID0gaW50ZXJuYWxJbnN0YW5jZS5lbGVtZW50O1xuLy8gICByZWNvbmNpbGUocGFyZW50RG9tLCBpbnRlcm5hbEluc3RhbmNlLCBlbGVtZW50KTtcbi8vIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVB1YmxpY0luc3RhbmNlKGVsZW1lbnQvKiwgaW50ZXJuYWxJbnN0YW5jZSovKSB7XG4gIGNvbnN0IHsgdHlwZSwgcHJvcHMgfSA9IGVsZW1lbnQ7XG4gIGNvbnN0IHB1YmxpY0luc3RhbmNlID0gbmV3IHR5cGUocHJvcHMpO1xuICAvLyBwdWJsaWNJbnN0YW5jZS5fX2ludGVybmFsSW5zdGFuY2UgPSBpbnRlcm5hbEluc3RhbmNlO1xuICByZXR1cm4gcHVibGljSW5zdGFuY2U7XG59XG4iLCJpbXBvcnQgT2JzZXJ2YWJsZSBmcm9tICd6ZW4tb2JzZXJ2YWJsZSdcbmltcG9ydCB7ZnJvbUV2ZW50LCBzY2FuLCBtZXJnZSwgc3RhcnRXaXRoLCBzd2l0Y2hMYXRlc3R9IGZyb20gJy4vc3d5eGpzJ1xuLy8gaW1wb3J0IHsgdXBkYXRlRG9tUHJvcGVydGllcyB9IGZyb20gXCIuL3VwZGF0ZVByb3BlcnRpZXNcIjtcbmltcG9ydCB7IFRFWFRfRUxFTUVOVCB9IGZyb20gXCIuL2VsZW1lbnRcIjtcbmltcG9ydCB7IGNyZWF0ZVB1YmxpY0luc3RhbmNlIH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XG5pbXBvcnQgaCBmcm9tICd2aXJ0dWFsLWRvbS9oJ1xuLy8gaW1wb3J0IFZOb2RlIGZyb20gXCJ2aXJ0dWFsLWRvbS92bm9kZS92bm9kZVwiXG5pbXBvcnQgVlRleHQgZnJvbSBcInZpcnR1YWwtZG9tL3Zub2RlL3Z0ZXh0XCJcblxuLy8gY29uc3QgY2lyY3VpdEJyZWFrZXJmbGFnID0gZmFsc2UgLy8gc2V0IHRydWUgdG8gZW5hYmxlIGRlYnVnZ2VyIGluIGluZmluaXRlIGxvb3BzXG4vLyBsZXQgY2lyY3VpdEJyZWFrZXIgPSAtNTBcbi8vIHRyYXZlcnNlIGFsbCBjaGlsZHJlbiBhbmQgY29sbGVjdCBhIHN0cmVhbSBvZiBhbGwgc291cmNlc1xuLy8gQU5EIHJlbmRlci4gYSBiaXQgb2YgZHVwbGljYXRpb24sIGJ1dCB3ZSBnZXQgcGVyc2lzdGVudCBpbnN0YW5jZXMgd2hpY2ggaXMgZ29vZFxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN0cmVhbShlbGVtZW50LCBpbnN0YW5jZSwgc3RhdGUsIHN0YXRlTWFwKSB7XG4gIC8vIHRoaXMgaXMgYSBzZXBhcmF0ZSBmdW5jdGlvbiBiZWNhdXNlIHNjb3BlIGdldHMgbWVzc3kgd2hlbiBiZWluZyByZWN1cnNpdmVcbiAgbGV0IGlzTmV3U3RyZWFtID0gZmFsc2UgLy8gYXNzdW1lIG5vIHN0cmVhbSBzd2l0Y2hpbmcgYnkgZGVmYXVsdFxuICAvLyB0aGlzIGlzIHRoZSBmaXJzdCBwaW5nIG9mIGRhdGEgdGhyb3VnaG91dCB0aGUgYXBwXG4gIGxldCBzb3VyY2UgPSBPYnNlcnZhYmxlLm9mKHN0YXRlKSBcbiAgY29uc3QgYWRkVG9TdHJlYW0gPSBfc291cmNlID0+IHtcbiAgICAvLyB2aXNpdCBlYWNoIHNvdXJjZSBhbmQgbWVyZ2Ugd2l0aCBzb3VyY2VcbiAgICBpZiAoX3NvdXJjZSkgcmV0dXJuIHNvdXJjZSA9IG1lcmdlKHNvdXJjZSwgX3NvdXJjZSlcbiAgfVxuICBjb25zdCBtYXJrTmV3U3RyZWFtID0gKCkgPT4gaXNOZXdTdHJlYW0gPSB0cnVlXG4gIGNvbnN0IG5ld0luc3RhbmNlID0gcmVuZGVyKHNvdXJjZSwgYWRkVG9TdHJlYW0sIG1hcmtOZXdTdHJlYW0pKGVsZW1lbnQsIGluc3RhbmNlLCBzdGF0ZSwgc3RhdGVNYXApXG4gIHJldHVybiB7c291cmNlLCBpbnN0YW5jZTogbmV3SW5zdGFuY2UsIGlzTmV3U3RyZWFtfVxufVxuXG4vKiogY29yZSByZW5kZXIgbG9naWMgKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoc291cmNlLCBhZGRUb1N0cmVhbSwgbWFya05ld1N0cmVhbSkgeyAvLyB0aGlzIGlzIHRoZSBub25yZWN1cnNpdmUgcGFydFxuICByZXR1cm4gZnVuY3Rpb24gcmVuZGVyV2l0aFN0cmVhbShlbGVtZW50LCBpbnN0YW5jZSwgc3RhdGUsIHN0YXRlTWFwKSB7IC8vIHJlY3Vyc2l2ZSBwYXJ0XG4gICAgbGV0IG5ld0luc3RhbmNlXG4gICAgY29uc3QgeyB0eXBlLCBwcm9wcyB9ID0gZWxlbWVudFxuICBcbiAgICBjb25zdCBpc0RvbUVsZW1lbnQgPSB0eXBlb2YgdHlwZSA9PT0gXCJzdHJpbmdcIjtcbiAgICAvLyBpZiAoY2lyY3VpdEJyZWFrZXJmbGFnICYmIGNpcmN1aXRCcmVha2VyKysgPiAwKSBkZWJ1Z2dlclxuICAgIGNvbnN0IHtjaGlsZHJlbiA9IFtdLCAuLi5yZXN0fSA9IHByb3BzXG4gICAgaWYgKGlzRG9tRWxlbWVudCkge1xuICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZXMgPSBjaGlsZHJlbi5tYXAoXG4gICAgICAgIChlbCwgaSkgPT4ge1xuICAgICAgICAgIC8vIHVnbHkgYnV0IG5lY2Vzc2FyeSB0byBhbGxvdyBmdW5jdGlvbmFsIGNoaWxkcmVuXG4gICAgICAgICAgLy8gbWFwcGluZyBlbGVtZW50J3MgY2hpbGRyZW4gdG8gaW5zdGFuY2UncyBjaGlsZEluc3RhbmNlc1xuICAgICAgICAgIGNvbnN0IF9jaGlsZEluc3RhbmNlcyA9IGluc3RhbmNlICYmIChpbnN0YW5jZS5jaGlsZEluc3RhbmNlIHx8IGluc3RhbmNlLmNoaWxkSW5zdGFuY2VzW2ldKVxuICAgICAgICAgIHJldHVybiByZW5kZXJXaXRoU3RyZWFtKCAgLy8gcmVjdXJzaW9uXG4gICAgICAgICAgICBlbCwgXG4gICAgICAgICAgICBfY2hpbGRJbnN0YW5jZXMsIFxuICAgICAgICAgICAgc3RhdGUsIFxuICAgICAgICAgICAgc3RhdGVNYXApIFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgY29uc3QgY2hpbGREb21zID0gY2hpbGRJbnN0YW5jZXMubWFwKGNoaWxkSW5zdGFuY2UgPT4gY2hpbGRJbnN0YW5jZS5kb20pO1xuICAgICAgbGV0IGxjYXNlUHJvcHMgPSB7fVxuICAgICAgT2JqZWN0LmVudHJpZXMocmVzdCkuZm9yRWFjaCgoW2ssIHZdKSA9PiBsY2FzZVByb3BzW2Zvcm1hdFByb3BzKGspXSA9IHYpXG4gICAgICBjb25zdCBkb20gPSB0eXBlID09PSBURVhUX0VMRU1FTlRcbiAgICAgICAgPyBuZXcgVlRleHQocHJvcHMubm9kZVZhbHVlKVxuICAgICAgICA6IGgodHlwZSwgbGNhc2VQcm9wcywgY2hpbGREb21zKTsgLy8gZXF1aXZhbGVudCBvZiBhcHBlbmRjaGlsZFxuICAgICAgbmV3SW5zdGFuY2UgPSB7IGRvbSwgZWxlbWVudCwgY2hpbGRJbnN0YW5jZXMgfTtcbiAgICB9IGVsc2UgeyAvLyBjb21wb25lbnQgZWxlbWVudFxuICAgICAgbGV0IHB1YmxpY0luc3RhbmNlIFxuICAgICAgLy8gZGVidWdnZXJcbiAgICAgIGlmIChpbnN0YW5jZSAmJiBpbnN0YW5jZS5wdWJsaWNJbnN0YW5jZSAmJiBpbnN0YW5jZS5lbGVtZW50ID09PSBlbGVtZW50KSB7IC8vIG1pZ2h0IGhhdmUgdG8gZG8gbW9yZSBkaWZmaW5nIG9mIHByb3BzXG4gICAgICAgIC8vIGp1c3QgcmV1c2Ugb2xkIGluc3RhbmNlIGlmIGl0IGFscmVhZHkgZXhpc3RzXG4gICAgICAgIHB1YmxpY0luc3RhbmNlID0gaW5zdGFuY2UgJiYgaW5zdGFuY2UucHVibGljSW5zdGFuY2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmtOZXdTdHJlYW0oKSAvLyBtYXJrIGFzIGRpcnR5IGluIHBhcmVudCBzY29wZTsgd2lsbCByZXJlbmRlclxuICAgICAgICBwdWJsaWNJbnN0YW5jZSA9IGNyZWF0ZVB1YmxpY0luc3RhbmNlKGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgbGV0IGxvY2FsU3RhdGUgPSBzdGF0ZU1hcC5nZXQocHVibGljSW5zdGFuY2UpXG4gICAgICBpZiAobG9jYWxTdGF0ZSA9PT0gdW5kZWZpbmVkKSBsb2NhbFN0YXRlID0gcHVibGljSW5zdGFuY2UuaW5pdGlhbFN0YXRlXG4gICAgICBwdWJsaWNJbnN0YW5jZS5zdGF0ZSA9IGxvY2FsU3RhdGUgLy8gZm9yIGFjY2VzcyB3aXRoIHRoaXMuc3RhdGVcbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXN0KS5sZW5ndGgpIHB1YmxpY0luc3RhbmNlLnByb3BzID0gcmVzdCAvLyB1cGRhdGUgd2l0aCBuZXcgcHJvcHMgLy8gVE9ETzogcG90ZW50aWFsbHkgYnVnZ3lcbiAgICAgIC8vIGNvbnNvbGUubG9nKHtyZXN0fSlcbiAgICAgIGlmIChwdWJsaWNJbnN0YW5jZS5zb3VyY2UpIHtcbiAgICAgICAgY29uc3Qgc3JjID0gcHVibGljSW5zdGFuY2Uuc291cmNlKHNvdXJjZSlcbiAgICAgICAgLy8gdGhlcmUgYXJlIHR3byBmb3JtcyBvZiBDb21wb25lbnQuc291cmNlXG4gICAgICAgIGNvbnN0IHNyYyQgPSBzcmMucmVkdWNlciAmJiBwdWJsaWNJbnN0YW5jZS5pbml0aWFsU3RhdGUgIT09IHVuZGVmaW5lZCA/IFxuICAgICAgICAgICAgLy8gMS4gdGhlIHJlZHVjZXIgZm9ybVxuICAgICAgICAgICAgc2NhbihzcmMuc291cmNlLCBzcmMucmVkdWNlciwgcHVibGljSW5zdGFuY2UuaW5pdGlhbFN0YXRlKSA6IFxuICAgICAgICAgICAgLy8gMi4gYW5kIHJhdyBzdHJlYW0gZm9ybVxuICAgICAgICAgICAgc3JjXG4gICAgICAgIGFkZFRvU3RyZWFtKHNyYyRcbiAgICAgICAgICAubWFwKGV2ZW50ID0+IHtcbiAgICAgICAgICAgIHN0YXRlTWFwLnNldChwdWJsaWNJbnN0YW5jZSwgZXZlbnQpXG4gICAgICAgICAgICByZXR1cm4ge2luc3RhbmNlOiBwdWJsaWNJbnN0YW5jZSwgZXZlbnR9IC8vIHRhZyBpdCB0byB0aGUgaW5zdGFuY2VcbiAgICAgICAgICB9KSBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNoaWxkRWxlbWVudCA9IHB1YmxpY0luc3RhbmNlLnJlbmRlciA/IFxuICAgICAgICAgIHB1YmxpY0luc3RhbmNlLnJlbmRlcihsb2NhbFN0YXRlLCBzdGF0ZU1hcCkgOiBcbiAgICAgICAgICBwdWJsaWNJbnN0YW5jZTtcblxuICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZSA9IHJlbmRlcldpdGhTdHJlYW0oY2hpbGRFbGVtZW50LCBpbnN0YW5jZSAmJiBpbnN0YW5jZS5jaGlsZEluc3RhbmNlLCBzdGF0ZSwgc3RhdGVNYXApXG4gICAgICBjb25zdCBkb20gPSBjaGlsZEluc3RhbmNlLmRvbVxuICAgICAgbmV3SW5zdGFuY2UgPSB7IGRvbSwgZWxlbWVudCwgY2hpbGRJbnN0YW5jZSwgcHVibGljSW5zdGFuY2UgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3SW5zdGFuY2VcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wcyhrKSB7XG4gIGlmIChrLnN0YXJ0c1dpdGgoJ29uJykpIHJldHVybiBrLnRvTG93ZXJDYXNlKClcbiAgcmV0dXJuIGtcbn0iLCJpbXBvcnQgT2JzZXJ2YWJsZSBmcm9tICd6ZW4tb2JzZXJ2YWJsZSdcbmltcG9ydCB7ZnJvbUV2ZW50LCBzY2FuLCBtZXJnZSwgc3RhcnRXaXRoLCBzd2l0Y2hMYXRlc3R9IGZyb20gJy4vc3d5eGpzJ1xuaW1wb3J0IGRpZmYgZnJvbSAndmlydHVhbC1kb20vZGlmZic7XG5pbXBvcnQgcGF0Y2ggZnJvbSAndmlydHVhbC1kb20vcGF0Y2gnO1xuaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAndmlydHVhbC1kb20vY3JlYXRlLWVsZW1lbnQnO1xuaW1wb3J0IHsgY3JlYXRlQ2hhbmdlRW1pdHRlciB9IGZyb20gJ2NoYW5nZS1lbWl0dGVyJ1xuaW1wb3J0IHsgcmVuZGVyU3RyZWFtIH0gZnJvbSAnLi9yZWNvbmNpbGVyJ1xuXG5leHBvcnQgY29uc3Qgc3RhdGVNYXBQb2ludGVyID0gbmV3IE1hcCgpXG5cbmxldCBjaXJjdWl0QnJlYWtlciA9IC0yMFxuXG5jb25zdCBlbWl0dGVyID0gY3JlYXRlQ2hhbmdlRW1pdHRlcigpXG4vLyBzaW5nbGUgVUkgdGhyZWFkOyB0aGlzIGlzIHRoZSBvYnNlcnZhYmxlIHRoYXQgc3RpY2tzIGFyb3VuZCBhbmQgc3dhcHMgb3V0IHNvdXJjZVxuY29uc3QgVUl0aHJlYWQgPSBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gIGVtaXR0ZXIubGlzdGVuKHggPT4ge1xuICAgIC8vIGRlYnVnZ2VyIC8vIHN1Y2Nlc3MhIHRocmVhZCBzd2l0Y2hpbmchXG4gICAgb2JzZXJ2ZXIubmV4dCh4KVxuICB9KVxufSlcbi8vIG1vdW50IHRoZSB2ZG9tIG9uIHRvIHRoZSBkb20gYW5kIFxuLy8gc2V0IHVwIHRoZSBydW50aW1lIGZyb20gc291cmNlcyBhbmRcbi8vIHBhdGNoIHRoZSB2ZG9tXG4vLyAtLS1cbi8vIHJldHVybnMgYW4gdW5zdWJzY3JpYmUgbWV0aG9kIHlvdSBjYW4gdXNlIHRvIHVubW91bnRcbmV4cG9ydCBmdW5jdGlvbiBtb3VudChyb290RWxlbWVudCwgY29udGFpbmVyKSB7XG4gIC8vIGluaXRpYWwsIHRocm93YXdheS1pc2ggZnJhbWVcbiAgbGV0IHtzb3VyY2UsIGluc3RhbmNlfSA9IHJlbmRlclN0cmVhbShyb290RWxlbWVudCwge30sIHVuZGVmaW5lZCwgc3RhdGVNYXBQb2ludGVyKVxuICBsZXQgaW5zdGFuY2VQb2ludGVyID0gaW5zdGFuY2VcbiAgY29uc3Qgcm9vdE5vZGUgPSBjcmVhdGVFbGVtZW50KGluc3RhbmNlLmRvbSlcbiAgY29uc3QgY29udGFpbmVyQ2hpbGQgPSBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGRcbiAgaWYgKGNvbnRhaW5lckNoaWxkKSB7XG4gICAgY29udGFpbmVyLnJlcGxhY2VDaGlsZChyb290Tm9kZSxjb250YWluZXJDaGlsZCkgLy8gaG90IHJlbG9hZGVkIG1vdW50XG4gIH0gZWxzZSB7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJvb3ROb2RlKSAvLyBpbml0aWFsIG1vdW50XG4gIH1cbiAgbGV0IGN1cnJlbnRTcmMkID0gbnVsbFxuICBsZXQgU29TID0gc3RhcnRXaXRoKFVJdGhyZWFkLCBzb3VyY2UpIC8vIHN0cmVhbSBvZiBzdHJlYW1zXG4gIHJldHVybiBTb1Muc3Vic2NyaWJlKFxuICAgIHNyYyQgPT4geyAvLyB0aGlzIGlzIHRoZSBjdXJyZW50IHNvdXJjZVN0cmVhbSB3ZSBhcmUgd29ya2luZyB3aXRoXG4gICAgICBpZiAoY3VycmVudFNyYyQpIGNvbnNvbGUubG9nKCd1bnN1YiEnKSB8fCBjdXJyZW50U3JjJC51bnN1YnNjcmliZSgpIC8vIHVuc3ViIGZyb20gb2xkIHN0cmVhbVxuICAgICAgLyoqKiogbWFpbiAqL1xuICAgICAgY29uc3Qgc291cmNlMiQgPSBzY2FuKFxuICAgICAgICBzcmMkLCBcbiAgICAgICAgKHtpbnN0YW5jZSwgc3RhdGVNYXB9LCBuZXh0U3RhdGUpID0+IHtcbiAgICAgICAgICBjb25zdCBzdHJlYW1PdXRwdXQgPSByZW5kZXJTdHJlYW0ocm9vdEVsZW1lbnQsIGluc3RhbmNlLCBuZXh0U3RhdGUsIHN0YXRlTWFwKVxuICAgICAgICAgIGlmIChzdHJlYW1PdXRwdXQuaXNOZXdTdHJlYW0pIHsgLy8gcXVpY2sgY2hlY2tcbiAgICAgICAgICAgIGNvbnN0IG5leHRTb3VyY2UkID0gc3RyZWFtT3V0cHV0LnNvdXJjZVxuICAgICAgICAgICAgLy8gZGVidWdnZXJcbiAgICAgICAgICAgIGluc3RhbmNlUG9pbnRlciA9IHN0cmVhbU91dHB1dC5pbnN0YW5jZVxuICAgICAgICAgICAgcGF0Y2gocm9vdE5vZGUsIGRpZmYoaW5zdGFuY2UuZG9tLCBpbnN0YW5jZVBvaW50ZXIuZG9tKSkgLy8gcmVuZGVyIHRvIHNjcmVlblxuICAgICAgICAgICAgZW1pdHRlci5lbWl0KG5leHRTb3VyY2UkKSAvLyB1cGRhdGUgdGhlIFVJIHRocmVhZDsgc291cmNlIHdpbGwgc3dpdGNoXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5leHRpbnN0YW5jZSA9IHN0cmVhbU91dHB1dC5pbnN0YW5jZVxuICAgICAgICAgICAgcGF0Y2gocm9vdE5vZGUsIGRpZmYoaW5zdGFuY2UuZG9tLCBuZXh0aW5zdGFuY2UuZG9tKSkgLy8gcmVuZGVyIHRvIHNjcmVlblxuICAgICAgICAgICAgcmV0dXJuIHtpbnN0YW5jZTogbmV4dGluc3RhbmNlLCBzdGF0ZU1hcDogc3RhdGVNYXB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7aW5zdGFuY2U6IGluc3RhbmNlUG9pbnRlciwgc3RhdGVNYXA6IHN0YXRlTWFwUG9pbnRlcn0gLy8gYWNjdW11bGF0b3JcbiAgICAgIClcbiAgICAgIC8qKioqIGVuZCBtYWluICovXG4gICAgICBjdXJyZW50U3JjJCA9IFxuICAgICAgICBzb3VyY2UyJFxuICAgICAgICAgIC5zdWJzY3JpYmUoKVxuICAgIH1cbiAgKVxufVxuIiwiaW1wb3J0IHsgY3JlYXRlRWxlbWVudCwgY3JlYXRlSGFuZGxlciB9IGZyb20gXCIuL2VsZW1lbnRcIjtcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgcmVuZGVyU3RyZWFtIH0gZnJvbSBcIi4vcmVjb25jaWxlclwiXG5pbXBvcnQgeyBtb3VudCB9IGZyb20gXCIuL3NjaGVkdWxlclwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlclN0cmVhbSxcbiAgY3JlYXRlRWxlbWVudCxcbiAgY3JlYXRlSGFuZGxlcixcbiAgQ29tcG9uZW50LFxuICBtb3VudFxufTtcblxuZXhwb3J0IHsgY3JlYXRlRWxlbWVudCwgY3JlYXRlSGFuZGxlciwgQ29tcG9uZW50LCBcbiAgcmVuZGVyU3RyZWFtLCBcbiAgbW91bnQgfTtcbiJdLCJuYW1lcyI6WyJURVhUX0VMRU1FTlQiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsImNvbmZpZyIsInByb3BzIiwiT2JqZWN0IiwiYXNzaWduIiwiYXJncyIsImhhc0NoaWxkcmVuIiwibGVuZ3RoIiwicmF3Q2hpbGRyZW4iLCJjb25jYXQiLCJjaGlsZHJlbiIsImZpbHRlciIsImMiLCJtYXAiLCJjcmVhdGVUZXh0RWxlbWVudCIsInZhbHVlIiwibm9kZVZhbHVlIiwiY3JlYXRlSGFuZGxlciIsIl9mbiIsImVtaXR0ZXIiLCJjcmVhdGVDaGFuZ2VFbWl0dGVyIiwiaGFuZGxlciIsImVtaXQiLCJ4IiwiJCIsIk9ic2VydmFibGUiLCJsaXN0ZW4iLCJuZXh0IiwiTk9JTklUIiwiU3ltYm9sIiwic2NhbiIsIm9icyIsImNiIiwic2VlZCIsInN1YiIsImFjYyIsImhhc1ZhbHVlIiwiaGFzU2VlZCIsInN1YnNjcmliZSIsIm9ic2VydmVyIiwiY2xvc2VkIiwiZmlyc3QiLCJlIiwiZXJyb3IiLCJzdGFydFdpdGgiLCJ2YWwiLCJDb21wb25lbnQiLCJzdGF0ZSIsIm9iaiIsInNvdXJjZXMiLCJlbnRyaWVzIiwiayIsImZuIiwic3ViUmVkdWNlciIsInNvdXJjZSIsInJlZHVjZXIiLCJfIiwibiIsImluaXRpYWxTdGF0ZSIsIm1lcmdlIiwiY3JlYXRlUHVibGljSW5zdGFuY2UiLCJlbGVtZW50IiwicHVibGljSW5zdGFuY2UiLCJyZW5kZXJTdHJlYW0iLCJpbnN0YW5jZSIsInN0YXRlTWFwIiwiaXNOZXdTdHJlYW0iLCJvZiIsImFkZFRvU3RyZWFtIiwiX3NvdXJjZSIsIm1hcmtOZXdTdHJlYW0iLCJuZXdJbnN0YW5jZSIsInJlbmRlciIsInJlbmRlcldpdGhTdHJlYW0iLCJpc0RvbUVsZW1lbnQiLCJyZXN0IiwiY2hpbGRJbnN0YW5jZXMiLCJlbCIsImkiLCJfY2hpbGRJbnN0YW5jZXMiLCJjaGlsZEluc3RhbmNlIiwiY2hpbGREb21zIiwiZG9tIiwibGNhc2VQcm9wcyIsImZvckVhY2giLCJ2IiwiZm9ybWF0UHJvcHMiLCJWVGV4dCIsImgiLCJsb2NhbFN0YXRlIiwiZ2V0IiwidW5kZWZpbmVkIiwia2V5cyIsInNyYyIsInNyYyQiLCJzZXQiLCJldmVudCIsImNoaWxkRWxlbWVudCIsInN0YXJ0c1dpdGgiLCJ0b0xvd2VyQ2FzZSIsInN0YXRlTWFwUG9pbnRlciIsIk1hcCIsIlVJdGhyZWFkIiwibW91bnQiLCJyb290RWxlbWVudCIsImNvbnRhaW5lciIsImluc3RhbmNlUG9pbnRlciIsInJvb3ROb2RlIiwiY29udGFpbmVyQ2hpbGQiLCJmaXJzdEVsZW1lbnRDaGlsZCIsInJlcGxhY2VDaGlsZCIsImFwcGVuZENoaWxkIiwiY3VycmVudFNyYyQiLCJTb1MiLCJjb25zb2xlIiwibG9nIiwidW5zdWJzY3JpYmUiLCJzb3VyY2UyJCIsIm5leHRTdGF0ZSIsInN0cmVhbU91dHB1dCIsIm5leHRTb3VyY2UkIiwiZGlmZiIsIm5leHRpbnN0YW5jZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUdPLElBQU1BLGVBQWUsY0FBckI7O0FBRVAsQUFBTyxTQUFTQyxlQUFULENBQXVCQyxJQUF2QixFQUE2QkMsTUFBN0IsRUFBOEM7OztNQUM3Q0MsUUFBUUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JILE1BQWxCLENBQWQ7O29DQUQ2Q0ksSUFBTTtRQUFBOzs7TUFFN0NDLGNBQWNELEtBQUtFLE1BQUwsR0FBYyxDQUFsQztNQUNNQyxjQUFjRixjQUFjLFlBQUdHLE1BQUgsYUFBYUosSUFBYixDQUFkLEdBQW1DLEVBQXZEO1FBQ01LLFFBQU4sR0FBaUJGLFlBQ2RHLE1BRGMsQ0FDUDtX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
