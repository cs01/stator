// functions that are called just *before* the store is actually
// updated. If the function returns true, the next middleware
// is called.

const middleware = {
  // log changes to the console. This is only use really
  // if the data is immutable and oldval and newval don't point
  // to the same reference
  logChanges: function(key, oldval, newval) {
    console.log(key, oldval, ' -> ', newval)
    return true // return true means next middleware can be called
  },
}

module.exports = {
  middleware: middleware,
}
