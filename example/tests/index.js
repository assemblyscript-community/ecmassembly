import moduleExports from '../index.js'

moduleExports.testPromiseThen()
moduleExports.testPromiseCatch()
moduleExports.testPromiseThenFinally()
moduleExports.testPromiseCatchFinally()

setTimeout(() => {
	moduleExports.testRAF()
}, 2500)

console.log('ok')
