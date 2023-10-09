
import Script from './element/Script'
import Link from './element/Link';
import CssClass, { CssNode } from './element/CssClass';
import CssLink from './element/CssLink';
import tpl from './tpl';
import { JSX, Js, Css } from './jsx.type';

import generator, { IGenCssIdentifier } from './generator';
import { escape, noEscape } from './jsx/escape';

// interface methods for function component
interface IInstance<TSharedData extends Record<string, any> = Record<string, any>> {
  css: {
    (css: string): CssClass;
    (css: Link): Link;
    (css: CssNode): CssClass;
    (className: string, css: CssNode): CssClass;
  },
  cssLink: (href: string) => CssLink;
  link: (href: string) => Link;
  script: (src: string) => Script;
  getSharedData: () => TSharedData[]
}

export default class IgnisComp<Props, Children = any[], SharedData extends Record<string, any> = Record<string, any>> implements JSX.IComponent<Props, Children> {
  readonly id: string;
  readonly tpl: typeof tpl = tpl;
  readonly escape = escape;
  readonly noEscape = noEscape;
  private readonly _settings: { generatorClassName: IGenCssIdentifier['next']; generatorId: IGenCssIdentifier['next'] };
  private _css: Array<Css> = [];
  private _sharedData: SharedData = {} as SharedData;
  private _listSharedData: Array<SharedData> = [] as SharedData[];

  static setDataForFuncComponent<TSharedData extends Record<string, any> = Record<string, any>>(
    fnComponent: {
      (...arg): JSX.Element,
      _css?: Array<Css>,
      _js?: (sharedData: Array<TSharedData>) => Array<Js>;
      _headJs?: (sharedData: Array<TSharedData>) => Array<Js>;
      _sharedData?: TSharedData
    },
    data: { css?: (this: IInstance<TSharedData>) => void, js?: (this: IInstance<TSharedData>) => Array<Js>; headJs?: (this: IInstance<TSharedData>) => Array<Js>; sharedData?: TSharedData }
  ): void {
    const comp = new IgnisComp({}, []);
    const methods = {
      css: comp.css.bind(comp),
      cssLink: comp.cssLink.bind(comp),
      link: comp.link.bind(comp),
      script: comp.script.bind(comp),
      getSharedData: () => [],
    };

    fnComponent._css = undefined;
    if (data.css) {
      data.css.bind(methods)();
      fnComponent._css = comp.$getCompCss();
    }

    fnComponent._sharedData = data.sharedData || undefined;

    if (data.js) {
      const getJs = data.js;
      fnComponent._js = (sharedData: TSharedData[]) => {
        return getJs.bind({ ...methods, getSharedData: () => sharedData })();
      };
    }

    if (data.headJs) {
      const getHeadJs = data.headJs;
      fnComponent._headJs = (sharedData: TSharedData[]) => {
        return getHeadJs.bind({ ...methods, getSharedData: () => sharedData, })();
      };
    }
  }

  static cleanFuncComponent(fnComponent: { (...arg): JSX.Element, _css?: Array<Css>, _js?: (sharedData: Array<any>) => Array<Js>; _headJs?: (sharedData: Array<any>) => Array<Js>; _sharedData?: ShareData }) {
    fnComponent._css = undefined;
    fnComponent._sharedData = undefined;
    fnComponent._js = undefined;
    fnComponent._headJs = undefined;
  }

  static buildDataForRender(fnComponent: { (...arg): JSX.Element, _css?: () => Array<Css>, _js?: (sharedData: Array<any>) => Array<Js>; _headJs?: (sharedData: Array<any>) => Array<Js>; _sharedData?: ShareData }) {
    return {
      _id: _getCallerFile(),
      _css: fnComponent._css,
      _js: fnComponent._js,
      _headJs: fnComponent._headJs,
      _sharedData: fnComponent._sharedData,
    };
  }

