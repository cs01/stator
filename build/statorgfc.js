'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                                               * statorgfc - global state mangement for JavaScript apps. Copyright Chad Smith.
                                                                                                                                                                                                                                                                               */


var _middleware = require('./middleware');

var store = {
  /**
   * the store's options
   */
  options: {
    immutable: true, // when calling store.get() returns copy if true, otherwise reference
    debounce_ms: 0 // time to delay before notifying subscribers (callbacks) of a change
  },
  /**
   * Set the initial store. This can only be done once, and must be done before the
   * store can be modified. This should be a JavaScript object with key/value pairs.
   * This is the initial "hydration" of the store, and sets the expected types for all keys.
   * @param {object} initial_store: Initial store object
   * @param {object} options: options to apply to store
   */
  initialize: function initialize(initial_store, options) {
    if (store._store_created) {
      throw 'cannot create more than one global store';
    }
    for (var k in initial_store) {
      store._store[k] = initial_store[k];
    }
    if (options) {
      Object.assign(store.options, options);
    }
    store._store_created = true;
  },
  /**
   * connect a React component's state to keys in the global store.
   * When a watched key of the store is updated, that the component's
   * setState method will be called.
   * Call this from the Component's constructor:
   *  store.connectComponentState(this, ['key1', 'key2'])
   */
  connectComponentState: function connectComponentState(component, keys_to_watch_for_changes) {
    var additonal_callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    component.state = component.state || {}; // initialize if not set

    // call this function whenever the store changes
    function _callback(changed_keys) {
      if (intersection(keys_to_watch_for_changes, changed_keys).length) {
        // only update the state if a key we care about has changed
        var state_update_obj = {};
        keys_to_watch_for_changes.forEach(function (k) {
          return state_update_obj[k] = store._store[k];
        });
        this.setState(state_update_obj);

        // if some other custom callback is required by the component
        // call that function as well
        if (additonal_callback) {
          additonal_callback(changed_keys);
        }
      }
    }
    var callback_bound_to_component = _callback.bind(component);

    // add keys that map to the store's keys
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = keys_to_watch_for_changes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var k = _step.value;

        if (!store._store.hasOwnProperty(k)) {
          throw 'Store does not have key ' + k;
        }
        if (component.state.hasOwnProperty(k)) {
          console.warn('Overwriting existing state key ' + k);
        }
        component.state[k] = store._store[k];

        store._recordKeySubscriber(k, component.constructor.name);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return store.subscribe(callback_bound_to_component);
  },
  /**
   * Connect a regular JavaScript function to a callback that is called ONLY
   * when one of a subset of the keys has been updated
   */
  subscribeToKeys: function subscribeToKeys(keys_to_watch_for_changes, callback) {
    // add keys that map to the store's keys
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = keys_to_watch_for_changes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var k = _step2.value;

        if (!store._store.hasOwnProperty(k)) {
          throw 'Store does not have key ' + k;
        }
        store._recordKeySubscriber(k, callback.name);
      }

      // call this function whenever the store changes
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    function _callback(changed_keys) {
      if (intersection(keys_to_watch_for_changes, changed_keys).length) {
        callback(changed_keys);
      }
    }
    return store.subscribe(_callback);
  },
  getKeySubscribers: function getKeySubscribers() {
    return copyByValue(store._key_to_watcher_subscriptions);
  },
  _recordKeySubscriber: function _recordKeySubscriber(key, subscriber_function_name) {
    if (!store._key_to_watcher_subscriptions.hasOwnProperty(key)) {
      store._key_to_watcher_subscriptions[key] = [];
    }
    store._key_to_watcher_subscriptions[key].push({
      id: store._getCurrentCallbackId(),
      name: subscriber_function_name
    });
  },
  _removeKeySubscriber: function _removeKeySubscriber(id) {
    var subs = store._key_to_watcher_subscriptions;
    for (var k in subs) {
      subs[k] = subs[k].filter(function (obj) {
        obj.id === id;
      });

      if (subs[k].length === 0) {
        delete subs[k];
      }
    }
  },
  /**
   * Add listener(s) to store changes. Reactors are automatically subscribed to store changes.
   * @param {function} function or array of functions to be called when event is dispatched due to store updates
   */
  subscribe: function subscribe(callback) {
    var id = store._getCurrentCallbackId();
    store._incrementCurFunctionId();
    function unsubscribe() {
      store._callback_objs = store._callback_objs.filter(function (c) {
        return c.id !== id;
      });
      store._removeKeySubscriber(id);
    }
    store._callback_objs.push({ id: id, callback: callback });
    return unsubscribe;
  },
  _getCurrentCallbackId: function _getCurrentCallbackId() {
    return store._cur_callback_id;
  },
  _incrementCurFunctionId: function _incrementCurFunctionId() {
    store._cur_callback_id++;
  },
  /**
   * return an array of keys that do not trigger any callbacks when changed, and therefore
   * probably don't need to be included in the global store
   */
  getUnwatchedKeys: function getUnwatchedKeys() {
    var arr1 = Object.keys(store._store),
        arr2 = Object.keys(store._key_to_watcher_subscriptions);
    return arr1.filter(function (i) {
      return arr2.indexOf(i) === -1;
    });
  },
  /**
   * set key or keys of store object
   * @param {str/obj} key_or_new_store: if str, this key is replaced. If obj, all keys of the obj replace store's keys.
   * @param {any} value: If key was provided, the associated value. The type of the value for this key cannot change. Exceptions to this rule
   * are to/from null or undefined. Otherwise if you try to change, say, `1` to `'2'`, a type error will occur (int to string is not permitted).
   */
  set: function set(key_or_new_store, value) {
    if (arguments.length === 1) {
      // replace the whole store
      var new_store = key_or_new_store;
      for (var k in new_store) {
        store.set(k, new_store[k]);
      }
      return;
    }

    var key = key_or_new_store;
    if (!store._store.hasOwnProperty(key)) {
      // use hasOwnProperty for better performance (entrie prototype chain is not traversed)
      throw 'cannot create new key after initialization (attempted to create ' + key + ')';
    }

    var oldval = store._store[key];
    checkTypeMatch(key, oldval, value);
    if (valueHasChanged(oldval, value)) {
      var update_store = store._runUserMiddleware(key, oldval, value);
      if (update_store) {
        store._store[key] = value;
        store._publishChangeToSubscribers(key, oldval, value);
      }
    }
  },
  _user_middleware_functions: [],
  /**
   * use a middleware function
   * function signature of middleware is function(key, oldval, newval).
   * If middleware functions returns true, next middleware function will run
   * otherwise, the middleware chain will stop and the store will NOT be updated.
   */
  use: function use(new_middlware_function) {
    store._user_middleware_functions.push(new_middlware_function);
  },
  _runUserMiddleware: function _runUserMiddleware(key, oldval, newval) {
    if (store._user_middleware_functions.length) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = store._user_middleware_functions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var middleware_function = _step3.value;

          var keep_going = middleware_function(key, oldval, newval);
          if (!keep_going) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
    return true;
  },
  /**
   * Emit event to subscribers based on timeout rules
   *
   * @param key     key to change
   * @param oldval  original value (for logging purposes)
   * @param value   new value to assign
   */
  _publishChangeToSubscribers: function _publishChangeToSubscribers(key, oldval, value) {
    if (store._changed_keys.indexOf(key) === -1) {
      store._changed_keys.push(key);
    }

    // suppress active timeout (if any)
    if (store._debounce_timeout) {
      store._clearDebounceTimeout();
    }

    if (store.options.debounce_ms) {
      // delay event emission and set new timeout id
      store._debounce_timeout = setTimeout(store._publish, store.options.debounce_ms);
    } else {
      // publish immediately
      store._publish();
    }
  },
  /**
   * Get reference to one of the keys in the current store.
   * @param {str} key of the store object to get a reference to
   * @return reference or new object (depending on `immutable` option)
   * NOTE: The store should *only* be update by calling `store.set(...)`
   *   Throws error if key does not exist in store.
   */
  get: function get(key) {
    if (!store._store_created) {
      throw 'cannot get store because is has not been created';
    }
    if (arguments.length === 0) {
      // return the whole store
      if (store.options.immutable) {
        return Object.assign({}, store._store); // copy entire store by value
      } else {
        return store._store; // return reference to store
      }
    } else if (arguments.length > 1) {
      console.error('unexpected number of arguments');
      return;
    }

    if (!store._store.hasOwnProperty(key)) {
      throw 'attempted to access key that was not set during initialization: ' + key;
    }

    var ref = store._store[key];
    if (store.options.immutable) {
      return copyByValue(ref);
    } else {
      // return the reference
      return ref;
    }
  },
  /**
   * Run subscribers' callback functions. An array of the changed keys is passed to the callback function.
   * Be careful how often this is called, since re-rendering components can become expensive.
   */
  _publish: function _publish() {
    var changed_keys = store._changed_keys;
    if (changed_keys.length === 0) {
      console.error('no keys were changed, yet we are trying to publish a store change');
      return;
    }

    // make sure _changed_keys is reset before executing callbacks
    // (if callbacks modify state, the list of keys the callback changed would be wiped out)
    store._changed_keys = [];
    store._clearDebounceTimeout();
    store._callback_objs.forEach(function (obj) {
      return obj.callback(changed_keys);
    });
  },
  /**
   * keys that were modified in the store since the last publish
   */
  _changed_keys: [],
  /**
   * array of functions to be called when store changes.
   */
  _callback_objs: [],
  // unique id for each callback. Used when unsubscribing.
  _cur_callback_id: 0,
  /**
   * Actual store is held here, but should NEVER be accessed directly. Only access through store.set/store.get!
   */
  _store: {},
  /**
   * Clear the debounce timeout
   */
  _clearDebounceTimeout: function _clearDebounceTimeout() {
    clearTimeout(store._debounce_timeout);
    store._debounce_timeout = null;
  },
  /**
   * Debounce timeout
   */
  _debounce_timeout: null,
  /**
   * Suppressed event count.
   * Incremented when a queued timeout is replaced with new timeout. If queued timeouts keep getting
   * replaced, events never get dispatched. This is an "escape hatch" for that.
   * Set to zero when event is dispatched.
   */
  _store_created: false,
  _key_to_watcher_subscriptions: {}
};

