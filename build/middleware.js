'use strict';

// functions that are called just *before* the store is actually
// updated. If the function returns true, the next middleware
// is called.

var middleware = {
  // log all changes to the console
  logChanges: function logChanges(key, oldval, newval) {
    console.log(key, oldval, ' -> ', newval);
    return true; // return true means next middleware can be called
  },
  persistToLocalStorage: function persistToLocalStorage(key, oldval, newval) {
    try {
      localStorage.setItem(key, JSON.stringify(newval));
    } catch (err) {
      console.warn('could not save ' + key + ' to localstorage');
    }
    return true; // return true means next middleware can be called
  }
};

module.exports = {
  middleware: middleware
};