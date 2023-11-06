import IgnisComp from './IgnisComp';
import { JSX, Js } from './jsx.type';

import { IGenCssIdentifier } from './generator';

export default class IgnisHtmlPage<Props = { title?: string; description?: string; keywords?: string }, Children = any[], SharedData extends Record<string, any> = Record<string, any>> extends IgnisComp<Props, Children, SharedData> {
  constructor(public readonly props: Props, public children: Children, inputSettings: { generatorClassName?: IGenCssIdentifier; generatorId?: IGenCssIdentifier } = {}) {
    super(props, children, inputSettings);
  }

  // hook
  // protected init(data: D) { }



  // hook
  // addStyleToEnd(): Array<Css> {
  //   return [];
  // }

  protected minify() {
    return false;
  }

  protected htmlTag() {
    return '<html lang="EN">';
  }

  protected head() {
    return [
      '<meta charset="UTF-8">',
      '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    ];
  }

  protected title() {
    return 'Hello, I am page with IgnisComponent !';
  }

  protected description() {
    return '';
  }

  protected keywords() {
    return '';
  }

  // protected style(): Array<Css> {
  //   return [];
  // }

  protected headJs(): Array<Js> {
    return [];
  }

  protected js(): Array<Js> {
    return [];
  }


  buildDataForRenderPage() {
    return {
      _id: this.id,
      _minify: this.minify(),
      _htmlTag: this.htmlTag(),
      _head: this.head(),
      _title: this.title(),
      _description: this.description(),
      _keywords: this.keywords(),
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

  render(props: Readonly<Props> | Props, children: Children): JSX.Element {
    throw new Error('Method render() not implemented');
  }
};

