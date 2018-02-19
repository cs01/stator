import {store, middleware} from 'statorgfc'
import ReactDOM from 'react-dom'
import React from 'react'

store.initialize({
  count: 3,
})
store.use(middleware.logChanges)

class Counter extends React.Component {
  constructor() {
    super()
    // connect global store to the state of this component
    store.connectComponentState(this, ['count']) // this.setState will be called when 'count'
  }
  render() {
    let low_number = this.state.count < 5
    let increment = () => store.set('count', store.get('count') + 1)
    let decrement = () => store.set('count', store.get('count') - 1)
    return (
      <div>
        <h3>Counter</h3>
        <p>
          This component displays a counter. When the number is over 5, a warning is
          displayed.
        </p>
        <div
          className={'alert ' + (low_number ? 'alert-success' : 'alert-danger')}
          role="alert">
          <strong>Count: {this.state.count}</strong>
          <br />
          <button onClick={increment}> + </button>
          <button onClick={decrement}> - </button>
          <br />
          <button onClick={() => setTimeout(increment, 1000)}> async + </button>
          <button onClick={() => setTimeout(decrement, 1000)}> async - </button>
        </div>
      </div>
    )
  }
  componentDidMount() {
    console.warn('unwatched keys of the store', store.getUnwatchedKeys())
    console.log('subscribers to keys of the store', store.getKeySubscribers())
  }
}

class Logger extends React.Component {
  render() {
    return (
      <div>
        <h3>Logger Component</h3>
        <p>
          This component logs all changes by using statorgfc's middleware. The browser's
          console is also displaying these changes.
        </p>
        <div
          ref={domnode => (this.node = domnode)}
          style={{
            fontFamily: 'monospace',
            background: '#333',
            color: '#ccc',
            height: '200px',
            overflow: 'scroll',
          }}
        />
      </div>
    )
  }
  componentDidMount() {
    function logChangeToDomNode(key, oldval, newval) {
      var newNode = document.createElement('span')
      newNode.innerHTML = key + ' ' + oldval + ' -> ' + newval + '<br>'
      this.node.appendChild(newNode)
      return true
    }
    store.use(logChangeToDomNode.bind(this))

    store.set({count: store.get('count') + 1})
  }
}

ReactDOM.render(
  <div className="container">
    <p>
      This is an example of <a href="https://github.com/cs01/statorgfc">statorgfc</a>.
    </p>
    <Counter />
    <Logger />
  </div>,
  document.getElementById('app')
)
