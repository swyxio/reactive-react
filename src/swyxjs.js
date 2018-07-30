import Observable from 'zen-observable'
export { merge, combineLatest, zip } from 'zen-observable/extras'

export function Ticker(tick = 1000) {
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

export function scan(obs, cb, initial) {
  const INIT = Symbol('NO_INITIAL_VALUE')
  let sub, acc = INIT
  if (typeof initial !== 'undefined') acc = initial
  return new Observable(observer => {
    if (!sub) sub = obs.subscribe(val => {
      if (acc !== INIT) acc = cb(acc, val)
      observer.next(acc)
    })
  })
}
