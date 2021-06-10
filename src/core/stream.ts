import { Observer, Operator, PartialObserver, Publisher, Subscription } from './help'
import { trySubscribe } from './utils/try-subscribe'

class Subscriber<T> {
  private closed = false
  private destinationOrNext: Required<PartialObserver<T>>;

  constructor(destinationOrNext: PartialObserver<any> | ((value: T) => void)) {
    // if(typeof destinationOrNext === 'function'){
    //   this.destinationOrNext
    // }
  }

  next(value: T) {
    if (this.closed) {
      return;
    }
    this.destinationOrNext.next(value);
  }

  error(err: any) {
    if (this.closed) {
      return;
    }
    this.closed = true;
    if (this.destinationOrNext.error) {
      this.destinationOrNext.error(err);
    }
    throw err;
  }

  complete() {
    if (this.closed) {
      return;
    }
    this.closed = true
    this.destinationOrNext.complete();
  }
}

export class Stream<T> {
  constructor(protected source: (subscriber: Subscriber<T>) => Subscription | Function | void = observer => {
    observer.complete();
  }) {
  }

  pipe(): Stream<T>;
  pipe<V1>(op1: Operator<T, V1>): Stream<V1>;
  pipe<V1, V2>(op1: Operator<T, V1>, op2: Operator<V1, V2>): Stream<V2>;
  pipe<V1, V2, V3>(op1: Operator<T, V1>, op2: Operator<V1, V2>, op3: Operator<V2, V3>): Stream<V3>;
  pipe<V1, V2, V3, V4>(op1: Operator<T, V1>, op2: Operator<V1, V2>, op3: Operator<V2, V3>, op4: Operator<V3, V4>): Stream<V4>;
  pipe<V1, V2, V3, V4, V5>(op1: Operator<T, V1>, op2: Operator<V1, V2>, op3: Operator<V2, V3>, op4: Operator<V3, V4>, op5: Operator<V4, V5>): Stream<V5>;
  pipe<V1, V2, V3, V4, V5, V6>(op1: Operator<T, V1>, op2: Operator<V1, V2>, op3: Operator<V2, V3>, op4: Operator<V3, V4>, op5: Operator<V4, V5>, op6: Operator<V5, V6>): Stream<V6>;
  pipe<V1, V2, V3, V4, V5, V6, V7>(op1: Operator<T, V1>, op2: Operator<V1, V2>, op3: Operator<V2, V3>, op4: Operator<V3, V4>, op5: Operator<V4, V5>, op6: Operator<V5, V6>, op7: Operator<V6, V7>): Stream<V7>;
  pipe<V1, V2, V3, V4, V5, V6, V7, V8>(op1: Operator<T, V1>, op2: Operator<V1, V2>, op3: Operator<V2, V3>, op4: Operator<V3, V4>, op5: Operator<V4, V5>, op6: Operator<V5, V6>, op7: Operator<V6, V7>, op8: Operator<V7, V8>): Stream<V8>;
  pipe<V1, V2, V3, V4, V5, V6, V7, V8, V9>(op1: Operator<T, V1>, op2: Operator<V1, V2>, op3: Operator<V2, V3>, op4: Operator<V3, V4>, op5: Operator<V4, V5>, op6: Operator<V5, V6>, op7: Operator<V6, V7>, op8: Operator<V7, V8>, op9: Operator<V8, V9>): Stream<V9>;
  pipe(...operators: Operator<any, any>[]): Stream<any>;
  pipe(...operators: Operator<any, any>[]): Stream<any> {
    if (operators.length === 0) {
      return this;
    }
    return operators.reduce((stream, nextOperator) => {
      return nextOperator(stream)
    }, this)
  }

  subscribe(observer?: PartialObserver<T>): Subscription;
  subscribe(observer?: ((value: T) => void), error?: (err: any) => void, complete?: () => void): Subscription;
  subscribe(
    observer: any = function () {
    },
    error?: any,
    complete?: any): Subscription {
    let subscriber: Subscriber<T>;
    if (typeof observer === 'function') {
      subscriber = new Subscriber({
        next: observer,
        error,
        complete
      })
    } else {
      subscriber = new Subscriber(observer);
    }

    const unsubscription = this.source(subscriber);

    if (typeof unsubscription === 'function') {
      return {
        unsubscribe() {
          unsubscription()
        }
      }
    } else if (typeof (unsubscription as Subscription).unsubscribe === 'function') {
      return unsubscription as Subscription
    }
    return {
      unsubscribe() {
      }
    }
  }

  toPromise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.subscribe(value => resolve(value), err => reject(err));
    })
  }
}

