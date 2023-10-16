import { JSX, ArrayElement } from "./jsx.type";

type Output = JSX.Element | string | number;
type OutputOrUndef = JSX.Element | string | number | undefined | {};


export const ID_SWITCH_CASE = Symbol('switch_case');
export const ID_IF_ELSEIF_ELSE = Symbol('if_else-if_else');

/**
 * foreach
 * @param  {Array}   array:
 * @param  {Function} handler:
 * @return {String}
 */
function forEach<List extends readonly any[]>(array: List, handler: (el: ArrayElement<List>, i: number) => JSX.Element | string | number | undefined | null): Array<Output> {
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

type Task<TValue> = JSX.Element | string | number | {} | ((value: TValue) => JSX.Element | string | number | {});

class SwitchCase<TValue> {
  readonly [ID_SWITCH_CASE]: this = this;
  private readonly _list: Array<[any, Task<TValue>]> = [];
  private _defaultTask?: Task<TValue>;

  constructor(private readonly _val: TValue) {}

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

  getAsAttr() {
    const result = this.get();
    return result || {};
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

type Cb<Value> = JSX.Element | string | number | undefined | {} | ((value: Exclude<Value, false>) => JSX.Element | string | number | undefined | {}) ;
type CbElse = JSX.Element | string | number | undefined | {} | (() => JSX.Element | string | number | undefined | {}) ;
type Condition = Boolean | (() => any) | (() => Boolean);
type ListElseIf<TCondition extends Condition> = Array<{ condition: TCondition; cb: Cb<TCondition> }>;
/**
 * if
 * @example
 * tpl.if(value === 1, () => <p>is 1</p>).get();
 * tpl.if(value === 1, () => <p>is 1</p>).else( <p>is 10</p>).get();
 * <div>{tpl.if(value === 1, () => <p>is 1</p>).elseIf(value === 10, () => <p>is 10</p>)}</div>
*/
function _if<Condition>(conditon: Condition, ifCb: Cb<Condition>) {
  return new IfElseIfElse(conditon, ifCb);
};


class IfElseIfElse<IfCondition> {
  readonly [ID_IF_ELSEIF_ELSE]: this = this;
  private readonly _listElseIf: ListElseIf<any> = [];
  private _elseCb?: CbElse;

  /**
   * if
   * @example
   * tpl.if(value === 1, () => <p>is 1</p>).get();
   * tpl.if(value === 1, () => <p>is 1</p>).else( <p>is 10</p>).get();
   * <div>{tpl.if(value === 1, () => <p>is 1</p>).elseIf(value === 10, () => <p>is 10</p>)}</div>
   */
  constructor(private readonly _condition: IfCondition, private readonly _ifCb: Cb<IfCondition>) {}


  /**
   * else_if - optional method
   * @example
   * tpl.if(value === 1, () => <p>is 1</p>).else_if(10 === 10, () => <p>is 10</p>).get();
   * tpl.if(value === 1, () => <p>is 1</p>).else_if(10 === 10, <p>is 10</p>).get();
   * <div>{tpl.if(value === 1, () => <p>is 1</p>).else_if(value === 10, () => <p>is 10</p>)}</div>
   * @param  {function():boolean}   conditon
   * @param  {function(): string | string} cb
   * @return {obj}
   */
  else_if<Condition>(condition: Condition, cb: Cb<Condition>) {
    this._listElseIf.push({ condition, cb });
    return this;
  }

  /**
   * elseIf - optional method
   * @example
   * tpl.if(value === 1, () => <p>is 1</p>).elseIf(10 === 10, () => <p>is 10</p>).get();
   * tpl.if(value === 1, () => <p>is 1</p>).elseIf(10 === 10, <p>is 10</p>).get();
   * <div>{tpl.if(value === 1, () => <p>is 1</p>).elseIf(value === 10, () => <p>is 10</p>)}</div>
   */
  elseIf<Condition>(condition: Condition, cb: Cb<Condition>) {
    return this.else_if(condition, cb);
  }

  /**
   * else - optional method
   * @example
   * tpl.if(value === 1, () => <p>is 1</p>).else(() => <p>is other</p>).get();
   * tpl.if(value === 1, () => <p>is 1</p>).else(<p>is other</p>).get();
   * @param  {function():string} cb
   * @return {obj} return self
   */
  else(cb: CbElse) {
    this._elseCb = cb;
    return this;
  }

  get(): OutputOrUndef {
    const condition = (typeof this._condition === 'function') ? this._condition() : this._condition;
    if (Boolean(condition)) {
      if (typeof this._ifCb === 'function') {
        return this._ifCb(condition);
      } else {
        return this._ifCb;
      }
    } else {
      const elseIf = this._searchInElseIf();
      if (elseIf !== false) {
        if (typeof elseIf.cb === 'function') {
          return elseIf.cb(elseIf.conditon);
        } else {
          // as value
          return elseIf.cb;
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

  getAsAttr() {
    const result = this.get();
    return result || {};
  }


  toString() {
    return this.get();
  }

  valueOf() {
    return this.get();
  }


  private _searchInElseIf() {
    const listElseIf = this._listElseIf
    if (!listElseIf.length) {
      return false;
    }
    for (let i = 0, l = listElseIf.length; i < l; i++) {
      const el = listElseIf[i];
      const conditon = (typeof el.condition === 'function') ? el.condition() : el.condition;
      if (Boolean(conditon)) {
        return { conditon, cb: el.cb };
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