  constructor(public readonly props: Props, public children: Children, inputSettings?: { generatorClassName?: IGenCssIdentifier; generatorId?: IGenCssIdentifier }) {
    const stack = _getCallerFile();
    this.id = stack + ':' + this.constructor.name;

    const settings = {
      generatorClassName: inputSettings?.generatorClassName || generator.forClass(),
      generatorId: inputSettings?.generatorId || generator.forId(),
    };

    this._settings = {
      generatorClassName: () => settings.generatorClassName.next(),
      generatorId: () => settings.generatorId.next(),
    };
  }

  protected cssLink(href: string) {
    return new CssLink(href);
  }

  protected link(href: string) {
    return new Link(href);
  }

  protected script(src: string) {
    return new Script(src);
  }

  protected css(css: string): CssClass;
  protected css(css: Link): Link;
  protected css(css: CssNode): CssClass;
  protected css(className: string, css: CssNode): CssClass;
  protected css(...arg) {
    let obj: string | Link | CssClass;
    const hasOneParam = arg.length === 1;
    const param1 = arg[0];
    const param2 = arg[1];
    if ((hasOneParam && typeof param1 === 'string') || (hasOneParam && param1 instanceof Link)) {
      obj = param1;
    } else if (hasOneParam && param1 instanceof Object) {
      const class_name = this._settings.generatorClassName();
      obj = new CssClass(class_name, param1);
    } else if (arg.length === 2 && typeof param1 === 'string' && param2 instanceof Object) {
      const class_name = param1.replace(/^\./, '');
      obj = new CssClass(class_name, arg[1]);
    } else {
      throw new Error(`Invalid arguments: ${arg.join(', ')}`);
    }

    // if (cl_name === 'User') {
    //   console.log('origin', obj);
    // }
    this._css.push(obj);
    return obj;
  }

  protected headJs(): Array<Js> {
    return [];
  }

  protected js(): Array<Js> {
    return [];
  }

  protected setSharedData<K extends keyof SharedData & string>(key: K, value: SharedData[K]) {
    this._sharedData[key] = value;
    return this._sharedData[key];
  }

  protected $getSharedData() {
    return this._sharedData;
  }

  protected getListSharedData() {
    return this._listSharedData;
  }

  protected $setListSharedData(sharedData: Array<SharedData>) {
    this._listSharedData = sharedData;
  }

  protected $cleanSharedData() {
    this._listSharedData = [];
  }

  protected createId() {
    return this._settings.generatorId();
  }

  protected createClassName() {
    return this._settings.generatorClassName();
  }

  private _getCompCss() {
    return this._css;
  }

  // for functional component
  $getCompCss() {
    return this._getCompCss();
  }

  render(props: Props, children: Children): JSX.Element {
    throw new Error(`Method "render" is not implemented`);
  }

  buildDataForRender() {
    return {
      _id: this.id,
      _css: this._getCompCss(),
      _js: (sharedData: SharedData[]) => {
        this.$setListSharedData(sharedData);
        const js = this.js();
        this.$cleanSharedData();
        return js;
      },
      _headJs: (sharedData: SharedData[]) => {
        this.$setListSharedData(sharedData);
        const headJs = this.headJs();
        this.$cleanSharedData();
        return headJs;
      },
      _sharedData: this.$getSharedData(),
    };
  }
}


function _getCallerFile(): string {
  let filename;

  let _pst = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_err, stack) { return stack; };
  try {
    let err: { stack: { getFileName: () => string }[] } = new Error() as any;
    let callerfile;
    let currentfile;

    currentfile = err.stack.shift()?.getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift();
      if (currentfile !== callerfile.getFileName()) {
        filename = callerfile.getFileName() + ':' + callerfile.getLineNumber();
        break;
      }
    }
    // eslint-disable-next-line no-empty
  } catch (err) { }
  Error.prepareStackTrace = _pst;

  return filename;
}
