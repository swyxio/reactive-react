This is a prototype mockup of a "Reactive" version of React.

In this alternate universe, Observables became a part of Javascript.

We take a minimal implementation of Observables, zen-observable.

The React API we are targeting looks something like this:

```js

class Abc extends Component {
  source($) {
    return Observable.of(1)
  }
  render($) {
    return <LabeledSlider />
  }
}

class LabeledSlider extends Component {
  constructor() {
    this.myRef = Creat.createRef();
  }
  source($) {
    return this.myRef()
  }
  render(value, prop$) {
    return <input 
      type="range" 
      min={20} max={80} 
      value={value} 
      onInput={this.myRef} 
    />
  }
}

```