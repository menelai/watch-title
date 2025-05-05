import {ActivatedRoute, ActivationEnd, Router} from '@angular/router';
import {delay, filter, map, ReplaySubject, startWith, Subscription, switchMap} from 'rxjs';

type SetTitleMethod = (title: string) => void;

export const WatchTitle = (): MethodDecorator => {
  const title$ = new ReplaySubject<string>();

  let subs: Subscription;

  return <T = SetTitleMethod>(
    target: any,
    methodName: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void => {
    if (target.constructor.prototype.____TitleWatcher____) {
      throw new Error(`There can be only one @WatchTitle() in ${target.constructor.name}`);
    }

    if (!(descriptor?.value instanceof Function)) {
      throw Error(`'@WatchTitle()' can be applied only to the class method which accepts a string`);
    }

    target.constructor.prototype.____TitleWatcher____ = methodName;

    const originalSetTitle = descriptor.value as SetTitleMethod;
    descriptor.value = function(title: string): void {
      title$.next(title);
    } as T;

    const originalNgOnInit = target.constructor.prototype.ngOnInit;
    target.constructor.prototype.ngOnInit = function(this: any): void {
      originalNgOnInit && originalNgOnInit.call(this);

      let router: Router | null = null;
      let route: ActivatedRoute | null = null;

      for (const prop in this) {
        if (this[prop] instanceof ActivatedRoute) {
          route = this[prop];
        } else if (this[prop] instanceof Router) {
          router = this[prop];
        }
      }

      if (!router || !route) {
        throw new Error(`Inject Router and ActivatedRoute into ${target.constructor.name}`);
      }

      subs = router.events.pipe(
        filter(event => event instanceof ActivationEnd && event.snapshot.component === target.constructor),
        map(event => !!(event as ActivationEnd).snapshot.firstChild),
        startWith(!!route.snapshot.firstChild),
        filter(hasChild => !hasChild),
        switchMap(() => title$),
        delay(0),
      ).subscribe(title => {
        originalSetTitle.call(this, title);
      });
    };

    const originalNgOnDestroy = target.constructor.prototype.ngOnDestroy;
    target.constructor.prototype.ngOnDestroy = function(this: any): void {
      originalNgOnDestroy && originalNgOnDestroy.call(this);

      title$.complete();

      subs.unsubscribe();
    };

    return descriptor;
  };
};
