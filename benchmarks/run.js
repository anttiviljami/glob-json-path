#!/usr/bin/env node

const assert = require('assert')
const { glob } = require('..')

// create a large nested object
// { prop0: { value0: 0, nested0: { value1: 1, nested1: { value2: 2, ... } }, prop1: ... }
const obj = {}

// 1000 props
for (let i = 0; i < 1000; i++) {
  // 100 levels deep
  obj[`prop${i}`] = { 'value': i }
  tmp = obj[`prop${i}`]
  for (let j = 0; j < 100; j++) {
    tmp[`nested${j}`] = { [`value${j}`]: j }
    tmp = tmp[`nested${j}`]
  }
}
// console.log(obj)

let result = null;

console.time('simple x 10k')
performance.mark('start-simple')

for (let i = 0; i < 10_000; i++) {
  result = glob('prop0.nested0.value0', obj, 'value')
}

performance.mark('end-simple')
console.timeEnd('simple x 10k')

assert.deepEqual(result, [0])

console.time('wildcard x 10k')
performance.mark('start-wildcard')

for (let i = 0; i < 10_000; i++) {
  result = glob('prop*.value', obj, 'path')
}

performance.mark('end-wildcard')
console.timeEnd('wildcard x 10k')

assert.equal(result[0], 'prop0.value')
assert.equal(result[1], 'prop1.value')
assert.equal(result[2], 'prop2.value')
assert.equal(result[999], 'prop999.value')

console.time('globstar x 100')
performance.mark('start-globstar')

for (let i = 0; i < 100; i++) {
  result = glob('**.value1', obj, 'path')
}

performance.mark('end-globstar')
console.timeEnd('globstar x 100')

assert.ok(result.includes('prop0.nested0.nested1.value1'))
assert.ok(result.includes('prop1.nested0.nested1.value1'))
assert.ok(result.includes('prop2.nested0.nested1.value1'))
assert.ok(result.includes('prop3.nested0.nested1.value1'))
assert.ok(result.includes('prop999.nested0.nested1.value1'))

console.log(
  '\n',
  'Details:\n',
  performance.measure('Simple x10_000', 'start-simple', 'end-simple'),
  performance.measure('Wildcard x10_000', 'start-wildcard', 'end-wildcard'),
  performance.measure('Globstar x100', 'start-globstar', 'end-globstar'),
)