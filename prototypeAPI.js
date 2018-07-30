
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
