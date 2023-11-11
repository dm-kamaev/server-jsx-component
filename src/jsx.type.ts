// https://www.typescriptlang.org/docs/handbook/jsx.html

import type Script from './element/Script';
import type CssClass from './element/CssClass';
import type Link from './element/Link';

export interface ContextRender extends Record<string, { css: Array<Css>, sharedData: Array<any> }> {}

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;


interface ElementData {
  _id?: string;
  _css?: Array<Css>;
  _js?: (sharedData: any[]) => Array<Js>;
  _headJs?: (sharedData: any[]) => Array<Js>;
  _sharedData?: any;
}


interface PageData {
  _id: string;
  _minify: boolean;
  _htmlTag: string;
  _head: string[];
  _title: string;
  _description: string;
  _keywords: string;
  _css?: Array<Css>;
  _js?: (sharedData: any[]) => Array<Js>;
  _headJs?: (sharedData: any[]) => Array<Js>;
  _sharedData: any;
}

export declare namespace JSX {
  export interface IComponent<P = {}, C = JSX.Children> {
    props: Readonly<P> | P;
    children: C;
    render(props: Readonly<P> | P, children: C): JSX.Element;
    // ==== custom methods/fields ====
    setCss(css: Array<Css>): this;
    buildDataForRender?(): ElementData;
    buildDataForRenderPage?(): PageData;
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

  interface JSXData {
    elementName?: ElementName;
    attributes?: Attribute;
    children?: Children;
  }

  export interface Element extends JSXData, ElementData {
    // ==== custom methods/fields ====
    _build?: (context: ContextRender) => Element;
    // _id?: string;
    // _css?: Array<Css>;
    // _js?: (sharedData: any[]) => Array<Js>;
    // _headJs?: (sharedData: any[]) => Array<Js>;
    // _sharedData?: any;
  }

  interface JSXElementPage extends JSXData, PageData {}

  export interface ElementPage extends Element {
    // ==== custom methods/fields ====
    _build: (context: ContextRender) => JSXElementPage;
  }

  export interface IntrinsicElements {
    [key: string]: any;
  }
}

export type Css = string | Link | CssClass;
export type Js = string | Script | JSX.Element;

