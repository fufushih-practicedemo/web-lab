const PROMISE_STATUS_PENDING= 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'

class MyPromise {
    constructor(executor) {
        this.status = PROMISE_STATUS_PENDING;

        // The value and reason are used to store the result of the promise
        this.value = undefined;
        this.reason = undefined;

        this.onFulfilledFns = [] // store the onFulfilled functions
        this.onRejectedFns = [] // store the onRejected functions

        const resolve = (value) => {
            if (this.status === PROMISE_STATUS_PENDING) {

                // Deal with the case when the value is a promise
                if (value instanceof MyPromise) {
                    value.then(resolve, reject) // if the value is a promise, call its then method
                    return
                }

                // Deal with the case when the value is a thenable object (an object that has a then method)
                if (value !== null && typeof value === 'object' || typeof value === 'function') {
                    let then;
                    try {
                        then = value.then // get the then method of the value
                    } catch (err) {
                        reject(err) // if the value is not a promise, reject it
                        return
                    }

                    if (typeof then === 'function') {
                        let called = false // to prevent the promise from being resolved or rejected multiple times
                        try {
                            then.call(value, (val) => {
                                if (called) return // prevent multiple calls
                                called = true // prevent multiple calls
                                resolve(val)
                            }, (err) => {
                                if (called) return // prevent multiple calls
                                called = true // prevent multiple calls
                                reject(err)
                            });
                        } catch (err) {
                            if (called) return // prevent multiple calls
                            called = true // prevent multiple calls
                            reject(err)
                        }
                        return
                    }
                }

                // use queueMicrotask to make sure the onFulfilled is called after the current event loop (Microtask queue)
                queueMicrotask(() => {
                    if (this.status !== PROMISE_STATUS_PENDING) return

                    this.status = PROMISE_STATUS_FULFILLED
                    this.value = value
                    this.onFulfilledFns.forEach((fn) => {
                        fn(this.value) // pass data
                    })
                })
            }
        }

        const reject = (value) => {
            if (this.status === PROMISE_STATUS_PENDING) {
                // use queueMicrotask to make sure the onFulfilled is called after the current event loop (Microtask queue)
                queueMicrotask(() => {
                    if (this.status !== PROMISE_STATUS_PENDING) return

                    this.status = PROMISE_STATUS_REJECTED
                    this.reason = value
                    this.onRejectedFns.forEach((fn) => {
                        fn(this.reason) // pass data
                    })
                })
            }
        }

        try {
            executor(resolve, reject); // executor is executed immediately
        } catch (err) {
            reject(err) // if the executor throws an error, reject it
        }
    }

    then(onFulfilled, onRejected) {
        const defaultOnRejected = (err) => {
            throw err // throw the error to the next then
        }
        onRejected = onRejected || defaultOnRejected // if onRejected is not provided, use the default one

        const defaultOnFulfilled = (value) => {
            return value // pass the value to the next then
        }
        onFulfilled = onFulfilled || defaultOnFulfilled // if onFulfilled is not provided, use the default one

        return new MyPromise((resolve, reject) => {
            if (this.status === PROMISE_STATUS_FULFILLED && onFulfilled) {
                onFulfilled(this.value)
            }
            if (this.status === PROMISE_STATUS_REJECTED && onRejected) {
                onRejected(this.reason)
            }
        
            if (this.status === PROMISE_STATUS_PENDING) {
                if (onFulfilled) {
                    this.onFulfilledFns.push(() => {
                        try {
                            const value = onFulfilled(this.value)
                            resolve(value) // pass data to the next then
                        } catch (err) {
                            reject(err) // pass error to the next then
                        }
                    })
                }
            
                if (onRejected) {
                    this.onRejectedFns.push(() => {
                        try {
                            const value = onRejected(this.reason)
                            resolve(value) // pass data to the next then
                        } catch (err) {
                            reject(err) // pass error to the next then
                        }
                    })
                }
            }
        })
    }

    catch(onRejected) {
        return this.then(undefined, onRejected)
    }

    finally(onFinally) {
        this.then(() => {
            onFinally()
        }, () => {
            onFinally()
        })
    }
}

// When call new MyPromise, the executor function is executed immediately.
const myPromise = new MyPromise((resolve, reject) => {
    console.log('Promise is created');
    resolve('resovle is called');
    reject();
});

myPromise.then(res => {
    console.log("res1:", res)
    return "aaaaa"
  }).then(res => {
    console.log("res2:", res)
  }).catch(err => {
    console.log("err:", err)
  }).finally(() => {
    console.log("finally")
  })
  