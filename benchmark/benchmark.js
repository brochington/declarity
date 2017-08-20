console.log("run!!")
const Benchmark = require('benchmark')

const suite = new Benchmark.Suite

suite.add('test1', function() {
  let thing = 0

  for (let i = 0; i < 10000; i++) {
    thing += i;
  }

})

suite.add('test2', function() {
  [...Array(10000)]
    .map((v, i) => i)
    .reduce((arr, v) => arr += v)
})

suite.on('cycle', function(event) {
  console.log(String(event.target))
})


suite.on('complete', function() {
  console.log("bang!", this)
})

suite.run({ async: true })
