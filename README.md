# Statorgfc (wip) &middot; [![version](https://img.shields.io/badge/release-v0.1.6-blue.svg)](https://www.npmjs.com/package/statorgfc)  [![build status](https://travis-ci.org/cs01/statorgfc.svg?branch=master)](https://travis-ci.org/cs01/statorgfc)

> a library for state management of JavaScript apps, with built-in support for React Components

Used for state management of a JavaScript application when [any of the following](https://medium.com/@fastphrase/when-to-usoe-redux-f0aa70b5b1e2) are true
* the same piece of application state needs to be mapped to multiple container components
* there are global components that can be accessed from anywhere
* too many props are being passed through multiple hierarchies of components

If you can maintain the state of a component within the component itself **you should not use statorgfc**.

Statorgfc has
* **Predictable global state**: State management occurs in one location -- a variable named *store*.
* **Intuitive API**: Similar to React's, with no boilerplate necessary
* **Typesafe changes**: Values can only be replaced with data of the same type
* **Immutable data... or not**: You choose if you want to work with immutable data structures by setting a single boolean
* **No Dependencies**: Written in plain JavaScript. No dependencies.
* **Efficient**: If a value isn't changed during an update to the store, listeners aren't notified


### Install
```
yarn add statorgfc
```

### Simple Example

```js
import {store} from 'statorgfc'

store.initialize({count: 0})

store.get('count')  // 0
store.set({count: store.get('count') + 1}) // changed value to 1
store.get('count') // 1
```

### Subscribe a function to changes
```js
import {store} from 'statorgfc'

store.initialize({count: 0})

store.subscribe( () => console.log(store.get()) )  // call anytime something changes, and log entire store
store.set({count: store.get('count') + 1})  // prints {count: 1}
store.set({count: store.get('count')})  // no callbacks triggered, because the value didn't actually change
```


### Connecting React Component's State to Global Store
```js
import {store} from 'statorgfc'
import React from 'react'

// keys cannot be added after initialization.
// Type of value of each key cannot be changed after initialization.
store.initialize({
    numSheep: 10,
    numWolves: 2,
    numChickens: 90
  })

// Create a normal component
class SheepWatcher extends React.Component {
    constructor(){
        super()
        // connect global store to the state of this component
        store.connectComponentState(this, ['numSheep', 'numWolves'])  // this.setState will be called when 'numSheep' or 'numWolves' changes
    }
    render(){
      return {this.state.numSheep > this.state.numWolves ? 'all good' : 'watch out sheep!'}
    }
}

// somewhere else in a component far, far away...
store.set({numSheep: store.get('numSheep') + 1})  // triggers a call to setState in sheepWatcher, which updates that component
store.set({numChickens: 100})  // doesn't trigger a call to setState in sheepWatcher
// because sheepWatcher isn't connected to the numChickens key
```

#### See which components listen to which keys
```js
let watchers = store.get_key_watchers()
console.log(watchers)
// {
//   "numSheep": ["SheepWatcher"],
//   "numWolves": ["SheepWatcher"]
// }
```

If a key in the store is not being acted upon by anything, that is useful to know too. You can probably remove that key from the global store and simply store it statically somewhere else.
```js
let no_watchers = store.getUnwatchedKeys()
console.log(no_watchers)
// ["numChickens"]
```

## Users
* [gdbgui](https://github.com/cs01/gdbgui): a C/C++ debugger written as a single page JavaScript app with many disparate components that need to update frequently and efficiently

## License
MIT

## Author
grassfedcode@gmail.com
