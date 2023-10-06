import Script from '../element/Script';
import CssClass from '../element/CssClass';
import type Link from '../element/Link';
import Minify from '../transform/Minify';
import format from '../transform/format';

import { escape, escapeAttributes } from './jsx-factory/lib/escape';


const fragmentName = 'fragment';

interface JSXElementWithDataForRender extends JSX.Element {
  _id?: string;
  _css?: any[];
  _js?: (sharedData: any[]) => any[];
  _headJs?: (sharedData: any[]) => any[];
  _sharedData?: any;
}

interface JSXElementPageWithDataForRender extends JSXElementWithDataForRender {
  _minify?: boolean;
  _htmlTag?: string;
  _head?: string[];
  _title?: string;
  _description?: string;
  _keywords?: string;
}


export function toObject(
  vnode: JSX.Element,
  escapeMode: boolean,
  context: Record<string, { sharedData: any[] }> = {},
) {

  const { css, html, getHeadJs, getJs } = traverseToObject(vnode, escapeMode, context);

  // console.log({ getHeadJs });
  const headJs = getHeadJs.map(el => {
    // console.log(el.get.toString());
    return el.get(context[el.id].sharedData || []).map(convertJsInlineToString);
  }).flat();
  // console.log({ headJs: headJs });

  const js = getJs.map(el => {
    return el.get(context[el.id].sharedData || []).map(convertJsInlineToString);
  }).flat();
  // console.log({ js });

  return { css, html, headJs, js };
};


function traverseToObject(
  inputVnode: JSXElementWithDataForRender,
  escapeMode: boolean,
  context: Record<string, { sharedData: any[] }> = {},
) {
  let css: Array<string | Link> = [];
  let getJs: Array<{ id: string; get: (sharedData: any[]) => Array<string | Script | JSX.Element> }> = [];
  let getHeadJs: Array<{ id: string; get: (sharedData: any[]) => Array<string | Script | JSX.Element> }> = [];

  let vnode: JSXElementWithDataForRender = inputVnode;

  if (typeof vnode !== 'object') {
    return { css, html: vnode, getHeadJs, getJs };
  }

  // console.dir(vnode, { depth: 20 });

  const { elementName, attributes, children: _children } = vnode;
  // console.log({ attributes });
  const children = escapeMode && !attributes?.noEscape ? (_children.map(item => escape(item))) : _children;

  if (vnode._id && !context[vnode._id]) {
    if (vnode._css) {
      css = vnode._css;
    }

    if (vnode._headJs) {
      getHeadJs.push({ id: vnode._id, get: vnode._headJs });
    }

    if (vnode._js) {
      getJs.push({ id: vnode._id, get: vnode._js });
    }

    context[vnode._id] = { sharedData: [] };
  }

  const sharedData = vnode._sharedData;
  if (sharedData && vnode._id) {
    context[vnode._id].sharedData.push(sharedData);
  }

  // serialize attributes
  const attribtesAsString = convertAttributesToString(attributes, escapeMode);

  const htmlChildren: string = children ? children.map(vnode => {
    if (typeof vnode !== 'object') {
      return vnode;
    }
    const { css: _css, html, getHeadJs: _getHeadJs, getJs: _getJs } = traverseToObject(vnode, escapeMode, context);
    if (_css.length) {
      css = css.concat(_css);
    }
    if (_getHeadJs.length) {
      getHeadJs = getHeadJs.concat(_getHeadJs);
    }
    if (_getJs.length) {
      getJs = getJs.concat(_getJs);
    }
    return html;
  }).join('') : '';

  const html = elementName === fragmentName ? htmlChildren : `<${elementName}${attribtesAsString}>${htmlChildren}</${elementName}>`;

  return { css, html, getHeadJs, getJs };
};


export function toHtmlPage(vnode: JSXElementPageWithDataForRender, options: { escape: boolean }) {
  const { attributes, children } = vnode;

  const context = {};

  // console.dir(children, { depth: 10 });
  // render components to string
  const body = children.map(el => toObject(el, options.escape, context));

  const listHtml: Array<string | number> = [];
  const listHeadJs: Array<string | Script>[] = [(vnode._headJs?.(vnode._sharedData).map(convertJsInlineToString) || [])];
  const listJs: Array<string | Script>[] = [(vnode._js?.(vnode._sharedData).map(convertJsInlineToString) || [])];
  const listStyle: Array<string | Link>[] = vnode._css || [];

  body.forEach(el => {
    listHtml.push(el.html);
    listStyle.push(el.css);
    listJs.push(el.js);
    listHeadJs.push(el.headJs);
  });

  const headJs = format.js(listHeadJs.flat());
  const js = format.js(listJs.flat());
  const style = format.style(listStyle.flat());

  const minify = new Minify(vnode._minify ?? false);
  return (
    '<!DOCTYPE html>' +
    `${(vnode as any)._htmlTag}` +
    '<head>' +
      `${minify.html(format.title(attributes?.title || vnode._title))}` +
      `${minify.html(format.description(attributes?.description || vnode._description))}` +
      `${minify.html(format.keywords(attributes?.keywords || vnode._keywords))}` +

    `${(vnode._head || []).join('')}` +

    `${minify.style(style)}` +
    `${headJs}` +
    '</head>' +
    '<body>' +
    `${listHtml.join('')}` +
    `${js}` +
    '</body>' +
    '</html>'
  );
};


function convertJsInlineToString(el: string | Script | JSX.Element) {
  if (typeof el === 'string' || el instanceof Script) {
    return el;
  } else {
    if (el.attributes?.escape) {
      el.children = el.children.map(item => escape(item));
    }
    return `${el.children.join('')}`;
  }
}


function convertAttributesToString(attributes: JSX.Attribute, escapeMode: boolean) {
  if (attributes) {
    const result: string[] = [];
    Object.entries(escapeAttr(attributes, escapeMode)).forEach(([key, value]) => {
      if (value instanceof CssClass) {
        result.push(`${key}="${value.getName()}"`);
      } else if (key === 'noEscape') {
        return;
      } else {
        result.push(`${key}="${value}"`);
      }
    });
    return result.length ? ' '+result.join(' ') : '';
  } else {
    return '';
  }
}

function escapeAttr(attr: NonNullable<JSX.Attribute>, escape: boolean) {
  return escape ? escapeAttributes(attr) as NonNullable<JSX.Attribute> : attr;
}




