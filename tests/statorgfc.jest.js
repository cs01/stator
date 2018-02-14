import {store} from '../statorgfc.js';

/* eslint-env jest */

afterEach(() => {
  store._store_created = false
  store._store = {}
});

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
    store.subscribe_to_keys(['key1'], (keys)=>{})
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
