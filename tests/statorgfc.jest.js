import {store} from '../statorgfc.js';

/* eslint-env jest */

function reset_store(store){
  store._store_created = false
  store._store = {}
}

test('cannot initialize twice', ()=>{
    store.initialize({})
    expect(() => store.initialize({}))
      .toThrow('cannot create more than one global store')

    reset_store(store)
})

test('test immutability', ()=>{
    let orig_obj = {a: 1, b: 2}
    store.initialize({key: orig_obj}, {immutable: false})

    let new_obj = store.get('key')
    expect(orig_obj === new_obj).toBe(true)

    store.options.immutable = true
    new_obj = store.get('key')
    expect(orig_obj === new_obj).toBe(false)

    reset_store(store)
})

test('cannot subscribe to invalid key', ()=>{
  store.initialize({key: 1})
  expect(() => {
    store.subscribe_to_keys(['key1'], (keys)=>{})
  }).toThrow('Store does not have key key1')
})
