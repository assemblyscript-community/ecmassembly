import {logf32} from './logf32'
import {defer, defer2, _defer} from './defer'
import {ptr} from './utils'

// TODO convert to callback form once closures are out.
// type Executor<T> = (resolve: (result: T) => void, reject: (error: Error | null) => void) => void
type Executor<T> = (resRej: PromiseActions<T>) => void

// TODO Use the Error class instead of string. Keeping it simple for the PoC for now.
type Err = string

class PromiseActions<T> {
	constructor(private promise: Promise<T>) {}

	resolve(result: T): void {
		if (this.promise.__isSettled) return
		this.promise.__isSettled = true
		this.promise.__isResolved = true

		logf32(100)

		this.promise.__result.push(result)

		if (this.promise.__thenCallback.length) this.promise.__runThen()
	}

	reject(error: Err): void {
		if (this.promise.__isSettled) return
		this.promise.__isSettled = true
		this.promise.__isRejected = true

		logf32(101)

		this.promise.__error.push(error)

		if (this.promise.__catchCallback.length) this.promise.__runCatch()
	}
}

export class Promise<T> {
	__isSettled: boolean = false
	__isResolved: boolean = false
	__isRejected: boolean = false

	private actions: PromiseActions<T> = new PromiseActions(this)

	__result: Array<T> = []
	__error: Array<Err> = []

	constructor(private executor: Executor<T>) {
		this.executor(this.actions)
	}

	__thenCallback: Array<(val: T) => void> = []

	then(cb: (v: T) => void): void {
		if (this.__thenCallback.length) throw new Error('then/catch chaining not supported yet.')

		this.__thenCallback.push(cb)

		if (this.__result.length) {
			// The goal here is to run the callback in the next microtask, as per Promise spec.

			// FIXME: unable to pass method pointers:
			// defer<(this: Promise<T>) => void>(this.__runThen)
			// _defer(ptr(this.__runThen))
			// _defer(ptr<(this: Promise<T>) => void>(this.__runThen))

			defer2((selfPtr: usize) => {
				const self = load<Promise<T>>(selfPtr)
				self.__runThen()
			}, ptr(this))

			// this.__runThen()
		}
	}

	__runThen(): void {
		const fn = this.__thenCallback[0]
		fn(this.__result[0])
	}

	__catchCallback: Array<(err: Err) => void> = []

	catch(cb: (err: Err) => void): void {
		if (this.__catchCallback.length) throw new Error('then/catch chaining not supported yet.')

		this.__catchCallback.push(cb)

		if (this.__error.length) {
			// TODO defer
			this.__runCatch()
		}
	}

	__runCatch(): void {
		const fn = this.__catchCallback[0]
		fn(this.__error[0])
	}
}
