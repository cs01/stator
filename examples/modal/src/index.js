import {store, middleware} from 'statorgfc'
import ReactDOM from 'react-dom'
import React from 'react'

store.initialize({
  showModal: false,
  modalMessage: '',
})
store.use(middleware.logChanges)

class UserInput extends React.Component {
  constructor() {
    super()
    this.state = {userMessage: ''} // this state is local to the component, not global
  }
  render() {
    return (
      <div>
        <h3>Input to Modal</h3>
        <p>
          This component lets the user input some text and show it in the Modal. See your
          browser's console to see all store changes as they occur.
        </p>
        <input
          value={this.state.userMessage}
          onChange={e => this.setState({userMessage: e.target.value})}
          placeholder="enter value here"
        />
        <p />
        <button
          className="btn btn-success btn-sm"
          onClick={
            () => store.set({showModal: true, modalMessage: this.state.userMessage}) // this state is global
          }>
          Show in Modal
        </button>
      </div>
    )
  }
}

class Modal extends React.Component {
  constructor() {
    super()
    store.connectComponentState(this, ['showModal'])
  }
  render() {
    if (!this.state.showModal) {
      return <div />
    }
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'black',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          overflow: 'auto',
        }}>
        <div
          style={{
            margin: 'auto',
            marginTop: '40px',
            padding: '40px',
            width: '400px',
            background: 'white',
          }}>
          <h2>Modal</h2>
          {store.get('modalMessage')}
          <p />
          <button
            className="btn btn-primary"
            onClick={() => store.set('showModal', false)}>
            Close
          </button>
        </div>
      </div>
    )
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
  }
}

ReactDOM.render(
  <div className="container">
    <p>
      This is an example of <a href="https://github.com/cs01/statorgfc">statorgfc</a>.
    </p>
    <UserInput />
    <Logger />
    <Modal />
  </div>,
  document.getElementById('app')
)
