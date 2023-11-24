#!/usr/bin/env node

const assert = require('assert')
const { glob } = require('..')

// create a large nested object
// { prop0: { value: 0, nested: { value: 1, nested: { value: 2, ... } }, prop1: ... }
const obj = {}

// 1000 props
for (let i = 0; i < 1000; i++) {
  // 100 levels deep
  obj[`prop${i}`] = { 'value': i }
  tmp = obj[`prop${i}`]
  for (let j = 0; j < 100; j++) {
    tmp['nested'] = { 'value': j }
    tmp = tmp['nested']
  }
}
// console.log(obj)

let result = null;

performance.mark('start-simple')

for (let i = 0; i < 10_000; i++) {
  result = glob('prop0.nested.value', obj, 'value')
}

performance.mark('end-simple')
assert.deepEqual(result, [0])


performance.mark('start-wildcard')

for (let i = 0; i < 10_000; i++) {
  result = glob('prop*.value', obj, 'path')
}

performance.mark('end-wildcard')
assert.equal(result[0], 'prop0.value')
assert.equal(result[1], 'prop1.value')
assert.equal(result[2], 'prop2.value')
assert.equal(result[999], 'prop999.value')

performance.mark('start-globstar')

for (let i = 0; i < 100; i++) {
  result = glob('**.value', obj, 'path')
}

performance.mark('end-globstar')

assert.ok(result.includes('prop0.value'))
assert.ok(result.includes('prop0.nested.value'))
assert.ok(result.includes('prop1.value'))
assert.ok(result.includes('prop1.nested.value'))
assert.ok(result.includes('prop2.nested.nested.nested.value'))
assert.ok(result.includes(`prop0${'.nested'.repeat(99)}.value`))
assert.ok(result.includes('prop999.nested.value'))

console.log(
  performance.measure('Simple x10_000', 'start-simple', 'end-simple'),
  performance.measure('Wildcard x10_000', 'start-wildcard', 'end-wildcard'),
  performance.measure('Globstar x100', 'start-globstar', 'end-globstar'),
)