function checkTypeMatch(key, a, b) {
  if (a !== undefined && b !== undefined && a !== null && b !== null) {
    var old_type = typeof a === 'undefined' ? 'undefined' : _typeof(a),
        new_type = typeof b === 'undefined' ? 'undefined' : _typeof(b);
    if (old_type !== new_type) {
      console.error('attempted to change ', key, ' from ', a, ' (', old_type, ') to ', b, ' (', new_type, ')');
      throw 'type error';
    }
  }
}

function intersection(arr1, arr2) {
  return arr1.filter(function (i) {
    return arr2.indexOf(i) !== -1;
  });
}

function copyByValue(ref) {
  if (Array.isArray(ref)) {
    return ref.slice();
  } else if (is_object(ref)) {
    return Object.assign({}, ref);
  } else {
    return ref;
  }
}

function is_object(ref) {
  return ref instanceof Object && ref.constructor === Object;
}

function valueHasChanged(a, b) {
  if (store.options.immutable) {
    return !shallowEqual(a, b);
  }
  if (is_object(a) || Array.isArray(a)) {
    // since objects can be updated by reference, we don't
    // know if the value changed or not since the reference
    // is still the same. Err on the side of caution assume
    // objects always change.
    return true;
  } else {
    return !shallowEqual(a, b);
  }
}

// adapted from react-redux shallowEqual.js
// https://github.com/reactjs/react-redux/blob/master/src/utils/shallowEqual.js
function isSameRef(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

// adapted from react-redux shallowEqual.js
// https://github.com/reactjs/react-redux/blob/master/src/utils/shallowEqual.js
function shallowEqual(objA, objB) {
  if (isSameRef(objA, objB)) {
    return true;
  }

  if ((typeof objA === 'undefined' ? 'undefined' : _typeof(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : _typeof(objB)) !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = keysA[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var k = _step4.value;

      if (!objB.hasOwnProperty(k)) {
        return false;
      } else if (!isSameRef(objA[k], objB[k])) {
        return false;
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return true;
}

module.exports = {
  store: store,
  middleware: _middleware.middleware
};