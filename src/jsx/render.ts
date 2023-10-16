import Script from '../element/Script';
import CssClass from '../element/CssClass';
import Minify from '../transform/Minify';
import format from '../transform/format';

import { JSX, Css, Js, JSXElementPageWithDataForRender, JSXElementWithDataForRender } from '../jsx.type';

import { escape, escapeAttributes, NoEscape } from './escape';
import { ID_IF_ELSEIF_ELSE, ID_SWITCH_CASE } from '../tpl';


const fragmentName = 'fragment';


export function toObject(
  vnode: JSX.Element,
  escapeMode: boolean,
  context: Record<string, { sharedData: any[] }> = {},
) {

  const { css, html, getHeadJs, getJs } = traverseToObject(vnode, escapeMode, context);

  const headJs = getHeadJs.map(el => {
    return el.get(context[el.id].sharedData || []).map(convertJsInlineToString);
  }).flat();

  const js = getJs.map(el => {
    return el.get(context[el.id].sharedData || []).map(convertJsInlineToString);
  }).flat();

  return { css, html, headJs, js };
};


function traverseToObject(
  inputVnode: JSXElementWithDataForRender,
  escapeMode: boolean,
  context: Record<string, { sharedData: any[] }> = {},
) {
  let css: Array<Css> = [];
  let getJs: Array<{ id: string; get: (sharedData: any[]) => Array<Js> }> = [];
  let getHeadJs: Array<{ id: string; get: (sharedData: any[]) => Array<Js> }> = [];

  let vnode: JSXElementWithDataForRender = inputVnode;

  if (typeof vnode !== 'object') {
    return { css, html: vnode, getHeadJs, getJs };
  }

  // console.dir(vnode, { depth: 20 });

  const { elementName, attributes, children: _children } = vnode;
  // console.log(vnode, elementName, _children);
  const children = escapeMode && !attributes?.noEscape ? ((_children || []).map(item => escape(item))) : _children;

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
  // console.log(vnode.elementName);
  const attribtesAsString = convertAttributesToString(attributes, escapeMode);

  const htmlChildren: string = children ? children.map(vnode => {
    if (typeof vnode !== 'object') {
      if (vnode === ' ') {
        vnode = vnode.trim();
      }
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

  const html = !elementName ? '' : elementName === fragmentName ? htmlChildren : `<${elementName}${attribtesAsString}>${htmlChildren}</${elementName}>`;

  return { css, html, getHeadJs, getJs };
};


export function toHtmlPage(vnode: JSXElementPageWithDataForRender, options: { escape: boolean }) {
  const { attributes, children } = vnode;

  const context = {};

  // console.dir(children, { depth: 10 });
  // render components to string
  const body = children.map(el => toObject(el, options.escape, context));

  const listHtml: Array<string | number> = [];
  const listHeadJs: Array<Exclude<Js, JSX.Element>[]> = [(vnode._headJs?.(vnode._sharedData).map(convertJsInlineToString) || [])];
  const listJs: Array<Exclude<Js, JSX.Element>[]> = [(vnode._js?.(vnode._sharedData).map(convertJsInlineToString) || [])];
  const listStyle: Array<Css[]> = vnode._css ? [vnode._css] : [];

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
    `${minify.html(listHtml.join(''))}` +
    `${js}` +
    '</body>' +
    '</html>'
  );
};


export function toTurboHtml(vnode: JSXElementPageWithDataForRender, options: { targetElId?: string | number; escape: boolean }) {

  // const { children } = vnode;

  // console.dir(children, { depth: 10 });
  // render components to string

  const { html, css: listStyle, headJs: listHeadJs, js: listJs } = toObject(vnode, options.escape);

  let id = options.targetElId;
  if (!id) {
    id = vnode.attributes?.id;
    if (!id) {
      throw new Error('Not found targetElId: not passed and not found in root component. You should pass targetElId or set id for root component');
    }
  }

  const js = format.js(listHeadJs.flat().concat(listJs.flat()));
  const css = format.style(listStyle.flat());
  const minify = new Minify(vnode._minify ?? false);

  return { id, html: minify.html(html), css: minify.style(css), js };
}


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


function convertAttributesToString(inputAttributes: JSX.Attribute, escapeMode: boolean) {
  if (!inputAttributes) {
    return '';
  }
  const result: string[] = [];

  const ignoreFields: Set<string> = new Set();

    if (inputAttributes[ID_IF_ELSEIF_ELSE as unknown as string]) {
    ignoreFields.add('_condition').add('_ifCb').add('_listElseIf').add('_elseCb').add(ID_IF_ELSEIF_ELSE as unknown as string);
    Object.assign(inputAttributes, inputAttributes[ID_IF_ELSEIF_ELSE as unknown as string].get());
  }
  if (inputAttributes[ID_SWITCH_CASE as unknown as string]) {
    ignoreFields.add('_val').add('_list').add('_defaultTask').add(ID_SWITCH_CASE as unknown as string);
    Object.assign(inputAttributes, inputAttributes[ID_SWITCH_CASE as unknown as string].get());
  }

  const attributes: JSX.Attribute = {};
  Object.entries(inputAttributes).forEach(([name, value]) => {
    if (!ignoreFields.has(name)) {
      attributes[name] = value;
    }
  });

  Object.entries(escapeAttr(attributes, escapeMode)).forEach(([key, value]) => {
    if (value instanceof CssClass) {
      result.push(`${key}="${value.getName()}"`);
    } else if (key === 'noEscape') {
      return;
    } else {
      value = value instanceof NoEscape ? value.data : value;
      result.push(`${key}="${value}"`);
    }
  });
  return result.length ? ' ' + result.join(' ') : '';
}

function escapeAttr(attr: NonNullable<JSX.Attribute>, escape: boolean) {
  return escape ? escapeAttributes(attr) as NonNullable<JSX.Attribute> : attr;
}




