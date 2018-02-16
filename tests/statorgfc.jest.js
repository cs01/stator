import {store} from '../src/statorgfc.js';

/* eslint-env jest */

afterEach(() => {
  store._store_created = false
  store._store = {}
  store._key_to_watcher_subscriptions = {}
  store._callback_objs = []
})

test('cannot initialize twice', ()=>{
    store.initialize({})
    expect(() => store.initialize({}))
      .toThrow('cannot create more than one global store')
})

test('immutability', ()=>{
    let orig_obj = {a: 1, b: 2}
    store.initialize({key: orig_obj}, {immutable: false})

    let new_obj = store.get('key')
    expect(orig_obj === new_obj).toBe(true)

    store.options.immutable = true
    new_obj = store.get('key')
    expect(orig_obj === new_obj).toBe(false)
})

test('cannot subscribe to invalid key', ()=>{
  store.initialize({key: 1})
  expect(() => {
    store.subscribeToKeys(['key1'], (keys)=>{})
  }).toThrow('Store does not have key key1')
})

test('subscribe and unsubscribe', ()=>{
    store.initialize({count: 0})
    let v = false
    let unsubscribe = store.subscribe( () => v = true)
    expect(v).toBe(false)

    store.set('count', store.get('count'))  // nothing changed
    expect(v).toBe(false)

    store.set('count', store.get('count') + 1) // changed
    expect(v).toBe(true)

    // now unsubscribe and confirm the callback isn't triggered
    v = false
    unsubscribe()
    expect(v).toBe(false)
    expect(store.get('count')).toBe(1)
    store.set('count', store.get('count') + 1)
    expect(store.get('count')).toBe(2)  // it did actually increment
    expect(v).toBe(false)  // but we weren't notified
})

test('middleware is called', ()=>{
    store.initialize({a: 0, b: 0})

    store.use(function(key, oldval, newval){
      if(key === 'b'){
        throw 'using middleware'
      }
    })

    store.set({a: 1})  // nothing thrown

    expect(()=>{
      store.set({b: 1})
    }).toThrow('using middleware')
})

test('subscriber lists', ()=>{
  store.initialize({a: 0, b: 0})

  expect(store.getUnwatchedKeys()).toEqual(['a', 'b'])
  expect(store.getKeySubscribers()).toEqual({})

  let unsubscribe = store.subscribeToKeys(['a'], function some_function(){})
  expect(store.getUnwatchedKeys()).toEqual(['b'])
  expect(store.getKeySubscribers()).toEqual({'a': ['some_function']})
})
