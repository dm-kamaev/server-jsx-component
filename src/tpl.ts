import { JSX } from "./jsx.type";

type Output = JSX.Element | string | number;
type OutputOrUndef = JSX.Element | string | number | undefined;

/**
 * foreach
 * @param  {Array}   array:
 * @param  {Function} handler:
 * @return {String}
 */
function forEach<T>(array: T[], handler: (el: T, i: number) => JSX.Element | string | number | undefined | null): Array<Output> {
  const res: Array<Output> = [];
  for (let i = 0, l = array.length; i < l; i++) {
    const el = array[i];
    if (el !== null || el !== undefined) {
      const output = handler(el, i);
      if (output) {
        res.push(output);
      }
    }
  }
  return res;
}


/**
 * each – for objects
 * @example
 * tpl.each({ 1: 'Hello', 'string': 2 }, function(key, value) {
 *   console.log(key, value);
 * });
 * @param  {Object}   obj
 * @param  {Function} cb(key, value)
 * @return {String}
 */
function each<T extends {}>(obj: T, handler: (el: T[keyof T], key: keyof T, i: number) => JSX.Element | string | number | undefined | null): Array<Output> {
  const res: Array<Output> = [];
  const keys = Object.keys(obj) as Array<keyof T>;
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    const output = handler(obj[key], key, i);
    if (output) {
      res.push(output);
    }
  }
  return res;
}



/**
 * switch
 * @example
 * let res = tpl.switch(3).case(1, function () {
 *   return '<p>1</p>';
 * }).case(2, function () {
 *   return '<p>2</p>';
 * }).default(function () {
 *  return '<p>other</p>';
 * }).get();
 * @param  {Any} val
 * @return {String}
 */
function _switch<TValue>(val: TValue) {
  return new SwitchCase(val);
}

type Task<TValue> = JSX.Element | string | number | ((value: TValue) => JSX.Element | string | number);

class SwitchCase<TValue> {
  private readonly _list: Array<[any, Task<TValue>]>;
  private _defaultTask?: Task<TValue>;

  constructor(private _val: TValue) {
    this._list = [];
  }

  /**
   * case
   */
  case(condition: TValue | Array<TValue>, task: Task<TValue>) {
    this._list.push([condition, task]);
    return this;
  }

  /**
   * default
   */
  default(defaultTask: Task<TValue>) {
    this._defaultTask = defaultTask;
    return this;
  }

  /**
   * get
   */
  get(): OutputOrUndef {
    for (let i = 0, l = this._list.length; i < l; i++) {
      const els = this._list[i];
      const condition = els[0];
      const task = els[1];

      if (condition === this._val || (condition instanceof Array && new Set(condition).has(this._val))) {
        const result = typeof task === 'function' ? task(this._val) : task;
        return result;
      }
    }
    return typeof this._defaultTask === 'function' ? this._defaultTask(this._val) : this._defaultTask;
  }

  toString() {
    return this.get();
  }
}

/**
 * func: call function and return value
 * @example
 * tpl.func(() => {
 *   if (true) {
 *     return <div>Ok</div>;
 *   } else {
 *     return <div>Ok</div>;
 *   }
 * });
 * @param  {Function} cb
 * @return {String}
 */
function func(cb: () => JSX.Element | string | number | undefined) {
  return cb();
};


type Cb = JSX.Element | string | number | (() => JSX.Element | string | number | undefined);
/**
 * if
 * @param  {function(): boolean | boolean} conditon
 * @param  {function(): string | string} if_cb - cb for if
 * @return {function(): string}
*/
function _if(conditon: Boolean | (() => Boolean), ifCb: Cb) {
  return new IfElseIfElse(conditon, ifCb);
};


class IfElseIfElse {
  private readonly _listElseIf: Array<{ condition: Boolean | (() => Boolean); cb: Cb }> = [];
  private _elseCb?: Cb;

  constructor(private readonly _condition, private readonly ifCb) {}

  /**
   * else_if - optional method
   * @example tpl.if(10 === 1, () => <p>is 1</p>).else_if(10 === 10, () => <p>is 10</p>).get();
   * @param  {function():boolean}   conditon
   * @param  {function(): string | string} cb
   * @return {obj}
   */
  else_if(condition: Boolean | (() => Boolean), cb: Cb) {
    this._listElseIf.push({ condition, cb });
    return this;
  }

  /**
   * elseIf - optional method
   * @example tpl.if(10 === 1, () => <p>is 1</p>).else_if(10 === 10, () => <p>is 10</p>).get();
   */
  elseIf(condition: Boolean | (() => Boolean), cb: Cb) {
    return this.else_if(condition, cb);
  }

  /**
   * else - optional method
   * @example tpl.if(10 === 1, () => <p>is 1</p>).else(() => <p>is other</p>).get();
   * @param  {function():string} cb
   * @return {obj} return self
   */
  else(cb: Cb) {
    this._elseCb = cb;
    return this;
  }

  get(): OutputOrUndef {
    const condition = (typeof this._condition === 'function') ? this._condition() : this._condition;
    if (Boolean(condition)) {
      if (typeof this.ifCb === 'function') {
        return this.ifCb();
      } else {
        return this.ifCb;
      }
    } else {
      const elseIfCb = this._searchInElseIf();
      if (elseIfCb !== false) {
        if (typeof elseIfCb === 'function') {
          return elseIfCb();
        } else {
          return elseIfCb;
        }
      } else {
        if (typeof this._elseCb === 'function') {
          return this._elseCb();
        } else {
          return this._elseCb;
        }
      }
    }
  }

  toString() {
    return this.get();
  }

  /**
   * _search_in_else_if
   * @param  {Array<{ conditon: function():boolean, cb: function():string | string }>} list_else_if
   * @return {boolean}
   */
  private _searchInElseIf() {
    const listElseIf = this._listElseIf
    if (!listElseIf.length) {
      return false;
    }
    for (let i = 0, l = listElseIf.length; i < l; i++) {
      const el = listElseIf[i];
      const conditon = (typeof el.condition === 'function') ? el.condition() : el.condition;
      if (Boolean(conditon)) {
        return el.cb;
      }
    }
    return false;
  }

}


function _class<TInput extends Record<string | number, boolean>>(obj: TInput) {
  const classes: string[] = [];

  const keys = Object.keys(obj);
  for (let i = 0, l = keys.length; i < l; i++) {
    const className = keys[i];
    if (obj[className]) {
      classes.push(className);
    }
  }

  let result: { class?: string } = {};
  if (classes.length === 1) {
    result = { class: classes[0] };
  } else {
    result = { class: classes.join(' ') };
  }
  return result;
}

export default {
  forEach,
  each,

  if: _if,
  IfElseIfElse,

  switch: _switch,
  SwitchCase,

  func,
  class: _class,
}