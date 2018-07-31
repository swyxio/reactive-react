import Observable from 'zen-observable'
export { merge, combineLatest, zip } from 'zen-observable/extras'

export function Interval(tick = 1000) {
  return new Observable(observer => {
    let timer = () => setTimeout(() => {
      observer.next('tick');
      timer()
      // observer.complete();
    }, tick);
    timer()
  
    // On unsubscription, cancel the timer
    return () => clearTimeout(timer);

  })
}

export function fromEvent(el, eventType) {
  return new Observable(observer => {
    const handler = e => observer.next(e)
    el.addEventListener(eventType, handler)
    // on unsub, remove event listener
    return () => el.removeEventListener(eventType, handler)
  })
}

const NOINIT = Symbol('NO_INITIAL_VALUE')
export function scan(obs, cb, seed = NOINIT) {
  let sub, acc = seed, hasValue = false
  const hasSeed = acc !== NOINIT
  return new Observable(observer => {
    sub = obs.subscribe(value => {
      // console.log('received', {val})
      if (observer.closed) return
      let first = !hasValue;
      hasValue = true

      if (!first || hasSeed ) {
        try { acc = cb(acc, value) }
        catch (e) { return observer.error(e) }
        observer.next(acc);
      }
      else {
        acc = value
      }
    })
    return sub
  })
}

// Flatten a collection of observables and only output the newest from each
export function switch(higherObservable) {
  return new Observable(observer => {
    let currentObs = null
    return higherObservable.subscribe({
      next(obs) {
        if (currentObs) currentObs() // unsub and switch
        currentObs = obs.subscribe(observer.subscribe)
      },
      error(e) {
        observer.error(e) // untested
      },
      complete() {
        // i dont think it should complete?
        // observer.complete()
      }
    })
  });
}

export function mapToConstant(obs, val) {
  return new Observable(observer => {
    const handler = obs.subscribe(() => observer.next(val))
    return handler
  })
}

export function startWith(obs, val) {
  return new Observable(observer => {
    observer.next(val) // immediately output this value
    const handler = obs.subscribe(x => observer.next(x))
    return handler
  })
}