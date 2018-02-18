// functions that are called just *before* the store is actually
// updated. If the function returns true, the next middleware
// is called.

const middleware = {
  // log all changes to the console
  logChanges: function(key, oldval, newval) {
    console.log(key, oldval, ' -> ', newval)
    return true // return true means next middleware can be called
  },
  persistToLocalStorage: function(key, oldval, newval) {
    try {
      localStorage.setItem(key, JSON.stringify(newval))
    } catch (err) {
      console.warn('could not save ' + key + ' to localstorage')
    }
    return true // return true means next middleware can be called
  },
}

module.exports = {
  middleware: middleware,
}
