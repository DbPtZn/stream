import { Stream } from '../core/_api';

/**
 * 监听多个数据流，当任意一个有新值时，均向后发送
 */
export function merge<T1>(s1: Stream<T1>): Stream<T1>;
export function merge<T1, T2>(s1: Stream<T1>, s2: Stream<T2>): Stream<T1 | T2>;
export function merge<T1, T2, T3>(s1: Stream<T1>, s2: Stream<T2>, s3: Stream<T3>): Stream<T1 | T2 | T3>;
export function merge<T1, T2, T3, T4>(s1: Stream<T1>, s2: Stream<T2>, s3: Stream<T3>, s4: Stream<T4>): Stream<T1 | T2 | T3 | T4>;
export function merge<T1, T2, T3, T4, T5>(s1: Stream<T1>, s2: Stream<T2>, s3: Stream<T3>, s4: Stream<T4>, s5: Stream<T5>): Stream<T1 | T2 | T3 | T4 | T5>;
export function merge<T1, T2, T3, T4, T5, T6>(s1: Stream<T1>, s2: Stream<T2>, s3: Stream<T3>, s4: Stream<T4>, s5: Stream<T5>, s6: Stream<T6>): Stream<T1 | T2 | T3 | T4 | T5 | T6>;
export function merge<T1, T2, T3, T4, T5, T6, T7>(s1: Stream<T1>, s2: Stream<T2>, s3: Stream<T3>, s4: Stream<T4>, s5: Stream<T5>, s6: Stream<T6>, s7: Stream<T7>): Stream<T1 | T2 | T3 | T4 | T5 | T6 | T7>;
export function merge<T1, T2, T3, T4, T5, T6, T7, T8>(s1: Stream<T1>, s2: Stream<T2>, s3: Stream<T3>, s4: Stream<T4>, s5: Stream<T5>, s6: Stream<T6>, s7: Stream<T7>, s8: Stream<T8>): Stream<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
export function merge<T1, T2, T3, T4, T5, T6, T7, T8, T9>(s1: Stream<T1>, s2: Stream<T2>, s3: Stream<T3>, s4: Stream<T4>, s5: Stream<T5>, s6: Stream<T6>, s7: Stream<T7>, s8: Stream<T8>, s9: Stream<T9>): Stream<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export function merge<T>(...inputs: Stream<T>[]): Stream<T>;
export function merge(...inputs: Stream<any>[]): Stream<any>;
export function merge<T>(...inputs: Stream<T>[]): Stream<T> {
  return new Stream<T>(observer => {
    if (inputs.length === 0) {
      observer.complete();
    }
    const marks = inputs.map(i => {
      return {
        source: i,
        isComplete: false
      }
    })
    let hasError = false
    const subs = marks.map(s => {
      return s.source.subscribe(value => {
        if (hasError) {
          return;
        }
        try {
          observer.next(value);
        } catch (e) {
          hasError = true;
          throw e;
        }
      }, err => {
        if (hasError) {
          return
        }
        hasError = true;
        observer.error(err);
      }, () => {
        if (hasError) {
          return;
        }
        s.isComplete = true;
        if (marks.every(i => i.isComplete)) {
          observer.complete();
        }
      })
    })
    observer.onUnsubscribe(() => {
      subs.forEach(i => i.unsubscribe());
    })
  })
}
