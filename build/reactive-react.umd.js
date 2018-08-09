(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('zen-observable'), require('change-emitter'), require('zen-observable/extras')) :
	typeof define === 'function' && define.amd ? define(['exports', 'zen-observable', 'change-emitter', 'zen-observable/extras'], factory) :
	(factory((global['reactive-react'] = global['reactive-react'] || {}),global.Observable,global.changeEmitter,global.zenObservable_extras));
}(this, (function (exports,Observable,changeEmitter,zenObservable_extras) { 'use strict';

Observable = 'default' in Observable ? Observable['default'] : Observable;

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

exports['default'] = index;
exports.createElement = createElement;
exports.createHandler = createHandler;
exports.Component = Component;
exports.mount = mount;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3RpdmUtcmVhY3QudW1kLmpzIiwic291cmNlcyI6WyIuLi9yZWFjdGl2ZS1yZWFjdC9lbGVtZW50LmpzIiwiLi4vcmVhY3RpdmUtcmVhY3Qvc3d5eGpzLmpzIiwiLi4vcmVhY3RpdmUtcmVhY3QvY29tcG9uZW50LmpzIiwiLi4vcmVhY3RpdmUtcmVhY3Qvc2NoZWR1bGVyLmpzIiwiLi4vcmVhY3RpdmUtcmVhY3QvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9ic2VydmFibGUgZnJvbSAnemVuLW9ic2VydmFibGUnXG5pbXBvcnQgeyBjcmVhdGVDaGFuZ2VFbWl0dGVyIH0gZnJvbSAnY2hhbmdlLWVtaXR0ZXInXG5cbmV4cG9ydCBjb25zdCBURVhUX0VMRU1FTlQgPSBcIlRFWFQgRUxFTUVOVFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0eXBlLCBjb25maWcsIC4uLmFyZ3MpIHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBjb25maWcpO1xuICBjb25zdCBoYXNDaGlsZHJlbiA9IGFyZ3MubGVuZ3RoID4gMDtcbiAgY29uc3QgcmF3Q2hpbGRyZW4gPSBoYXNDaGlsZHJlbiA/IFtdLmNvbmNhdCguLi5hcmdzKSA6IFtdO1xuICBwcm9wcy5jaGlsZHJlbiA9IHJhd0NoaWxkcmVuXG4gICAgLmZpbHRlcihjID0+IGMgIT0gbnVsbCAmJiBjICE9PSBmYWxzZSlcbiAgICAubWFwKGMgPT4gYyBpbnN0YW5jZW9mIE9iamVjdCA/IGMgOiBjcmVhdGVUZXh0RWxlbWVudChjKSk7XG4gIHJldHVybiB7IHR5cGUsIHByb3BzIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRFbGVtZW50KHZhbHVlKSB7XG4gIHJldHVybiBjcmVhdGVFbGVtZW50KFRFWFRfRUxFTUVOVCwgeyBub2RlVmFsdWU6IHZhbHVlIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGFuZGxlcihfZm4pIHtcbiAgY29uc3QgZW1pdHRlciA9IGNyZWF0ZUNoYW5nZUVtaXR0ZXIoKVxuICBsZXQgaGFuZGxlciA9IHggPT4ge1xuICAgIGVtaXR0ZXIuZW1pdCh4KVxuICB9XG4gIGhhbmRsZXIuJCA9IG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW4odmFsdWUgPT4ge1xuICAgICAgb2JzZXJ2ZXIubmV4dChfZm4gPyBfZm4odmFsdWUpIDogdmFsdWUpXG4gICAgfVxuICAgIClcbiAgfSlcbiAgcmV0dXJuIGhhbmRsZXJcbn0iLCJpbXBvcnQgT2JzZXJ2YWJsZSBmcm9tICd6ZW4tb2JzZXJ2YWJsZSdcbmV4cG9ydCB7IG1lcmdlLCBjb21iaW5lTGF0ZXN0LCB6aXAgfSBmcm9tICd6ZW4tb2JzZXJ2YWJsZS9leHRyYXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBJbnRlcnZhbCh0aWNrID0gMTAwMCwgdGlja0RhdGEgPSBTeW1ib2woJ3RpY2snKSkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIGxldCB0aW1lciA9ICgpID0+IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0aWNrRGF0YSA9PT0gJ2Z1bmN0aW9uJykgdGlja0RhdGEgPSB0aWNrRGF0YSgpXG4gICAgICBvYnNlcnZlci5uZXh0KHRpY2tEYXRhKTtcbiAgICAgIHRpbWVyKClcbiAgICAgIC8vIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgfSwgdGljayk7XG4gICAgdGltZXIoKVxuICBcbiAgICAvLyBPbiB1bnN1YnNjcmlwdGlvbiwgY2FuY2VsIHRoZSB0aW1lclxuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQodGltZXIpO1xuXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tRXZlbnQoZWwsIGV2ZW50VHlwZSkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIGNvbnN0IGhhbmRsZXIgPSBlID0+IG9ic2VydmVyLm5leHQoZSlcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlcilcbiAgICAvLyBvbiB1bnN1YiwgcmVtb3ZlIGV2ZW50IGxpc3RlbmVyXG4gICAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyKVxuICB9KVxufVxuXG5jb25zdCBOT0lOSVQgPSBTeW1ib2woJ05PX0lOSVRJQUxfVkFMVUUnKVxuZXhwb3J0IGZ1bmN0aW9uIHNjYW4ob2JzLCBjYiwgc2VlZCA9IE5PSU5JVCkge1xuICBsZXQgc3ViLCBhY2MgPSBzZWVkLCBoYXNWYWx1ZSA9IGZhbHNlXG4gIGNvbnN0IGhhc1NlZWQgPSBhY2MgIT09IE5PSU5JVFxuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIHN1YiA9IG9icy5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgICAgaWYgKG9ic2VydmVyLmNsb3NlZCkgcmV0dXJuXG4gICAgICBsZXQgZmlyc3QgPSAhaGFzVmFsdWU7XG4gICAgICBoYXNWYWx1ZSA9IHRydWVcbiAgICAgIGlmICghZmlyc3QgfHwgaGFzU2VlZCApIHtcbiAgICAgICAgdHJ5IHsgYWNjID0gY2IoYWNjLCB2YWx1ZSkgfVxuICAgICAgICBjYXRjaCAoZSkgeyByZXR1cm4gb2JzZXJ2ZXIuZXJyb3IoZSkgfVxuICAgICAgICBvYnNlcnZlci5uZXh0KGFjYyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYWNjID0gdmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBzdWJcbiAgfSlcbn1cblxuLy8gRmxhdHRlbiBhIGNvbGxlY3Rpb24gb2Ygb2JzZXJ2YWJsZXMgYW5kIG9ubHkgb3V0cHV0IHRoZSBuZXdlc3QgZnJvbSBlYWNoXG5leHBvcnQgZnVuY3Rpb24gc3dpdGNoTGF0ZXN0KGhpZ2hlck9ic2VydmFibGUpIHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBsZXQgY3VycmVudE9icyA9IG51bGxcbiAgICByZXR1cm4gaGlnaGVyT2JzZXJ2YWJsZS5zdWJzY3JpYmUoe1xuICAgICAgbmV4dChvYnMpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRPYnMpIGN1cnJlbnRPYnMudW5zdWJzY3JpYmUoKSAvLyB1bnN1YiBhbmQgc3dpdGNoXG4gICAgICAgIGN1cnJlbnRPYnMgPSBvYnMuc3Vic2NyaWJlKG9ic2VydmVyLnN1YnNjcmliZSlcbiAgICAgIH0sXG4gICAgICBlcnJvcihlKSB7XG4gICAgICAgIG9ic2VydmVyLmVycm9yKGUpIC8vIHVudGVzdGVkXG4gICAgICB9LFxuICAgICAgY29tcGxldGUoKSB7XG4gICAgICAgIC8vIGkgZG9udCB0aGluayBpdCBzaG91bGQgY29tcGxldGU/XG4gICAgICAgIC8vIG9ic2VydmVyLmNvbXBsZXRlKClcbiAgICAgIH1cbiAgICB9KVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvQ29uc3RhbnQob2JzLCB2YWwpIHtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICBjb25zdCBoYW5kbGVyID0gb2JzLnN1YnNjcmliZSgoKSA9PiBvYnNlcnZlci5uZXh0KHZhbCkpXG4gICAgcmV0dXJuIGhhbmRsZXJcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0V2l0aChvYnMsIHZhbCkge1xuICByZXR1cm4gbmV3IE9ic2VydmFibGUob2JzZXJ2ZXIgPT4ge1xuICAgIG9ic2VydmVyLm5leHQodmFsKSAvLyBpbW1lZGlhdGVseSBvdXRwdXQgdGhpcyB2YWx1ZVxuICAgIGNvbnN0IGhhbmRsZXIgPSBvYnMuc3Vic2NyaWJlKHggPT4gb2JzZXJ2ZXIubmV4dCh4KSlcbiAgICByZXR1cm4gKCkgPT4gaGFuZGxlcigpXG4gIH0pXG59IiwiLy8gaW1wb3J0IHsgcmVjb25jaWxlIH0gZnJvbSBcIi4vcmVjb25jaWxlclwiO1xuaW1wb3J0IHtJbnRlcnZhbCwgc2Nhbiwgc3RhcnRXaXRoLCBtZXJnZSwgbWFwVG9Db25zdGFudH0gZnJvbSAnLi9zd3l4anMnXG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZSB8fCB7fTtcbiAgfVxuXG4gIC8vIHNldFN0YXRlKHBhcnRpYWxTdGF0ZSkge1xuICAvLyAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLCBwYXJ0aWFsU3RhdGUpO1xuICAvLyAgIHVwZGF0ZUluc3RhbmNlKHRoaXMuX19pbnRlcm5hbEluc3RhbmNlKTtcbiAgLy8gfVxuXG4gIC8vIGNsYXNzIG1ldGhvZCBiZWNhdXNlIGl0IGZlZWRzIGluIHRoaXMuaW5pdGlhbFN0YXRlXG4gIGNvbWJpbmVSZWR1Y2VyKG9iaikge1xuICAgIGNvbnN0IHNvdXJjZXMgPSBPYmplY3QuZW50cmllcyhvYmopLm1hcCgoW2ssZm5dKSA9PiB7XG4gICAgICBsZXQgc3ViUmVkdWNlciA9IGZuKG9iailcbiAgICAgIC8vIHRoZXJlIGFyZSB0d28gZm9ybXMgb2YgcmV0dXJuIHRoZSBzdWJyZWR1Y2VyIGNhbiBoYXZlXG4gICAgICAvLyBzdHJhaWdodCBzdHJlYW0gZm9ybVxuICAgICAgLy8gb3Igb2JqZWN0IGZvcm0gd2hlcmUgd2UgbmVlZCB0byBzY2FuIGl0IGludG8gc3RyaW5nXG4gICAgICBpZiAoc3ViUmVkdWNlci5zb3VyY2UgJiYgc3ViUmVkdWNlci5yZWR1Y2VyKSB7IC8vIG9iamVjdCBmb3JtXG4gICAgICAgIHN1YlJlZHVjZXIgPSBzY2FuKHN1YlJlZHVjZXIuc291cmNlLCBcbiAgICAgICAgICBzdWJSZWR1Y2VyLnJlZHVjZXIgfHwgKChfLCBuKSA9PiBuKSwgXG4gICAgICAgICAgdGhpcy5pbml0aWFsU3RhdGVba11cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN1YlJlZHVjZXJcbiAgICAgICAgLm1hcCh4ID0+ICh7W2tdOiB4fSkpIC8vIG1hcCB0byBpdHMgcGFydGljdWxhciBuYW1lc3BhY2VcbiAgICB9KVxuICAgIGNvbnN0IHNvdXJjZSA9IG1lcmdlKC4uLnNvdXJjZXMpXG4gICAgY29uc3QgcmVkdWNlciA9IChhY2MsIG4pID0+ICh7Li4uYWNjLCAuLi5ufSlcbiAgICByZXR1cm4ge3NvdXJjZSwgcmVkdWNlcn1cbiAgfVxufVxuXG4vLyBmdW5jdGlvbiB1cGRhdGVJbnN0YW5jZShpbnRlcm5hbEluc3RhbmNlKSB7XG4vLyAgIGNvbnN0IHBhcmVudERvbSA9IGludGVybmFsSW5zdGFuY2UuZG9tLnBhcmVudE5vZGU7XG4vLyAgIGNvbnN0IGVsZW1lbnQgPSBpbnRlcm5hbEluc3RhbmNlLmVsZW1lbnQ7XG4vLyAgIHJlY29uY2lsZShwYXJlbnREb20sIGludGVybmFsSW5zdGFuY2UsIGVsZW1lbnQpO1xuLy8gfVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHVibGljSW5zdGFuY2UoZWxlbWVudC8qLCBpbnRlcm5hbEluc3RhbmNlKi8pIHtcbiAgY29uc3QgeyB0eXBlLCBwcm9wcyB9ID0gZWxlbWVudDtcbiAgY29uc3QgcHVibGljSW5zdGFuY2UgPSBuZXcgdHlwZShwcm9wcyk7XG4gIC8vIHB1YmxpY0luc3RhbmNlLl9faW50ZXJuYWxJbnN0YW5jZSA9IGludGVybmFsSW5zdGFuY2U7XG4gIHJldHVybiBwdWJsaWNJbnN0YW5jZTtcbn1cbiIsImltcG9ydCBPYnNlcnZhYmxlIGZyb20gJ3plbi1vYnNlcnZhYmxlJ1xuaW1wb3J0IHtmcm9tRXZlbnQsIHNjYW4sIG1lcmdlLCBzdGFydFdpdGgsIHN3aXRjaExhdGVzdH0gZnJvbSAnLi9zd3l4anMnXG52YXIgZGlmZiA9IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL2RpZmYnKTtcbnZhciBwYXRjaCA9IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3BhdGNoJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL2NyZWF0ZS1lbGVtZW50Jyk7XG52YXIgeyBjcmVhdGVDaGFuZ2VFbWl0dGVyIH0gPSByZXF1aXJlKCdjaGFuZ2UtZW1pdHRlcicpXG52YXIgeyByZW5kZXJTdHJlYW0gfSA9IHJlcXVpcmUoJy4vcmVjb25jaWxlcicpXG5cbmV4cG9ydCBjb25zdCBzdGF0ZU1hcFBvaW50ZXIgPSBuZXcgTWFwKClcblxubGV0IGNpcmN1aXRCcmVha2VyID0gLTIwXG5cbmNvbnN0IGVtaXR0ZXIgPSBjcmVhdGVDaGFuZ2VFbWl0dGVyKClcbi8vIHNpbmdsZSBVSSB0aHJlYWQ7IHRoaXMgaXMgdGhlIG9ic2VydmFibGUgdGhhdCBzdGlja3MgYXJvdW5kIGFuZCBzd2FwcyBvdXQgc291cmNlXG5jb25zdCBVSXRocmVhZCA9IG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgZW1pdHRlci5saXN0ZW4oeCA9PiB7XG4gICAgLy8gZGVidWdnZXIgLy8gc3VjY2VzcyEgdGhyZWFkIHN3aXRjaGluZyFcbiAgICBvYnNlcnZlci5uZXh0KHgpXG4gIH0pXG59KVxuLy8gbW91bnQgdGhlIHZkb20gb24gdG8gdGhlIGRvbSBhbmQgXG4vLyBzZXQgdXAgdGhlIHJ1bnRpbWUgZnJvbSBzb3VyY2VzIGFuZFxuLy8gcGF0Y2ggdGhlIHZkb21cbi8vIC0tLVxuLy8gcmV0dXJucyBhbiB1bnN1YnNjcmliZSBtZXRob2QgeW91IGNhbiB1c2UgdG8gdW5tb3VudFxuZXhwb3J0IGZ1bmN0aW9uIG1vdW50KHJvb3RFbGVtZW50LCBjb250YWluZXIpIHtcbiAgLy8gaW5pdGlhbCwgdGhyb3dhd2F5LWlzaCBmcmFtZVxuICBsZXQge3NvdXJjZSwgaW5zdGFuY2V9ID0gcmVuZGVyU3RyZWFtKHJvb3RFbGVtZW50LCB7fSwgdW5kZWZpbmVkLCBzdGF0ZU1hcFBvaW50ZXIpXG4gIGxldCBpbnN0YW5jZVBvaW50ZXIgPSBpbnN0YW5jZVxuICBjb25zdCByb290Tm9kZSA9IGNyZWF0ZUVsZW1lbnQoaW5zdGFuY2UuZG9tKVxuICBjb25zdCBjb250YWluZXJDaGlsZCA9IGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZFxuICBpZiAoY29udGFpbmVyQ2hpbGQpIHtcbiAgICBjb250YWluZXIucmVwbGFjZUNoaWxkKHJvb3ROb2RlLGNvbnRhaW5lckNoaWxkKSAvLyBob3QgcmVsb2FkZWQgbW91bnRcbiAgfSBlbHNlIHtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocm9vdE5vZGUpIC8vIGluaXRpYWwgbW91bnRcbiAgfVxuICBsZXQgY3VycmVudFNyYyQgPSBudWxsXG4gIGxldCBTb1MgPSBzdGFydFdpdGgoVUl0aHJlYWQsIHNvdXJjZSkgLy8gc3RyZWFtIG9mIHN0cmVhbXNcbiAgcmV0dXJuIFNvUy5zdWJzY3JpYmUoXG4gICAgc3JjJCA9PiB7IC8vIHRoaXMgaXMgdGhlIGN1cnJlbnQgc291cmNlU3RyZWFtIHdlIGFyZSB3b3JraW5nIHdpdGhcbiAgICAgIGlmIChjdXJyZW50U3JjJCkgY29uc29sZS5sb2coJ3Vuc3ViIScpIHx8IGN1cnJlbnRTcmMkLnVuc3Vic2NyaWJlKCkgLy8gdW5zdWIgZnJvbSBvbGQgc3RyZWFtXG4gICAgICAvKioqKiBtYWluICovXG4gICAgICBjb25zdCBzb3VyY2UyJCA9IHNjYW4oXG4gICAgICAgIHNyYyQsIFxuICAgICAgICAoe2luc3RhbmNlLCBzdGF0ZU1hcH0sIG5leHRTdGF0ZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN0cmVhbU91dHB1dCA9IHJlbmRlclN0cmVhbShyb290RWxlbWVudCwgaW5zdGFuY2UsIG5leHRTdGF0ZSwgc3RhdGVNYXApXG4gICAgICAgICAgaWYgKHN0cmVhbU91dHB1dC5pc05ld1N0cmVhbSkgeyAvLyBxdWljayBjaGVja1xuICAgICAgICAgICAgY29uc3QgbmV4dFNvdXJjZSQgPSBzdHJlYW1PdXRwdXQuc291cmNlXG4gICAgICAgICAgICAvLyBkZWJ1Z2dlclxuICAgICAgICAgICAgaW5zdGFuY2VQb2ludGVyID0gc3RyZWFtT3V0cHV0Lmluc3RhbmNlXG4gICAgICAgICAgICBwYXRjaChyb290Tm9kZSwgZGlmZihpbnN0YW5jZS5kb20sIGluc3RhbmNlUG9pbnRlci5kb20pKSAvLyByZW5kZXIgdG8gc2NyZWVuXG4gICAgICAgICAgICBlbWl0dGVyLmVtaXQobmV4dFNvdXJjZSQpIC8vIHVwZGF0ZSB0aGUgVUkgdGhyZWFkOyBzb3VyY2Ugd2lsbCBzd2l0Y2hcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbmV4dGluc3RhbmNlID0gc3RyZWFtT3V0cHV0Lmluc3RhbmNlXG4gICAgICAgICAgICBwYXRjaChyb290Tm9kZSwgZGlmZihpbnN0YW5jZS5kb20sIG5leHRpbnN0YW5jZS5kb20pKSAvLyByZW5kZXIgdG8gc2NyZWVuXG4gICAgICAgICAgICByZXR1cm4ge2luc3RhbmNlOiBuZXh0aW5zdGFuY2UsIHN0YXRlTWFwOiBzdGF0ZU1hcH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtpbnN0YW5jZTogaW5zdGFuY2VQb2ludGVyLCBzdGF0ZU1hcDogc3RhdGVNYXBQb2ludGVyfSAvLyBhY2N1bXVsYXRvclxuICAgICAgKVxuICAgICAgLyoqKiogZW5kIG1haW4gKi9cbiAgICAgIGN1cnJlbnRTcmMkID0gXG4gICAgICAgIHNvdXJjZTIkXG4gICAgICAgICAgLnN1YnNjcmliZSgpXG4gICAgfVxuICApXG59XG4iLCJpbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBjcmVhdGVIYW5kbGVyIH0gZnJvbSBcIi4vZWxlbWVudFwiO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XG4vLyBpbXBvcnQgeyBJTklUSUFMU09VUkNFIH0gZnJvbSBcIi4vcmVjb25jaWxlclwiO1xuaW1wb3J0IHsgbW91bnQgfSBmcm9tIFwiLi9zY2hlZHVsZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAvLyBJTklUSUFMU09VUkNFLFxuICBjcmVhdGVFbGVtZW50LFxuICBjcmVhdGVIYW5kbGVyLFxuICBDb21wb25lbnQsXG4gIG1vdW50XG59O1xuXG5leHBvcnQgeyBjcmVhdGVFbGVtZW50LCBjcmVhdGVIYW5kbGVyLCBDb21wb25lbnQsIFxuICAvLyBJTklUSUFMU09VUkNFLCBcbiAgbW91bnQgfTtcbiJdLCJuYW1lcyI6WyJURVhUX0VMRU1FTlQiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsImNvbmZpZyIsInByb3BzIiwiT2JqZWN0IiwiYXNzaWduIiwiYXJncyIsImhhc0NoaWxkcmVuIiwibGVuZ3RoIiwicmF3Q2hpbGRyZW4iLCJjb25jYXQiLCJjaGlsZHJlbiIsImZpbHRlciIsImMiLCJtYXAiLCJjcmVhdGVUZXh0RWxlbWVudCIsInZhbHVlIiwibm9kZVZhbHVlIiwiY3JlYXRlSGFuZGxlciIsIl9mbiIsImVtaXR0ZXIiLCJjcmVhdGVDaGFuZ2VFbWl0dGVyIiwiaGFuZGxlciIsImVtaXQiLCJ4IiwiJCIsIk9ic2VydmFibGUiLCJsaXN0ZW4iLCJuZXh0IiwiTk9JTklUIiwiU3ltYm9sIiwic2NhbiIsIm9icyIsImNiIiwic2VlZCIsInN1YiIsImFjYyIsImhhc1ZhbHVlIiwiaGFzU2VlZCIsInN1YnNjcmliZSIsIm9ic2VydmVyIiwiY2xvc2VkIiwiZmlyc3QiLCJlIiwiZXJyb3IiLCJzdGFydFdpdGgiLCJ2YWwiLCJDb21wb25lbnQiLCJzdGF0ZSIsIm9iaiIsInNvdXJjZXMiLCJlbnRyaWVzIiwiayIsImZuIiwic3ViUmVkdWNlciIsInNvdXJjZSIsInJlZHVjZXIiLCJfIiwibiIsImluaXRpYWxTdGF0ZSIsIm1lcmdlIiwiZGlmZiIsInJlcXVpcmUiLCJwYXRjaCIsInJlbmRlclN0cmVhbSIsInN0YXRlTWFwUG9pbnRlciIsIk1hcCIsIlVJdGhyZWFkIiwibW91bnQiLCJyb290RWxlbWVudCIsImNvbnRhaW5lciIsInVuZGVmaW5lZCIsImluc3RhbmNlIiwiaW5zdGFuY2VQb2ludGVyIiwicm9vdE5vZGUiLCJkb20iLCJjb250YWluZXJDaGlsZCIsImZpcnN0RWxlbWVudENoaWxkIiwicmVwbGFjZUNoaWxkIiwiYXBwZW5kQ2hpbGQiLCJjdXJyZW50U3JjJCIsIlNvUyIsImNvbnNvbGUiLCJsb2ciLCJ1bnN1YnNjcmliZSIsInNvdXJjZTIkIiwic3JjJCIsIm5leHRTdGF0ZSIsInN0YXRlTWFwIiwic3RyZWFtT3V0cHV0IiwiaXNOZXdTdHJlYW0iLCJuZXh0U291cmNlJCIsIm5leHRpbnN0YW5jZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFHTyxJQUFNQSxlQUFlLGNBQXJCOztBQUVQLEFBQU8sU0FBU0MsYUFBVCxDQUF1QkMsSUFBdkIsRUFBNkJDLE1BQTdCLEVBQThDOzs7TUFDN0NDLFFBQVFDLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCSCxNQUFsQixDQUFkOztvQ0FENkNJLElBQU07UUFBQTs7O01BRTdDQyxjQUFjRCxLQUFLRSxNQUFMLEdBQWMsQ0FBbEM7TUFDTUMsY0FBY0YsY0FBYyxZQUFHRyxNQUFILGFBQWFKLElBQWIsQ0FBZCxHQUFtQyxFQUF2RDtRQUNNSyxRQUFOLEdBQWlCRixZQUNkRyxNQURjLENBQ1A7V0FBS0MsS0FBSyxJQUFMLElBQWFBLE1BQU0sS0FBeEI7R0FETyxFQUVkQyxHQUZjLENBRVY7V0FBS0QsYUFBYVQsTUFBYixHQUFzQlMsQ0FBdEIsR0FBMEJFLGtCQUFrQkYsQ0FBbEIsQ0FBL0I7R0FGVSxDQUFqQjtTQUdPLEVBQUVaLFVBQUYsRUFBUUUsWUFBUixFQUFQOzs7QUFHRixTQUFTWSxpQkFBVCxDQUEyQkMsS0FBM0IsRUFBa0M7U0FDekJoQixjQUFjRCxZQUFkLEVBQTRCLEVBQUVrQixXQUFXRCxLQUFiLEVBQTVCLENBQVA7OztBQUdGLEFBQU8sU0FBU0UsYUFBVCxDQUF1QkMsR0FBdkIsRUFBNEI7TUFDM0JDLFVBQVVDLG1DQUFoQjtNQUNJQyxVQUFVLFNBQVZBLE9BQVUsSUFBSztZQUNUQyxJQUFSLENBQWFDLENBQWI7R0FERjtVQUdRQyxDQUFSLEdBQVksSUFBSUMsVUFBSixDQUFlLG9CQUFZO1dBQzlCTixRQUFRTyxNQUFSLENBQWUsaUJBQVM7ZUFDcEJDLElBQVQsQ0FBY1QsTUFBTUEs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
