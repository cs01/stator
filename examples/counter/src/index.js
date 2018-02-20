import React from 'react'
import ReactDOM from 'react-dom'
import {store, middleware} from 'statorgfc'

store.initialize({
  count: 1,
})

class Counter extends React.Component {
  constructor() {
    super()
    store.connectComponentState(this, ['count']) // this.setState will be called when 'count' changes
  }
  render() {
    return this.state.count
  }
}

class Buttons extends React.Component {
  render() {
    let increment = () => store.set('count', store.get('count') + 1)
    let decrement = () => store.set('count', store.get('count') - 1)
    return (
      <React.Fragment>
        <button onClick={decrement}> - </button>
        <button onClick={increment}> + </button>
      </React.Fragment>
    )
  }
}

store.use(middleware.logChanges)

ReactDOM.render(
  <div className="container">
    <p>
      This is an example of <a href="https://github.com/cs01/statorgfc">statorgfc</a>.
    </p>

    <Counter />
    <br />
    <Buttons />
  </div>,
  document.getElementById('app')
)
