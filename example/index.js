import fs from 'fs'
import path from 'path'
import loader from '@assemblyscript/loader'
import {ECMAssembly} from 'ecmassembly/index.js'

const es = new ECMAssembly()

const imports = {
	...es.wasmImports,
	logf32: {
		logf32(n) {
			console.log(n)
		},
	},
	env: {
		abort(message, fileName, line, column) {
			console.error('--------- Error message from AssemblyScript ---------')
			console.error('  ' + wasmModule.exports.__getString(message))
			console.error('    In file "' + wasmModule.exports.__getString(fileName) + '"')
			console.error(`    on line ${line}, column ${column}.`)
			console.error('-----------------------------------------------------')
		},
	},
}

function dirname(url) {
	const parts = url.split(path.sep)
	parts.pop()
	return parts.join(path.sep).replace('file://', '')
}

const wasmModule = loader.instantiateSync(fs.readFileSync(dirname(import.meta.url) + '/build/untouched.wasm'), imports)

es.wasmExports = wasmModule.exports

export default wasmModule.exports
