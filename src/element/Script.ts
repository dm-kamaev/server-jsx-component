let COUNTER = 0;

export default class Script {
  private _howLoad: string = '';
  private _code: string = '';
  private _onloadFuncName: string = '';
  private _onloadCb: null | string = null;

  static createOnloadName() {
    return '__onload_' + Math.floor(Date.now() + COUNTER++);
  }

  constructor(private _src: string) {}

  async() {
    this._howLoad = ' async';
    return this;
  }

  defer() {
    this._howLoad = ' defer';
    return this;
  }

  code(code: string) {
    this._code = code;
    return this;
  }


  onload(code: string) {
    // TODO: generate function name
    this._onloadFuncName = Script.createOnloadName();
    this._onloadCb = `function ${this._onloadFuncName}(){${code}}`;
    return this;
  }

  _if(val: string, template: string) {
    return val ? template : '';
  }

  toString() {
    let res = '';
    if (this._onloadFuncName) {
      res += `<script>${this._onloadCb}</script>`;
    }
    res += `<script${this._if(this._src, ` src="${this._src}"`)}${this._howLoad}${this._if(this._onloadFuncName, ` onload="${this._onloadFuncName}();"`)}>${this._code}</script>`;

    return res;
  }
};
