import Observable from 'zen-observable';
import { createChangeEmitter } from 'change-emitter';
import { merge } from 'zen-observable/extras';
import h from 'virtual-dom/h';
import VText from 'virtual-dom/vnode/vtext';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

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
  var emitter = createChangeEmitter();
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
      var source = merge.apply(undefined, _toConsumableArray(sources));
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
    if (_source) return source = merge(source, _source);
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

var emitter = createChangeEmitter();
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

export { createElement$1 as createElement, createHandler, Component, renderStream, mount };export default index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3RpdmUtcmVhY3QuZXMuanMiLCJzb3VyY2VzIjpbIi4uL3JlYWN0aXZlLXJlYWN0L2VsZW1lbnQuanMiLCIuLi9yZWFjdGl2ZS1yZWFjdC9zd3l4anMuanMiLCIuLi9yZWFjdGl2ZS1yZWFjdC9jb21wb25lbnQuanMiLCIuLi9yZWFjdGl2ZS1yZWFjdC9yZWNvbmNpbGVyLmpzIiwiLi4vcmVhY3RpdmUtcmVhY3Qvc2NoZWR1bGVyLmpzIiwiLi4vcmVhY3RpdmUtcmVhY3QvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9ic2VydmFibGUgZnJvbSAnemVuLW9ic2VydmFibGUnXG5pbXBvcnQgeyBjcmVhdGVDaGFuZ2VFbWl0dGVyIH0gZnJvbSAnY2hhbmdlLWVtaXR0ZXInXG5cbmV4cG9ydCBjb25zdCBURVhUX0VMRU1FTlQgPSBcIlRFWFQgRUxFTUVOVFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0eXBlLCBjb25maWcsIC4uLmFyZ3MpIHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBjb25maWcpO1xuICBjb25zdCBoYXNDaGlsZHJlbiA9IGFyZ3MubGVuZ3RoID4gMDtcbiAgY29uc3QgcmF3Q2hpbGRyZW4gPSBoYXNDaGlsZHJlbiA/IFtdLmNvbmNhdCguLi5hcmdzKSA6IFtdO1xuICBwcm9wcy5jaGlsZHJlbiA9IHJhd0NoaWxkcmVuXG4gICAgLmZpbHRlcihjID0+IGMgIT0gbnVsbCAmJiBjICE9PSBmYWxzZSlcbiAgICAubWFwKGMgPT4gYyBpbnN0YW5jZW9mIE9iamVjdCA/IGMgOiBjcmVhdGVUZXh0RWxlbWVudChjKSk7XG4gIHJldHVybiB7IHR5cGUsIHByb3BzIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRFbGVtZW50KHZhbHVlKSB7XG4gIHJldHVybiBjcmVhdGVFbGVtZW50KFRFWFRfRUxFTUVOVCwgeyBub2RlVmFsdWU6IHZhbHVlIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGFuZGxlcihfZm4pIHtcbiAgY29uc3QgZW1pdHRlciA9IGNyZWF0ZUNoYW5nZUVtaXR0ZXIoKVxuICBsZXQgaGFuZGxlciA9IHggPT4ge1xuICAgIGVtaXR0ZXIuZW1pdCh4KVxuICB9XG4gIGhhbmRsZXIuJCA9IG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW4odmFsdWUgPT4ge1xuICAgICAgb2JzZXJ2ZXIubmV4dChfZm4gPyBfZm4odmFsdWUpIDogdmFsdWUpXG4gICAgfVxuICAgIClcbiAgfSlcbiAgcmV0dXJuIGhhbmRsZXJcbn0iLCJpbXBvcnQgT2JzZXJ2YWJsZSBmcm9tICd6ZW4tb2JzZXJ2YWJsZSdcbmV4cG9ydCB7IG1lcmdlLCBjb21iaW5lTGF0ZXN0LCB6aXAgfSBmcm9tICd6ZW4tb2JzZXJ2YWJsZS9leHRyYXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBJbnRlcnZhbCh0aWNrID0gMTAwMCwgdGlja0RhdGEgPSBTeW1ib2woJ3RpY2snKSkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIGxldCB0aW1lciA9ICgpID0+IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0aWNrRGF0YSA9PT0gJ2Z1bmN0aW9uJykgdGlja0RhdGEgPSB0aWNrRGF0YSgpXG4gICAgICBvYnNlcnZlci5uZXh0KHRpY2tEYXRhKTtcbiAgICAgIHRpbWVyKClcbiAgICAgIC8vIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgfSwgdGljayk7XG4gICAgdGltZXIoKVxuICBcbiAgICAvLyBPbiB1bnN1YnNjcmlwdGlvbiwgY2FuY2VsIHRoZSB0aW1lclxuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQodGltZXIpO1xuXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tRXZlbnQoZWwsIGV2ZW50VHlwZSkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIGNvbnN0IGhhbmRsZXIgPSBlID0+IG9ic2VydmVyLm5leHQoZSlcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlcilcbiAgICAvLyBvbiB1bnN1YiwgcmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyKVxuICB9KVxufVxuXG5jb25zdCBOT0lOSVQgPSBTeW1ib2woJ05PX0lOSVRJQUxfVkFMVUUnKVxuZXhwb3J0IGZ1bmN0aW9uIHNjYW4ob2JzLCBjYiwgc2VlZCA9IE5PSU5JVCkge1xuICBsZXQgc3ViLCBhY2MgPSBzZWVkLCBoYXNWYWx1ZSA9IGZhbHNlXG4gIGNvbnN0IGhhc1NlZWQgPSBhY2MgIT09IE5PSU5JVFxuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIHN1YiA9IG9icy5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgICAgaWYgKG9ic2VydmVyLmNsb3NlZCkgcmV0dXJuXG4gICAgICBsZXQgZmlyc3QgPSAhaGFzVmFsdWU7XG4gICAgICBoYXNWYWx1ZSA9IHRydWVcbiAgICAgIGlmICghZmlyc3QgfHwgaGFzU2VlZCApIHtcbiAgICAgICAgdHJ5IHsgYWNjID0gY2IoYWNjLCB2YWx1ZSkgfVxuICAgICAgICBjYXRjaCAoZSkgeyByZXR1cm4gb2JzZXJ2ZXIuZXJyb3IoZSkgfVxuICAgICAgICBvYnNlcnZlci5uZXh0KGFjYyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYWNjID0gdmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBzdWJcbiAgfSlcbn1cblxuLy8gRmxhdHRlbiBhIGNvbGxlY3Rpb24gb2Ygb2JzZXJ2YWJsZXMgYW5kIG9ubHkgb3V0cHV0IHRoZSBuZXdlc3QgZnJvbSBlYWNoXG5leHBvcnQgZnVuY3Rpb24gc3dpdGNoTGF0ZXN0KGhpZ2hlck9ic2VydmFibGUpIHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBsZXQgY3VycmVudE9icyA9IG51bGxcbiAgICByZXR1cm4gaGlnaGVyT2JzZXJ2YWJsZS5zdWJzY3JpYmUoe1xuICAgICAgbmV4dChvYnMpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRPYnMpIGN1cnJlbnRPYnMudW5zdWJzY3JpYmUoKSAvLyB1bnN1YiBhbmQgc3dpdGNoXG4gICAgICAgIGN1cnJlbnRPYnMgPSBvYnMuc3Vic2NyaWJlKG9ic2VydmVyLnN1YnNjcmliZSlcbiAgICAgIH0sXG4gICAgICBlcnJvcihlKSB7XG4gICAgICAgIG9ic2VydmVyLmVycm9yKGUpIC8vIHVudGVzdGVkXG4gICAgICB9LFxuICAgICAgY29tcGxldGUoKSB7XG4gICAgICAgIC8vIGkgZG9udCB0aGluayBpdCBzaG91bGQgY29tcGxldGU/XG4gICAgICAgIC8vIG9ic2VydmVyLmNvbXBsZXRlKClcbiAgICAgIH1cbiAgICB9KVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvQ29uc3RhbnQob2JzLCB2YWwpIHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBjb25zdCBoYW5kbGVyID0gb2JzLnN1YnNjcmliZSgoKSA9PiBvYnNlcnZlci5uZXh0KHZhbCkpXG4gICAgcmV0dXJuIGhhbmRsZXJcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0V2l0aChvYnMsIHZhbCkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIG9ic2VydmVyLm5leHQodmFsKSAvLyBpbW1lZGlhdGVseSBvdXRwdXQgdGhpcyB2YWx1ZVxuICAgIGNvbnN0IGhhbmRsZXIgPSBvYnMuc3Vic2NyaWJlKHggPT4gb2JzZXJ2ZXIubmV4dCh4KSlcbiAgICByZXR1cm4gKCkgPT4gaGFuZGxlcigpXG4gIH0pXG59IiwiLy8gaW1wb3J0IHsgcmVjb25jaWxlIH0gZnJvbSBcIi4vcmVjb25jaWxlclwiO1xuaW1wb3J0IHtJbnRlcnZhbCwgc2Nhbiwgc3RhcnRXaXRoLCBtZXJnZSwgbWFwVG9Db25zdGFudH0gZnJvbSAnLi9zd3l4anMnXG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZSB8fCB7fTtcbiAgfVxuXG4gIC8vIHNldFN0YXRlKHBhcnRpYWxTdGF0ZSkge1xuICAvLyAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLCBwYXJ0aWFsU3RhdGUpO1xuICAvLyAgIHVwZGF0ZUluc3RhbmNlKHRoaXMuX19pbnRlcm5hbEluc3RhbmNlKTtcbiAgLy8gfVxuXG4gIC8vIGNsYXNzIG1ldGhvZCBiZWNhdXNlIGl0IGZlZWRzIGluIHRoaXMuaW5pdGlhbFN0YXRlXG4gIGNvbWJpbmVSZWR1Y2VyKG9iaikge1xuICAgIGNvbnN0IHNvdXJjZXMgPSBPYmplY3QuZW50cmllcyhvYmopLm1hcCgoW2ssZm5dKSA9PiB7XG4gICAgICBsZXQgc3ViUmVkdWNlciA9IGZuKG9iailcbiAgICAgIC8vIHRoZXJlIGFyZSB0d28gZm9ybXMgb2YgcmV0dXJuIHRoZSBzdWJyZWR1Y2VyIGNhbiBoYXZlXG4gICAgICAvLyBzdHJhaWdodCBzdHJlYW0gZm9ybVxuICAgICAgLy8gb3Igb2JqZWN0IGZvcm0gd2hlcmUgd2UgbmVlZCB0byBzY2FuIGl0IGludG8gc3RyaW5nXG4gICAgICBpZiAoc3ViUmVkdWNlci5zb3VyY2UgJiYgc3ViUmVkdWNlci5yZWR1Y2VyKSB7IC8vIG9iamVjdCBmb3JtXG4gICAgICAgIHN1YlJlZHVjZXIgPSBzY2FuKHN1YlJlZHVjZXIuc291cmNlLCBcbiAgICAgICAgICBzdWJSZWR1Y2VyLnJlZHVjZXIgfHwgKChfLCBuKSA9PiBuKSwgXG4gICAgICAgICAgdGhpcy5pbml0aWFsU3RhdGVba11cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN1YlJlZHVjZXJcbiAgICAgICAgLm1hcCh4ID0+ICh7W2tdOiB4fSkpIC8vIG1hcCB0byBpdHMgcGFydGljdWxhciBuYW1lc3BhY2VcbiAgICB9KVxuICAgIGNvbnN0IHNvdXJjZSA9IG1lcmdlKC4uLnNvdXJjZXMpXG4gICAgY29uc3QgcmVkdWNlciA9IChhY2MsIG4pID0+ICh7Li4uYWNjLCAuLi5ufSlcbiAgICByZXR1cm4ge3NvdXJjZSwgcmVkdWNlcn1cbiAgfVxufVxuXG4vLyBmdW5jdGlvbiB1cGRhdGVJbnN0YW5jZShpbnRlcm5hbEluc3RhbmNlKSB7XG4vLyAgIGNvbnN0IHBhcmVudERvbSA9IGludGVybmFsSW5zdGFuY2UuZG9tLnBhcmVudE5vZGU7XG4vLyAgIGNvbnN0IGVsZW1lbnQgPSBpbnRlcm5hbEluc3RhbmNlLmVsZW1lbnQ7XG4vLyAgIHJlY29uY2lsZShwYXJlbnREb20sIGludGVybmFsSW5zdGFuY2UsIGVsZW1lbnQpO1xuLy8gfVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHVibGljSW5zdGFuY2UoZWxlbWVudC8qLCBpbnRlcm5hbEluc3RhbmNlKi8pIHtcbiAgY29uc3QgeyB0eXBlLCBwcm9wcyB9ID0gZWxlbWVudDtcbiAgY29uc3QgcHVibGljSW5zdGFuY2UgPSBuZXcgdHlwZShwcm9wcyk7XG4gIC8vIHB1YmxpY0luc3RhbmNlLl9faW50ZXJuYWxJbnN0YW5jZSA9IGludGVybmFsSW5zdGFuY2U7XG4gIHJldHVybiBwdWJsaWNJbnN0YW5jZTtcbn1cbiIsImltcG9ydCBPYnNlcnZhYmxlIGZyb20gJ3plbi1vYnNlcnZhYmxlJ1xuaW1wb3J0IHtmcm9tRXZlbnQsIHNjYW4sIG1lcmdlLCBzdGFydFdpdGgsIHN3aXRjaExhdGVzdH0gZnJvbSAnLi9zd3l4anMnXG4vLyBpbXBvcnQgeyB1cGRhdGVEb21Qcm9wZXJ0aWVzIH0gZnJvbSBcIi4vdXBkYXRlUHJvcGVydGllc1wiO1xuaW1wb3J0IHsgVEVYVF9FTEVNRU5UIH0gZnJvbSBcIi4vZWxlbWVudFwiO1xuaW1wb3J0IHsgY3JlYXRlUHVibGljSW5zdGFuY2UgfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcbmltcG9ydCBoIGZyb20gJ3ZpcnR1YWwtZG9tL2gnXG4vLyBpbXBvcnQgVk5vZGUgZnJvbSBcInZpcnR1YWwtZG9tL3Zub2RlL3Zub2RlXCJcbmltcG9ydCBWVGV4dCBmcm9tIFwidmlydHVhbC1kb20vdm5vZGUvdnRleHRcIlxuXG4vLyBjb25zdCBjaXJjdWl0QnJlYWtlcmZsYWcgPSBmYWxzZSAvLyBzZXQgdHJ1ZSB0byBlbmFibGUgZGVidWdnZXIgaW4gaW5maW5pdGUgbG9vcHNcbi8vIGxldCBjaXJjdWl0QnJlYWtlciA9IC01MFxuLy8gdHJhdmVyc2UgYWxsIGNoaWxkcmVuIGFuZCBjb2xsZWN0IGEgc3RyZWFtIG9mIGFsbCBzb3VyY2VzXG4vLyBBTkQgcmVuZGVyLiBhIGJpdCBvZiBkdXBsaWNhdGlvbiwgYnV0IHdlIGdldCBwZXJzaXN0ZW50IGluc3RhbmNlcyB3aGljaCBpcyBnb29kXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU3RyZWFtKGVsZW1lbnQsIGluc3RhbmNlLCBzdGF0ZSwgc3RhdGVNYXApIHtcbiAgLy8gdGhpcyBpcyBhIHNlcGFyYXRlIGZ1bmN0aW9uIGJlY2F1c2Ugc2NvcGUgZ2V0cyBtZXNzeSB3aGVuIGJlaW5nIHJlY3Vyc2l2ZVxuICBsZXQgaXNOZXdTdHJlYW0gPSBmYWxzZSAvLyBhc3N1bWUgbm8gc3RyZWFtIHN3aXRjaGluZyBieSBkZWZhdWx0XG4gIC8vIHRoaXMgaXMgdGhlIGZpcnN0IHBpbmcgb2YgZGF0YSB0aHJvdWdob3V0IHRoZSBhcHBcbiAgbGV0IHNvdXJjZSA9IE9ic2VydmFibGUub2Yoc3RhdGUpIFxuICBjb25zdCBhZGRUb1N0cmVhbSA9IF9zb3VyY2UgPT4ge1xuICAgIC8vIHZpc2l0IGVhY2ggc291cmNlIGFuZCBtZXJnZSB3aXRoIHNvdXJjZVxuICAgIGlmIChfc291cmNlKSByZXR1cm4gc291cmNlID0gbWVyZ2Uoc291cmNlLCBfc291cmNlKVxuICB9XG4gIGNvbnN0IG1hcmtOZXdTdHJlYW0gPSAoKSA9PiBpc05ld1N0cmVhbSA9IHRydWVcbiAgY29uc3QgbmV3SW5zdGFuY2UgPSByZW5kZXIoc291cmNlLCBhZGRUb1N0cmVhbSwgbWFya05ld1N0cmVhbSkoZWxlbWVudCwgaW5zdGFuY2UsIHN0YXRlLCBzdGF0ZU1hcClcbiAgcmV0dXJuIHtzb3VyY2UsIGluc3RhbmNlOiBuZXdJbnN0YW5jZSwgaXNOZXdTdHJlYW19XG59XG5cbi8qKiBjb3JlIHJlbmRlciBsb2dpYyAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihzb3VyY2UsIGFkZFRvU3RyZWFtLCBtYXJrTmV3U3RyZWFtKSB7IC8vIHRoaXMgaXMgdGhlIG5vbnJlY3Vyc2l2ZSBwYXJ0XG4gIHJldHVybiBmdW5jdGlvbiByZW5kZXJXaXRoU3RyZWFtKGVsZW1lbnQsIGluc3RhbmNlLCBzdGF0ZSwgc3RhdGVNYXApIHsgLy8gcmVjdXJzaXZlIHBhcnRcbiAgICBsZXQgbmV3SW5zdGFuY2VcbiAgICBjb25zdCB7IHR5cGUsIHByb3BzIH0gPSBlbGVtZW50XG4gIFxuICAgIGNvbnN0IGlzRG9tRWxlbWVudCA9IHR5cGVvZiB0eXBlID09PSBcInN0cmluZ1wiO1xuICAgIC8vIGlmIChjaXJjdWl0QnJlYWtlcmZsYWcgJiYgY2lyY3VpdEJyZWFrZXIrKyA+IDApIGRlYnVnZ2VyXG4gICAgY29uc3Qge2NoaWxkcmVuID0gW10sIC4uLnJlc3R9ID0gcHJvcHNcbiAgICBpZiAoaXNEb21FbGVtZW50KSB7XG4gICAgICBjb25zdCBjaGlsZEluc3RhbmNlcyA9IGNoaWxkcmVuLm1hcChcbiAgICAgICAgKGVsLCBpKSA9PiB7XG4gICAgICAgICAgLy8gdWdseSBidXQgbmVjZXNzYXJ5IHRvIGFsbG93IGZ1bmN0aW9uYWwgY2hpbGRyZW5cbiAgICAgICAgICAvLyBtYXBwaW5nIGVsZW1lbnQncyBjaGlsZHJlbiB0byBpbnN0YW5jZSdzIGNoaWxkSW5zdGFuY2VzXG4gICAgICAgICAgY29uc3QgX2NoaWxkSW5zdGFuY2VzID0gaW5zdGFuY2UgJiYgKGluc3RhbmNlLmNoaWxkSW5zdGFuY2UgfHwgaW5zdGFuY2UuY2hpbGRJbnN0YW5jZXNbaV0pXG4gICAgICAgICAgcmV0dXJuIHJlbmRlcldpdGhTdHJlYW0oICAvLyByZWN1cnNpb25cbiAgICAgICAgICAgIGVsLCBcbiAgICAgICAgICAgIF9jaGlsZEluc3RhbmNlcywgXG4gICAgICAgICAgICBzdGF0ZSwgXG4gICAgICAgICAgICBzdGF0ZU1hcCkgXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBjb25zdCBjaGlsZERvbXMgPSBjaGlsZEluc3RhbmNlcy5tYXAoY2hpbGRJbnN0YW5jZSA9PiBjaGlsZEluc3RhbmNlLmRvbSk7XG4gICAgICBsZXQgbGNhc2VQcm9wcyA9IHt9XG4gICAgICBPYmplY3QuZW50cmllcyhyZXN0KS5mb3JFYWNoKChbaywgdl0pID0+IGxjYXNlUHJvcHNbZm9ybWF0UHJvcHMoayldID0gdilcbiAgICAgIGNvbnN0IGRvbSA9IHR5cGUgPT09IFRFWFRfRUxFTUVOVFxuICAgICAgICA/IG5ldyBWVGV4dChwcm9wcy5ub2RlVmFsdWUpXG4gICAgICAgIDogaCh0eXBlLCBsY2FzZVByb3BzLCBjaGlsZERvbXMpOyAvLyBlcXVpdmFsZW50IG9mIGFwcGVuZGNoaWxkXG4gICAgICBuZXdJbnN0YW5jZSA9IHsgZG9tLCBlbGVtZW50LCBjaGlsZEluc3RhbmNlcyB9O1xuICAgIH0gZWxzZSB7IC8vIGNvbXBvbmVudCBlbGVtZW50XG4gICAgICBsZXQgcHVibGljSW5zdGFuY2UgXG4gICAgICAvLyBkZWJ1Z2dlclxuICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLnB1YmxpY0luc3RhbmNlICYmIGluc3RhbmNlLmVsZW1lbnQgPT09IGVsZW1lbnQpIHsgLy8gbWlnaHQgaGF2ZSB0byBkbyBtb3JlIGRpZmZpbmcgb2YgcHJvcHNcbiAgICAgICAgLy8ganVzdCByZXVzZSBvbGQgaW5zdGFuY2UgaWYgaXQgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgcHVibGljSW5zdGFuY2UgPSBpbnN0YW5jZSAmJiBpbnN0YW5jZS5wdWJsaWNJbnN0YW5jZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFya05ld1N0cmVhbSgpIC8vIG1hcmsgYXMgZGlydHkgaW4gcGFyZW50IHNjb3BlOyB3aWxsIHJlcmVuZGVyXG4gICAgICAgIHB1YmxpY0luc3RhbmNlID0gY3JlYXRlUHVibGljSW5zdGFuY2UoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICBsZXQgbG9jYWxTdGF0ZSA9IHN0YXRlTWFwLmdldChwdWJsaWNJbnN0YW5jZSlcbiAgICAgIGlmIChsb2NhbFN0YXRlID09PSB1bmRlZmluZWQpIGxvY2FsU3RhdGUgPSBwdWJsaWNJbnN0YW5jZS5pbml0aWFsU3RhdGVcbiAgICAgIHB1YmxpY0luc3RhbmNlLnN0YXRlID0gbG9jYWxTdGF0ZSAvLyBmb3IgYWNjZXNzIHdpdGggdGhpcy5zdGF0ZVxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlc3QpLmxlbmd0aCkgcHVibGljSW5zdGFuY2UucHJvcHMgPSByZXN0IC8vIHVwZGF0ZSB3aXRoIG5ldyBwcm9wcyAvLyBUT0RPOiBwb3RlbnRpYWxseSBidWdneVxuICAgICAgLy8gY29uc29sZS5sb2coe3Jlc3R9KVxuICAgICAgaWYgKHB1YmxpY0luc3RhbmNlLnNvdXJjZSkge1xuICAgICAgICBjb25zdCBzcmMgPSBwdWJsaWNJbnN0YW5jZS5zb3VyY2Uoc291cmNlKVxuICAgICAgICAvLyB0aGVyZSBhcmUgdHdvIGZvcm1zIG9mIENvbXBvbmVudC5zb3VyY2VcbiAgICAgICAgY29uc3Qgc3JjJCA9IHNyYy5yZWR1Y2VyICYmIHB1YmxpY0luc3RhbmNlLmluaXRpYWxTdGF0ZSAhPT0gdW5kZWZpbmVkID8gXG4gICAgICAgICAgICAvLyAxLiB0aGUgcmVkdWNlciBmb3JtXG4gICAgICAgICAgICBzY2FuKHNyYy5zb3VyY2UsIHNyYy5yZWR1Y2VyLCBwdWJsaWNJbnN0YW5jZS5pbml0aWFsU3RhdGUpIDogXG4gICAgICAgICAgICAvLyAyLiBhbmQgcmF3IHN0cmVhbSBmb3JtXG4gICAgICAgICAgICBzcmNcbiAgICAgICAgYWRkVG9TdHJlYW0oc3JjJFxuICAgICAgICAgIC5tYXAoZXZlbnQgPT4ge1xuICAgICAgICAgICAgc3RhdGVNYXAuc2V0KHB1YmxpY0luc3RhbmNlLCBldmVudClcbiAgICAgICAgICAgIHJldHVybiB7aW5zdGFuY2U6IHB1YmxpY0luc3RhbmNlLCBldmVudH0gLy8gdGFnIGl0IHRvIHRoZSBpbnN0YW5jZVxuICAgICAgICAgIH0pIFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY29uc3QgY2hpbGRFbGVtZW50ID0gcHVibGljSW5zdGFuY2UucmVuZGVyID8gXG4gICAgICAgICAgcHVibGljSW5zdGFuY2UucmVuZGVyKGxvY2FsU3RhdGUsIHN0YXRlTWFwKSA6IFxuICAgICAgICAgIHB1YmxpY0luc3RhbmNlO1xuXG4gICAgICBjb25zdCBjaGlsZEluc3RhbmNlID0gcmVuZGVyV2l0aFN0cmVhbShjaGlsZEVsZW1lbnQsIGluc3RhbmNlICYmIGluc3RhbmNlLmNoaWxkSW5zdGFuY2UsIHN0YXRlLCBzdGF0ZU1hcClcbiAgICAgIGNvbnN0IGRvbSA9IGNoaWxkSW5zdGFuY2UuZG9tXG4gICAgICBuZXdJbnN0YW5jZSA9IHsgZG9tLCBlbGVtZW50LCBjaGlsZEluc3RhbmNlLCBwdWJsaWNJbnN0YW5jZSB9XG4gICAgfVxuICAgIHJldHVybiBuZXdJbnN0YW5jZVxuICB9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BzKGspIHtcbiAgaWYgKGsuc3RhcnRzV2l0aCgnb24nKSkgcmV0dXJuIGsudG9Mb3dlckNhc2UoKVxuICByZXR1cm4ga1xufSIsImltcG9ydCBPYnNlcnZhYmxlIGZyb20gJ3plbi1vYnNlcnZhYmxlJ1xuaW1wb3J0IHtmcm9tRXZlbnQsIHNjYW4sIG1lcmdlLCBzdGFydFdpdGgsIHN3aXRjaExhdGVzdH0gZnJvbSAnLi9zd3l4anMnXG5pbXBvcnQgZGlmZiBmcm9tICd2aXJ0dWFsLWRvbS9kaWZmJztcbmltcG9ydCBwYXRjaCBmcm9tICd2aXJ0dWFsLWRvbS9wYXRjaCc7XG5pbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICd2aXJ0dWFsLWRvbS9jcmVhdGUtZWxlbWVudCc7XG5pbXBvcnQgeyBjcmVhdGVDaGFuZ2VFbWl0dGVyIH0gZnJvbSAnY2hhbmdlLWVtaXR0ZXInXG5pbXBvcnQgeyByZW5kZXJTdHJlYW0gfSBmcm9tICcuL3JlY29uY2lsZXInXG5cbmV4cG9ydCBjb25zdCBzdGF0ZU1hcFBvaW50ZXIgPSBuZXcgTWFwKClcblxubGV0IGNpcmN1aXRCcmVha2VyID0gLTIwXG5cbmNvbnN0IGVtaXR0ZXIgPSBjcmVhdGVDaGFuZ2VFbWl0dGVyKClcbi8vIHNpbmdsZSBVSSB0aHJlYWQ7IHRoaXMgaXMgdGhlIG9ic2VydmFibGUgdGhhdCBzdGlja3MgYXJvdW5kIGFuZCBzd2FwcyBvdXQgc291cmNlXG5jb25zdCBVSXRocmVhZCA9IG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgZW1pdHRlci5saXN0ZW4oeCA9PiB7XG4gICAgLy8gZGVidWdnZXIgLy8gc3VjY2VzcyEgdGhyZWFkIHN3aXRjaGluZyFcbiAgICBvYnNlcnZlci5uZXh0KHgpXG4gIH0pXG59KVxuLy8gbW91bnQgdGhlIHZkb20gb24gdG8gdGhlIGRvbSBhbmQgXG4vLyBzZXQgdXAgdGhlIHJ1bnRpbWUgZnJvbSBzb3VyY2VzIGFuZFxuLy8gcGF0Y2ggdGhlIHZkb21cbi8vIC0tLVxuLy8gcmV0dXJucyBhbiB1bnN1YnNjcmliZSBtZXRob2QgeW91IGNhbiB1c2UgdG8gdW5tb3VudFxuZXhwb3J0IGZ1bmN0aW9uIG1vdW50KHJvb3RFbGVtZW50LCBjb250YWluZXIpIHtcbiAgLy8gaW5pdGlhbCwgdGhyb3dhd2F5LWlzaCBmcmFtZVxuICBsZXQge3NvdXJjZSwgaW5zdGFuY2V9ID0gcmVuZGVyU3RyZWFtKHJvb3RFbGVtZW50LCB7fSwgdW5kZWZpbmVkLCBzdGF0ZU1hcFBvaW50ZXIpXG4gIGxldCBpbnN0YW5jZVBvaW50ZXIgPSBpbnN0YW5jZVxuICBjb25zdCByb290Tm9kZSA9IGNyZWF0ZUVsZW1lbnQoaW5zdGFuY2UuZG9tKVxuICBjb25zdCBjb250YWluZXJDaGlsZCA9IGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZFxuICBpZiAoY29udGFpbmVyQ2hpbGQpIHtcbiAgICBjb250YWluZXIucmVwbGFjZUNoaWxkKHJvb3ROb2RlLGNvbnRhaW5lckNoaWxkKSAvLyBob3QgcmVsb2FkZWQgbW91bnRcbiAgfSBlbHNlIHtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocm9vdE5vZGUpIC8vIGluaXRpYWwgbW91bnRcbiAgfVxuICBsZXQgY3VycmVudFNyYyQgPSBudWxsXG4gIGxldCBTb1MgPSBzdGFydFdpdGgoVUl0aHJlYWQsIHNvdXJjZSkgLy8gc3RyZWFtIG9mIHN0cmVhbXNcbiAgcmV0dXJuIFNvUy5zdWJzY3JpYmUoXG4gICAgc3JjJCA9PiB7IC8vIHRoaXMgaXMgdGhlIGN1cnJlbnQgc291cmNlU3RyZWFtIHdlIGFyZSB3b3JraW5nIHdpdGhcbiAgICAgIGlmIChjdXJyZW50U3JjJCkgY29uc29sZS5sb2coJ3Vuc3ViIScpIHx8IGN1cnJlbnRTcmMkLnVuc3Vic2NyaWJlKCkgLy8gdW5zdWIgZnJvbSBvbGQgc3RyZWFtXG4gICAgICAvKioqKiBtYWluICovXG4gICAgICBjb25zdCBzb3VyY2UyJCA9IHNjYW4oXG4gICAgICAgIHNyYyQsIFxuICAgICAgICAoe2luc3RhbmNlLCBzdGF0ZU1hcH0sIG5leHRTdGF0ZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN0cmVhbU91dHB1dCA9IHJlbmRlclN0cmVhbShyb290RWxlbWVudCwgaW5zdGFuY2UsIG5leHRTdGF0ZSwgc3RhdGVNYXApXG4gICAgICAgICAgaWYgKHN0cmVhbU91dHB1dC5pc05ld1N0cmVhbSkgeyAvLyBxdWljayBjaGVja1xuICAgICAgICAgICAgY29uc3QgbmV4dFNvdXJjZSQgPSBzdHJlYW1PdXRwdXQuc291cmNlXG4gICAgICAgICAgICAvLyBkZWJ1Z2dlclxuICAgICAgICAgICAgaW5zdGFuY2VQb2ludGVyID0gc3RyZWFtT3V0cHV0Lmluc3RhbmNlXG4gICAgICAgICAgICBwYXRjaChyb290Tm9kZSwgZGlmZihpbnN0YW5jZS5kb20sIGluc3RhbmNlUG9pbnRlci5kb20pKSAvLyByZW5kZXIgdG8gc2NyZWVuXG4gICAgICAgICAgICBlbWl0dGVyLmVtaXQobmV4dFNvdXJjZSQpIC8vIHVwZGF0ZSB0aGUgVUkgdGhyZWFkOyBzb3VyY2Ugd2lsbCBzd2l0Y2hcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbmV4dGluc3RhbmNlID0gc3RyZWFtT3V0cHV0Lmluc3RhbmNlXG4gICAgICAgICAgICBwYXRjaChyb290Tm9kZSwgZGlmZihpbnN0YW5jZS5kb20sIG5leHRpbnN0YW5jZS5kb20pKSAvLyByZW5kZXIgdG8gc2NyZWVuXG4gICAgICAgICAgICByZXR1cm4ge2luc3RhbmNlOiBuZXh0aW5zdGFuY2UsIHN0YXRlTWFwOiBzdGF0ZU1hcH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtpbnN0YW5jZTogaW5zdGFuY2VQb2ludGVyLCBzdGF0ZU1hcDogc3RhdGVNYXBQb2ludGVyfSAvLyBhY2N1bXVsYXRvclxuICAgICAgKVxuICAgICAgLyoqKiogZW5kIG1haW4gKi9cbiAgICAgIGN1cnJlbnRTcmMkID0gXG4gICAgICAgIHNvdXJjZTIkXG4gICAgICAgICAgLnN1YnNjcmliZSgpXG4gICAgfVxuICApXG59XG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBjcmVhdGVIYW5kbGVyIH0gZnJvbSBcIi4vZWxlbWVudFwiO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XG5pbXBvcnQgeyByZW5kZXJTdHJlYW0gfSBmcm9tIFwiLi9yZWNvbmNpbGVyXCJcbmltcG9ydCB7IG1vdW50IH0gZnJvbSBcIi4vc2NoZWR1bGVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVuZGVyU3RyZWFtLFxuICBjcmVhdGVFbGVtZW50LFxuICBjcmVhdGVIYW5kbGVyLFxuICBDb21wb25lbnQsXG4gIG1vdW50XG59O1xuXG5leHBvcnQgeyBjcmVhdGVFbGVtZW50LCBjcmVhdGVIYW5kbGVyLCBDb21wb25lbnQsIFxuICByZW5kZXJTdHJlYW0sIFxuICBtb3VudCB9O1xuIl0sIm5hbWVzIjpbIlRFWFRfRUxFTUVOVCIsImNyZWF0ZUVsZW1lbnQiLCJ0eXBlIiwiY29uZmlnIiwicHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJhcmdzIiwiaGFzQ2hpbGRyZW4iLCJsZW5ndGgiLCJyYXdDaGlsZHJlbiIsImNvbmNhdCIsImNoaWxkcmVuIiwiZmlsdGVyIiwiYyIsIm1hcCIsImNyZWF0ZVRleHRFbGVtZW50IiwidmFsdWUiLCJub2RlVmFsdWUiLCJjcmVhdGVIYW5kbGVyIiwiX2ZuIiwiZW1pdHRlciIsImNyZWF0ZUNoYW5nZUVtaXR0ZXIiLCJoYW5kbGVyIiwiZW1pdCIsIngiLCIkIiwiT2JzZXJ2YWJsZSIsImxpc3RlbiIsIm5leHQiLCJOT0lOSVQiLCJTeW1ib2wiLCJzY2FuIiwib2JzIiwiY2IiLCJzZWVkIiwic3ViIiwiYWNjIiwiaGFzVmFsdWUiLCJoYXNTZWVkIiwic3Vic2NyaWJlIiwib2JzZXJ2ZXIiLCJjbG9zZWQiLCJmaXJzdCIsImUiLCJlcnJvciIsInN0YXJ0V2l0aCIsInZhbCIsIkNvbXBvbmVudCIsInN0YXRlIiwib2JqIiwic291cmNlcyIsImVudHJpZXMiLCJrIiwiZm4iLCJzdWJSZWR1Y2VyIiwic291cmNlIiwicmVkdWNlciIsIl8iLCJuIiwiaW5pdGlhbFN0YXRlIiwibWVyZ2UiLCJjcmVhdGVQdWJsaWNJbnN0YW5jZSIsImVsZW1lbnQiLCJwdWJsaWNJbnN0YW5jZSIsInJlbmRlclN0cmVhbSIsImluc3RhbmNlIiwic3RhdGVNYXAiLCJpc05ld1N0cmVhbSIsIm9mIiwiYWRkVG9TdHJlYW0iLCJfc291cmNlIiwibWFya05ld1N0cmVhbSIsIm5ld0luc3RhbmNlIiwicmVuZGVyIiwicmVuZGVyV2l0aFN0cmVhbSIsImlzRG9tRWxlbWVudCIsInJlc3QiLCJjaGlsZEluc3RhbmNlcyIsImVsIiwiaSIsIl9jaGlsZEluc3RhbmNlcyIsImNoaWxkSW5zdGFuY2UiLCJjaGlsZERvbXMiLCJkb20iLCJsY2FzZVByb3BzIiwiZm9yRWFjaCIsInYiLCJmb3JtYXRQcm9wcyIsIlZUZXh0IiwiaCIsImxvY2FsU3RhdGUiLCJnZXQiLCJ1bmRlZmluZWQiLCJrZXlzIiwic3JjIiwic3JjJCIsInNldCIsImV2ZW50IiwiY2hpbGRFbGVtZW50Iiwic3RhcnRzV2l0aCIsInRvTG93ZXJDYXNlIiwic3RhdGVNYXBQb2ludGVyIiwiTWFwIiwiVUl0aHJlYWQiLCJtb3VudCIsInJvb3RFbGVtZW50IiwiY29udGFpbmVyIiwiaW5zdGFuY2VQb2ludGVyIiwicm9vdE5vZGUiLCJjb250YWluZXJDaGlsZCIsImZpcnN0RWxlbWVudENoaWxkIiwicmVwbGFjZUNoaWxkIiwiYXBwZW5kQ2hpbGQiLCJjdXJyZW50U3JjJCIsIlNvUyIsImNvbnNvbGUiLCJsb2ciLCJ1bnN1YnNjcmliZSIsInNvdXJjZTIkIiwibmV4dFN0YXRlIiwic3RyZWFtT3V0cHV0IiwibmV4dFNvdXJjZSQiLCJkaWZmIiwibmV4dGluc3RhbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFHTyxJQUFNQSxlQUFlLGNBQXJCOztBQUVQLEFBQU8sU0FBU0MsZUFBVCxDQUF1QkMsSUFBdkIsRUFBNkJDLE1BQTdCLEVBQThDOzs7TUFDN0NDLFFBQVFDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCSCxNQUFsQixDQUFkOztvQ0FENkNJLElBQU07UUFBQTs7O01BRTdDQyxjQUFjRCxLQUFLRSxNQUFMLEdBQWMsQ0FBbEM7TUFDTUMsY0FBY0YsY0FBYyxZQUFHRyxNQUFILGFBQWFKLElBQWIsQ0FBZCxHQUFtQyxFQUF2RDtRQUNNSyxRQUFOLEdBQWlCRixZQUNkRyxNQURjLENBQ1A7V0FBS0Ms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
