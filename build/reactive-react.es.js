import Observable from 'zen-observable';
import { createChangeEmitter } from 'change-emitter';
import { merge } from 'zen-observable/extras';

var TEXT_ELEMENT = "TEXT ELEMENT";

function createElement(type, config) {
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
  return createElement(TEXT_ELEMENT, { nodeValue: value });
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

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement$1 = require('virtual-dom/create-element');

var _require = require('change-emitter');
var createChangeEmitter$1 = _require.createChangeEmitter;

var _require2 = require('./reconciler');
var renderStream = _require2.renderStream;

var stateMapPointer = new Map();

var emitter = createChangeEmitter$1();
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
  var rootNode = createElement$1(instance.dom);
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

// import { INITIALSOURCE } from "./reconciler";
var index = {
  // INITIALSOURCE,
  createElement: createElement,
  createHandler: createHandler,
  Component: Component,
  mount: mount
};

export { createElement, createHandler, Component, mount };export default index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3RpdmUtcmVhY3QuZXMuanMiLCJzb3VyY2VzIjpbIi4uL3JlYWN0aXZlLXJlYWN0L2VsZW1lbnQuanMiLCIuLi9yZWFjdGl2ZS1yZWFjdC9zd3l4anMuanMiLCIuLi9yZWFjdGl2ZS1yZWFjdC9jb21wb25lbnQuanMiLCIuLi9yZWFjdGl2ZS1yZWFjdC9zY2hlZHVsZXIuanMiLCIuLi9yZWFjdGl2ZS1yZWFjdC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT2JzZXJ2YWJsZSBmcm9tICd6ZW4tb2JzZXJ2YWJsZSdcbmltcG9ydCB7IGNyZWF0ZUNoYW5nZUVtaXR0ZXIgfSBmcm9tICdjaGFuZ2UtZW1pdHRlcidcblxuZXhwb3J0IGNvbnN0IFRFWFRfRUxFTUVOVCA9IFwiVEVYVCBFTEVNRU5UXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHR5cGUsIGNvbmZpZywgLi4uYXJncykge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZyk7XG4gIGNvbnN0IGhhc0NoaWxkcmVuID0gYXJncy5sZW5ndGggPiAwO1xuICBjb25zdCByYXdDaGlsZHJlbiA9IGhhc0NoaWxkcmVuID8gW10uY29uY2F0KC4uLmFyZ3MpIDogW107XG4gIHByb3BzLmNoaWxkcmVuID0gcmF3Q2hpbGRyZW5cbiAgICAuZmlsdGVyKGMgPT4gYyAhPSBudWxsICYmIGMgIT09IGZhbHNlKVxuICAgIC5tYXAoYyA9PiBjIGluc3RhbmNlb2YgT2JqZWN0ID8gYyA6IGNyZWF0ZVRleHRFbGVtZW50KGMpKTtcbiAgcmV0dXJuIHsgdHlwZSwgcHJvcHMgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dEVsZW1lbnQodmFsdWUpIHtcbiAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoVEVYVF9FTEVNRU5ULCB7IG5vZGVWYWx1ZTogdmFsdWUgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIYW5kbGVyKF9mbikge1xuICBjb25zdCBlbWl0dGVyID0gY3JlYXRlQ2hhbmdlRW1pdHRlcigpXG4gIGxldCBoYW5kbGVyID0geCA9PiB7XG4gICAgZW1pdHRlci5lbWl0KHgpXG4gIH1cbiAgaGFuZGxlci4kID0gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIHJldHVybiBlbWl0dGVyLmxpc3Rlbih2YWx1ZSA9PiB7XG4gICAgICBvYnNlcnZlci5uZXh0KF9mbiA/IF9mbih2YWx1ZSkgOiB2YWx1ZSlcbiAgICB9XG4gICAgKVxuICB9KVxuICByZXR1cm4gaGFuZGxlclxufSIsImltcG9ydCBPYnNlcnZhYmxlIGZyb20gJ3plbi1vYnNlcnZhYmxlJ1xuZXhwb3J0IHsgbWVyZ2UsIGNvbWJpbmVMYXRlc3QsIHppcCB9IGZyb20gJ3plbi1vYnNlcnZhYmxlL2V4dHJhcydcblxuZXhwb3J0IGZ1bmN0aW9uIEludGVydmFsKHRpY2sgPSAxMDAwLCB0aWNrRGF0YSA9IFN5bWJvbCgndGljaycpKSB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgbGV0IHRpbWVyID0gKCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHRpY2tEYXRhID09PSAnZnVuY3Rpb24nKSB0aWNrRGF0YSA9IHRpY2tEYXRhKClcbiAgICAgIG9ic2VydmVyLm5leHQodGlja0RhdGEpO1xuICAgICAgdGltZXIoKVxuICAgICAgLy8gb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9LCB0aWNrKTtcbiAgICB0aW1lcigpXG4gIFxuICAgIC8vIE9uIHVuc3Vic2NyaXB0aW9uLCBjYW5jZWwgdGhlIHRpbWVyXG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21FdmVudChlbCwgZXZlbnRUeXBlKSB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgY29uc3QgaGFuZGxlciA9IGUgPT4gb2JzZXJ2ZXIubmV4dChlKVxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyKVxuICAgIC8vIG9uIHVuc3ViLCByZW1vdmUgZXZlbnQgbGlzdGVuZXJcbiAgICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGhhbmRsZXIpXG4gIH0pXG59XG5cbmNvbnN0IE5PSU5JVCA9IFN5bWJvbCgnTk9fSU5JVElBTF9WQUxVRScpXG5leHBvcnQgZnVuY3Rpb24gc2NhbihvYnMsIGNiLCBzZWVkID0gTk9JTklUKSB7XG4gIGxldCBzdWIsIGFjYyA9IHNlZWQsIGhhc1ZhbHVlID0gZmFsc2VcbiAgY29uc3QgaGFzU2VlZCA9IGFjYyAhPT0gTk9JTklUXG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgc3ViID0gb2JzLnN1YnNjcmliZSh2YWx1ZSA9PiB7XG4gICAgICBpZiAob2JzZXJ2ZXIuY2xvc2VkKSByZXR1cm5cbiAgICAgIGxldCBmaXJzdCA9ICFoYXNWYWx1ZTtcbiAgICAgIGhhc1ZhbHVlID0gdHJ1ZVxuICAgICAgaWYgKCFmaXJzdCB8fCBoYXNTZWVkICkge1xuICAgICAgICB0cnkgeyBhY2MgPSBjYihhY2MsIHZhbHVlKSB9XG4gICAgICAgIGNhdGNoIChlKSB7IHJldHVybiBvYnNlcnZlci5lcnJvcihlKSB9XG4gICAgICAgIG9ic2VydmVyLm5leHQoYWNjKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhY2MgPSB2YWx1ZVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHN1YlxuICB9KVxufVxuXG4vLyBGbGF0dGVuIGEgY29sbGVjdGlvbiBvZiBvYnNlcnZhYmxlcyBhbmQgb25seSBvdXRwdXQgdGhlIG5ld2VzdCBmcm9tIGVhY2hcbmV4cG9ydCBmdW5jdGlvbiBzd2l0Y2hMYXRlc3QoaGlnaGVyT2JzZXJ2YWJsZSkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIGxldCBjdXJyZW50T2JzID0gbnVsbFxuICAgIHJldHVybiBoaWdoZXJPYnNlcnZhYmxlLnN1YnNjcmliZSh7XG4gICAgICBuZXh0KG9icykge1xuICAgICAgICBpZiAoY3VycmVudE9icykgY3VycmVudE9icy51bnN1YnNjcmliZSgpIC8vIHVuc3ViIGFuZCBzd2l0Y2hcbiAgICAgICAgY3VycmVudE9icyA9IG9icy5zdWJzY3JpYmUob2JzZXJ2ZXIuc3Vic2NyaWJlKVxuICAgICAgfSxcbiAgICAgIGVycm9yKGUpIHtcbiAgICAgICAgb2JzZXJ2ZXIuZXJyb3IoZSkgLy8gdW50ZXN0ZWRcbiAgICAgIH0sXG4gICAgICBjb21wbGV0ZSgpIHtcbiAgICAgICAgLy8gaSBkb250IHRoaW5rIGl0IHNob3VsZCBjb21wbGV0ZT9cbiAgICAgICAgLy8gb2JzZXJ2ZXIuY29tcGxldGUoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwVG9Db25zdGFudChvYnMsIHZhbCkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIGNvbnN0IGhhbmRsZXIgPSBvYnMuc3Vic2NyaWJlKCgpID0+IG9ic2VydmVyLm5leHQodmFsKSlcbiAgICByZXR1cm4gaGFuZGxlclxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXaXRoKG9icywgdmFsKSB7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZShvYnNlcnZlciA9PiB7XG4gICAgb2JzZXJ2ZXIubmV4dCh2YWwpIC8vIGltbWVkaWF0ZWx5IG91dHB1dCB0aGlzIHZhbHVlXG4gICAgY29uc3QgaGFuZGxlciA9IG9icy5zdWJzY3JpYmUoeCA9PiBvYnNlcnZlci5uZXh0KHgpKVxuICAgIHJldHVybiAoKSA9PiBoYW5kbGVyKClcbiAgfSlcbn0iLCIvLyBpbXBvcnQgeyByZWNvbmNpbGUgfSBmcm9tIFwiLi9yZWNvbmNpbGVyXCI7XG5pbXBvcnQge0ludGVydmFsLCBzY2FuLCBzdGFydFdpdGgsIG1lcmdlLCBtYXBUb0NvbnN0YW50fSBmcm9tICcuL3N3eXhqcydcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuICB9XG5cbiAgLy8gc2V0U3RhdGUocGFydGlhbFN0YXRlKSB7XG4gIC8vICAgdGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUsIHBhcnRpYWxTdGF0ZSk7XG4gIC8vICAgdXBkYXRlSW5zdGFuY2UodGhpcy5fX2ludGVybmFsSW5zdGFuY2UpO1xuICAvLyB9XG5cbiAgLy8gY2xhc3MgbWV0aG9kIGJlY2F1c2UgaXQgZmVlZHMgaW4gdGhpcy5pbml0aWFsU3RhdGVcbiAgY29tYmluZVJlZHVjZXIob2JqKSB7XG4gICAgY29uc3Qgc291cmNlcyA9IE9iamVjdC5lbnRyaWVzKG9iaikubWFwKChbayxmbl0pID0+IHtcbiAgICAgIGxldCBzdWJSZWR1Y2VyID0gZm4ob2JqKVxuICAgICAgLy8gdGhlcmUgYXJlIHR3byBmb3JtcyBvZiByZXR1cm4gdGhlIHN1YnJlZHVjZXIgY2FuIGhhdmVcbiAgICAgIC8vIHN0cmFpZ2h0IHN0cmVhbSBmb3JtXG4gICAgICAvLyBvciBvYmplY3QgZm9ybSB3aGVyZSB3ZSBuZWVkIHRvIHNjYW4gaXQgaW50byBzdHJpbmdcbiAgICAgIGlmIChzdWJSZWR1Y2VyLnNvdXJjZSAmJiBzdWJSZWR1Y2VyLnJlZHVjZXIpIHsgLy8gb2JqZWN0IGZvcm1cbiAgICAgICAgc3ViUmVkdWNlciA9IHNjYW4oc3ViUmVkdWNlci5zb3VyY2UsIFxuICAgICAgICAgIHN1YlJlZHVjZXIucmVkdWNlciB8fCAoKF8sIG4pID0+IG4pLCBcbiAgICAgICAgICB0aGlzLmluaXRpYWxTdGF0ZVtrXVxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gc3ViUmVkdWNlclxuICAgICAgICAubWFwKHggPT4gKHtba106IHh9KSkgLy8gbWFwIHRvIGl0cyBwYXJ0aWN1bGFyIG5hbWVzcGFjZVxuICAgIH0pXG4gICAgY29uc3Qgc291cmNlID0gbWVyZ2UoLi4uc291cmNlcylcbiAgICBjb25zdCByZWR1Y2VyID0gKGFjYywgbikgPT4gKHsuLi5hY2MsIC4uLm59KVxuICAgIHJldHVybiB7c291cmNlLCByZWR1Y2VyfVxuICB9XG59XG5cbi8vIGZ1bmN0aW9uIHVwZGF0ZUluc3RhbmNlKGludGVybmFsSW5zdGFuY2UpIHtcbi8vICAgY29uc3QgcGFyZW50RG9tID0gaW50ZXJuYWxJbnN0YW5jZS5kb20ucGFyZW50Tm9kZTtcbi8vICAgY29uc3QgZWxlbWVudCA9IGludGVybmFsSW5zdGFuY2UuZWxlbWVudDtcbi8vICAgcmVjb25jaWxlKHBhcmVudERvbSwgaW50ZXJuYWxJbnN0YW5jZSwgZWxlbWVudCk7XG4vLyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQdWJsaWNJbnN0YW5jZShlbGVtZW50LyosIGludGVybmFsSW5zdGFuY2UqLykge1xuICBjb25zdCB7IHR5cGUsIHByb3BzIH0gPSBlbGVtZW50O1xuICBjb25zdCBwdWJsaWNJbnN0YW5jZSA9IG5ldyB0eXBlKHByb3BzKTtcbiAgLy8gcHVibGljSW5zdGFuY2UuX19pbnRlcm5hbEluc3RhbmNlID0gaW50ZXJuYWxJbnN0YW5jZTtcbiAgcmV0dXJuIHB1YmxpY0luc3RhbmNlO1xufVxuIiwiaW1wb3J0IE9ic2VydmFibGUgZnJvbSAnemVuLW9ic2VydmFibGUnXG5pbXBvcnQge2Zyb21FdmVudCwgc2NhbiwgbWVyZ2UsIHN0YXJ0V2l0aCwgc3dpdGNoTGF0ZXN0fSBmcm9tICcuL3N3eXhqcydcbnZhciBkaWZmID0gcmVxdWlyZSgndmlydHVhbC1kb20vZGlmZicpO1xudmFyIHBhdGNoID0gcmVxdWlyZSgndmlydHVhbC1kb20vcGF0Y2gnKTtcbnZhciBjcmVhdGVFbGVtZW50ID0gcmVxdWlyZSgndmlydHVhbC1kb20vY3JlYXRlLWVsZW1lbnQnKTtcbnZhciB7IGNyZWF0ZUNoYW5nZUVtaXR0ZXIgfSA9IHJlcXVpcmUoJ2NoYW5nZS1lbWl0dGVyJylcbnZhciB7IHJlbmRlclN0cmVhbSB9ID0gcmVxdWlyZSgnLi9yZWNvbmNpbGVyJylcblxuZXhwb3J0IGNvbnN0IHN0YXRlTWFwUG9pbnRlciA9IG5ldyBNYXAoKVxuXG5sZXQgY2lyY3VpdEJyZWFrZXIgPSAtMjBcblxuY29uc3QgZW1pdHRlciA9IGNyZWF0ZUNoYW5nZUVtaXR0ZXIoKVxuLy8gc2luZ2xlIFVJIHRocmVhZDsgdGhpcyBpcyB0aGUgb2JzZXJ2YWJsZSB0aGF0IHN0aWNrcyBhcm91bmQgYW5kIHN3YXBzIG91dCBzb3VyY2VcbmNvbnN0IFVJdGhyZWFkID0gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICBlbWl0dGVyLmxpc3Rlbih4ID0+IHtcbiAgICAvLyBkZWJ1Z2dlciAvLyBzdWNjZXNzISB0aHJlYWQgc3dpdGNoaW5nIVxuICAgIG9ic2VydmVyLm5leHQoeClcbiAgfSlcbn0pXG4vLyBtb3VudCB0aGUgdmRvbSBvbiB0byB0aGUgZG9tIGFuZCBcbi8vIHNldCB1cCB0aGUgcnVudGltZSBmcm9tIHNvdXJjZXMgYW5kXG4vLyBwYXRjaCB0aGUgdmRvbVxuLy8gLS0tXG4vLyByZXR1cm5zIGFuIHVuc3Vic2NyaWJlIG1ldGhvZCB5b3UgY2FuIHVzZSB0byB1bm1vdW50XG5leHBvcnQgZnVuY3Rpb24gbW91bnQocm9vdEVsZW1lbnQsIGNvbnRhaW5lcikge1xuICAvLyBpbml0aWFsLCB0aHJvd2F3YXktaXNoIGZyYW1lXG4gIGxldCB7c291cmNlLCBpbnN0YW5jZX0gPSByZW5kZXJTdHJlYW0ocm9vdEVsZW1lbnQsIHt9LCB1bmRlZmluZWQsIHN0YXRlTWFwUG9pbnRlcilcbiAgbGV0IGluc3RhbmNlUG9pbnRlciA9IGluc3RhbmNlXG4gIGNvbnN0IHJvb3ROb2RlID0gY3JlYXRlRWxlbWVudChpbnN0YW5jZS5kb20pXG4gIGNvbnN0IGNvbnRhaW5lckNoaWxkID0gY29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkXG4gIGlmIChjb250YWluZXJDaGlsZCkge1xuICAgIGNvbnRhaW5lci5yZXBsYWNlQ2hpbGQocm9vdE5vZGUsY29udGFpbmVyQ2hpbGQpIC8vIGhvdCByZWxvYWRlZCBtb3VudFxuICB9IGVsc2Uge1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyb290Tm9kZSkgLy8gaW5pdGlhbCBtb3VudFxuICB9XG4gIGxldCBjdXJyZW50U3JjJCA9IG51bGxcbiAgbGV0IFNvUyA9IHN0YXJ0V2l0aChVSXRocmVhZCwgc291cmNlKSAvLyBzdHJlYW0gb2Ygc3RyZWFtc1xuICByZXR1cm4gU29TLnN1YnNjcmliZShcbiAgICBzcmMkID0+IHsgLy8gdGhpcyBpcyB0aGUgY3VycmVudCBzb3VyY2VTdHJlYW0gd2UgYXJlIHdvcmtpbmcgd2l0aFxuICAgICAgaWYgKGN1cnJlbnRTcmMkKSBjb25zb2xlLmxvZygndW5zdWIhJykgfHwgY3VycmVudFNyYyQudW5zdWJzY3JpYmUoKSAvLyB1bnN1YiBmcm9tIG9sZCBzdHJlYW1cbiAgICAgIC8qKioqIG1haW4gKi9cbiAgICAgIGNvbnN0IHNvdXJjZTIkID0gc2NhbihcbiAgICAgICAgc3JjJCwgXG4gICAgICAgICh7aW5zdGFuY2UsIHN0YXRlTWFwfSwgbmV4dFN0YXRlKSA9PiB7XG4gICAgICAgICAgY29uc3Qgc3RyZWFtT3V0cHV0ID0gcmVuZGVyU3RyZWFtKHJvb3RFbGVtZW50LCBpbnN0YW5jZSwgbmV4dFN0YXRlLCBzdGF0ZU1hcClcbiAgICAgICAgICBpZiAoc3RyZWFtT3V0cHV0LmlzTmV3U3RyZWFtKSB7IC8vIHF1aWNrIGNoZWNrXG4gICAgICAgICAgICBjb25zdCBuZXh0U291cmNlJCA9IHN0cmVhbU91dHB1dC5zb3VyY2VcbiAgICAgICAgICAgIC8vIGRlYnVnZ2VyXG4gICAgICAgICAgICBpbnN0YW5jZVBvaW50ZXIgPSBzdHJlYW1PdXRwdXQuaW5zdGFuY2VcbiAgICAgICAgICAgIHBhdGNoKHJvb3ROb2RlLCBkaWZmKGluc3RhbmNlLmRvbSwgaW5zdGFuY2VQb2ludGVyLmRvbSkpIC8vIHJlbmRlciB0byBzY3JlZW5cbiAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChuZXh0U291cmNlJCkgLy8gdXBkYXRlIHRoZSBVSSB0aHJlYWQ7IHNvdXJjZSB3aWxsIHN3aXRjaFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0aW5zdGFuY2UgPSBzdHJlYW1PdXRwdXQuaW5zdGFuY2VcbiAgICAgICAgICAgIHBhdGNoKHJvb3ROb2RlLCBkaWZmKGluc3RhbmNlLmRvbSwgbmV4dGluc3RhbmNlLmRvbSkpIC8vIHJlbmRlciB0byBzY3JlZW5cbiAgICAgICAgICAgIHJldHVybiB7aW5zdGFuY2U6IG5leHRpbnN0YW5jZSwgc3RhdGVNYXA6IHN0YXRlTWFwfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge2luc3RhbmNlOiBpbnN0YW5jZVBvaW50ZXIsIHN0YXRlTWFwOiBzdGF0ZU1hcFBvaW50ZXJ9IC8vIGFjY3VtdWxhdG9yXG4gICAgICApXG4gICAgICAvKioqKiBlbmQgbWFpbiAqL1xuICAgICAgY3VycmVudFNyYyQgPSBcbiAgICAgICAgc291cmNlMiRcbiAgICAgICAgICAuc3Vic2NyaWJlKClcbiAgICB9XG4gIClcbn1cbiIsImltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIGNyZWF0ZUhhbmRsZXIgfSBmcm9tIFwiLi9lbGVtZW50XCI7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcbi8vIGltcG9ydCB7IElOSVRJQUxTT1VSQ0UgfSBmcm9tIFwiLi9yZWNvbmNpbGVyXCI7XG5pbXBvcnQgeyBtb3VudCB9IGZyb20gXCIuL3NjaGVkdWxlclwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8vIElOSVRJQUxTT1VSQ0UsXG4gIGNyZWF0ZUVsZW1lbnQsXG4gIGNyZWF0ZUhhbmRsZXIsXG4gIENvbXBvbmVudCxcbiAgbW91bnRcbn07XG5cbmV4cG9ydCB7IGNyZWF0ZUVsZW1lbnQsIGNyZWF0ZUhhbmRsZXIsIENvbXBvbmVudCwgXG4gIC8vIElOSVRJQUxTT1VSQ0UsIFxuICBtb3VudCB9O1xuIl0sIm5hbWVzIjpbIlRFWFRfRUxFTUVOVCIsImNyZWF0ZUVsZW1lbnQiLCJ0eXBlIiwiY29uZmlnIiwicHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJhcmdzIiwiaGFzQ2hpbGRyZW4iLCJsZW5ndGgiLCJyYXdDaGlsZHJlbiIsImNvbmNhdCIsImNoaWxkcmVuIiwiZmlsdGVyIiwiYyIsIm1hcCIsImNyZWF0ZVRleHRFbGVtZW50IiwidmFsdWUiLCJub2RlVmFsdWUiLCJjcmVhdGVIYW5kbGVyIiwiX2ZuIiwiZW1pdHRlciIsImNyZWF0ZUNoYW5nZUVtaXR0ZXIiLCJoYW5kbGVyIiwiZW1pdCIsIngiLCIkIiwiT2JzZXJ2YWJsZSIsImxpc3RlbiIsIm5leHQiLCJOT0lOSVQiLCJTeW1ib2wiLCJzY2FuIiwib2JzIiwiY2IiLCJzZWVkIiwic3ViIiwiYWNjIiwiaGFzVmFsdWUiLCJoYXNTZWVkIiwic3Vic2NyaWJlIiwib2JzZXJ2ZXIiLCJjbG9zZWQiLCJmaXJzdCIsImUiLCJlcnJvciIsInN0YXJ0V2l0aCIsInZhbCIsIkNvbXBvbmVudCIsInN0YXRlIiwib2JqIiwic291cmNlcyIsImVudHJpZXMiLCJrIiwiZm4iLCJzdWJSZWR1Y2VyIiwic291cmNlIiwicmVkdWNlciIsIl8iLCJuIiwiaW5pdGlhbFN0YXRlIiwibWVyZ2UiLCJkaWZmIiwicmVxdWlyZSIsInBhdGNoIiwicmVuZGVyU3RyZWFtIiwic3RhdGVNYXBQb2ludGVyIiwiTWFwIiwiVUl0aHJlYWQiLCJtb3VudCIsInJvb3RFbGVtZW50IiwiY29udGFpbmVyIiwidW5kZWZpbmVkIiwiaW5zdGFuY2UiLCJpbnN0YW5jZVBvaW50ZXIiLCJyb290Tm9kZSIsImRvbSIsImNvbnRhaW5lckNoaWxkIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJyZXBsYWNlQ2hpbGQiLCJhcHBlbmRDaGlsZCIsImN1cnJlbnRTcmMkIiwiU29TIiwiY29uc29sZSIsImxvZyIsInVuc3Vic2NyaWJlIiwic291cmNlMiQiLCJzcmMkIiwibmV4dFN0YXRlIiwic3RhdGVNYXAiLCJzdHJlYW1PdXRwdXQiLCJpc05ld1N0cmVhbSIsIm5leHRTb3VyY2UkIiwibmV4dGluc3RhbmNlIl0sIm1hcHBpbmdzIjoiOzs7O0FBR08sSUFBTUEsZUFBZSxjQUFyQjs7QUFFUCxBQUFPLFNBQVNDLGFBQVQsQ0FBdUJDLElBQXZCLEVBQTZCQyxNQUE3QixFQUE4Qzs7O01BQzdDQyxRQUFRQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQkgsTUFBbEIsQ0FBZDs7b0NBRDZDSSxJQUFNO1FBQUE7OztNQUU3Q0MsY0FBY0QsS0FBS0UsTUFBTCxHQUFjLENBQWxDO01BQ01DLGNBQWNGLGNBQWMsWUFBR0csTUFBSCxhQUFhSixJQUFiLENBQWQsR0FBbUMsRUFBdkQ7UUFDTUssUUFBTixHQUFpQkYsWUFDZEcsTUFEYyxDQUNQO1dBQUtDLEtBQUssSUFBTCxJQUFhQSxNQUFNLEtBQXhCO0dBRE8sRUFFZEMsR0FGYyxDQUVWO1dBQUtELGFBQWFULE1BQWIsR0FBc0JTLENBQXRCLEdBQTBCRSxrQkFBa0JGLENBQWxCLENBQS9CO0dBRlUsQ0FBakI7U0FHTyxFQUFFWixVQUFGLEVBQVFFLFlBQVIsRUFBUDs7O0FBR0YsU0FBU1ksaUJBQVQsQ0FBMkJDLEtBQTNCLEVBQWtDO1NBQ3pCaEIsY0FBY0QsWUFBZCxFQUE0QixFQUFFa0IsV0FBV0QsS0FBYixFQUE1QixDQUFQOzs7QUFHRixBQUFPLFNBQVNFLGFBQVQsQ0FBdUJDLEdBQXZCLEVBQTRCO01BQzNCQyxVQUFVQyxxQkFBaEI7TUFDSUMsVUFBVSxTQUFWQSxPQUFVLElBQUs7WUFDVEMsSUFBUixDQUFhQyxDQUFiO0dBREY7VUFHUUMsQ0FBUixHQUFZLElBQUlDLFVBQUosQ0FBZSxvQkFBWTtXQUM5Qk4sUUFBUU8sTUFBUixDQUFlLGlCQUFTO2VBQ3BCQyxJQUFULENBQWNULE1BQU1BLElBQUlI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
