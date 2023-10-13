// https://www.typescriptlang.org/docs/handbook/jsx.html

import type Script from './element/Script';
import type CssClass from './element/CssClass';
import type Link from './element/Link';

export declare namespace JSX {
  export interface IComponent<P = {}, C = JSX.Children> {
    props: Readonly<P> | P;
    children: C;
    render(props: Readonly<P> | P, children: C): JSX.Element;
    // ==== custom methods/fields ====
    buildDataForRender?(): {
      _id: string;
      _css: any[];
      _js: (sharedData: any[]) => any[];
      _headJs: (sharedData: any[]) => any[];
      _sharedData: any;
    };
    buildDataForRenderPage?(): {
      _id: string;
      _minify: boolean;
      _htmlTag: string;
      _head: string[];
      _title: string;
      _description: string;
      _keywords: string;
      _js: (sharedData: any[]) => any[];
      _headJs: (sharedData: any[]) => any[];
      _sharedData: any;
    }
  }

  export interface ClassComponent<P = {}> {
    prototype: IComponent;
    new(props: Readonly<P> | P, children: JSX.Children, settings?: { generatorClassName?: { next(): string }, generatorId?: { next(): string } }): IComponent;
  }

  export interface FunctionComponent<P = {}, C = JSX.Children> {
    (props: P, children: C): JSX.Element
  }

  export type ElementName = string | ClassComponent | FunctionComponent;

  export type Attribute = Record<string, any> | null;

  export type Children = Array<any>;

  export type Element = {
    elementName: ElementName;
    attributes: Attribute;
    children: Children;
  };

  export interface IntrinsicElements {
    [key: string]: any;
  }
}

export type Css = string | Link | CssClass;
export type Js = string | Script | JSX.Element;


export interface JSXElementWithDataForRender extends JSX.Element {
  _id?: string;
  _css?: Array<Css>;
  _js?: (sharedData: any[]) => Array<Js>;
  _headJs?: (sharedData: any[]) => Array<Js>;
  _sharedData?: any;
}

export interface JSXElementPageWithDataForRender extends JSXElementWithDataForRender {
  _minify?: boolean;
  _htmlTag?: string;
  _head?: string[];
  _title?: string;
  _description?: string;
  _keywords?: string;
}


export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;