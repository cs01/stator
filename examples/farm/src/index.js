import {store, middleware} from 'statorgfc'
import ReactDOM from 'react-dom'
import React from 'react'

store.initialize({
    numSheep: 10,
    numWolves: 2,
    numChickens: 90
  })
store.use(middleware.logChanges)

// Create a normal component
class SheepWatcher extends React.Component {
    constructor(){
        super()
        // connect global store to the state of this component
        store.connectComponentState(this, ['numSheep', 'numWolves'])  // this.setState will be called when 'numSheep' or 'numWolves' changes
    }
    render(){
      return <div>
        <h1>Sheep Watcher</h1>
        Current sheep status: {this.state.numSheep > this.state.numWolves ? 'all good' : 'watch out sheep!'}
      </div>
    }
    componentDidMount(){
      console.warn('unwatched keys of the store', store.getUnwatchedKeys())
      console.log('subscribers to keys of the store', store.getKeySubscribers())
    }
}

// somewhere else in a component far, far away...
store.set({numSheep: store.get('numSheep') + 1})
store.set({numChickens: 100})  // doesn't trigger a call to setState in sheepWatcher
// because sheepWatcher isn't connected to the numChickens key

// store.set({numSheep: '12'})
// would result in // error: "attempted to change  numSheep  from  11  ( number ) to  12  ( string )"

ReactDOM.render(<SheepWatcher />, document.getElementById('app'))
