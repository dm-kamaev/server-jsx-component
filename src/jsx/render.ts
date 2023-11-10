import Script from '../element/Script';
import CssClass from '../element/CssClass';
import Minify from '../transform/Minify';
import format from '../transform/format';

import { JSX, Css, Js, JSXFabricPageWithDataForRender, JSXFabricElementWithDataForRender, JSXElementWithDataForRender, ContextRender } from '../jsx.type';

import { escape, escapeAttributes, NoEscape } from './escape';
import { ID_IF_ELSEIF_ELSE, ID_SWITCH_CASE } from '../tpl';

const fragmentName = 'fragment' as const;

export function toObject(
  vnode: JSX.Element,
  escapeMode: boolean,
  context: ContextRender = {},
) {

  const { css, html, getHeadJs, getJs, domId } = traverseToObject(vnode, escapeMode, context);

  const headJs = getHeadJs.map(el => {
    return el.get(context[el.id].sharedData || []).map(convertJsInlineToString(context));
  }).flat();

  const js = getJs.map(el => {
    return el.get(context[el.id].sharedData || []).map(convertJsInlineToString(context));
  }).flat();

  return { css, html, headJs, js, domId };
};


function traverseToObject(
  inputVnode: JSXFabricElementWithDataForRender | JSX.Element,
  escapeMode: boolean,
  context: ContextRender = {},
) {
  let css: Array<Css> = [];
  let getJs: Array<{ id: string; get: (sharedData: any[]) => Array<Js> }> = [];
  let getHeadJs: Array<{ id: string; get: (sharedData: any[]) => Array<Js> }> = [];

  let vnode1: JSXFabricElementWithDataForRender | JSX.Element = inputVnode;

  if (typeof vnode1 !== 'object') {
    return { css, html: vnode1, getHeadJs, getJs };
  }

  const vnode = (vnode1 as JSXFabricElementWithDataForRender)._build?.(context) || vnode1;
  const { elementName, attributes, children: _children } = vnode;
  // console.log(vnode);
  // console.log(vnode, elementName, _children);

  const id = vnode._id;

  // if we have id then we call function build for get data for node
  // if (id) {
  //   console.log({ 'BEFORE vnode': vnode });
  //   vnode = (vnode as any).build(context[id] && context[id].css);
  //   console.log({ elementName, vnode });
  //   // console.log(vnode.elementName, vnode, data);
  //   ({ elementName, attributes, children: _children } = vnode);
  // }

  // first render
  // console.log(vnode, id, id && !context[id]);
  if (id && !context[id]) {
    if (vnode._css) {
      // console.log('add css', { vnode });
      css = vnode._css;
    }

    if (vnode._headJs) {
      getHeadJs.push({ id, get: vnode._headJs });
      // console.log({ getHeadJs });
    }

    if (vnode._js) {
      getJs.push({ id, get: vnode._js });
    }

    context[id] = { css, sharedData: [] };
  }

  const sharedData = vnode._sharedData;
  if (sharedData && id) {
    // console.log(sharedData, id, context[id]);
    context[id].sharedData.push(sharedData);
  }

  if ((vnode as JSXFabricElementWithDataForRender)._build && !elementName) {
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
    return { css, html, getHeadJs, getJs };
  }

  const children = escapeMode && !attributes?.noEscape ? ((_children || []).map(item => escape(item))) : _children;
  const htmlChildren: string = children ? children.map(vnode => {
    if (typeof vnode !== 'object') {
      if (vnode === ' ') {
        vnode = vnode.trim();
      }
      return vnode;
    }
    // console.log({ vnode });
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

  // serialize attributes
  const attribtesAsString = convertAttributesToString(attributes, escapeMode);
  const html = !elementName ? '' : elementName === fragmentName ? htmlChildren : `<${elementName}${attribtesAsString}>${htmlChildren}</${elementName}>`;

  return { css, html, getHeadJs, getJs, domId: attributes?.id };
};


export function toHtmlPage(input: JSXFabricPageWithDataForRender, options: { escape: boolean }) {
  const context = {};
  // console.log('HERE', toObject(vnode, options.escape, context));
  // console.log('INPUT', vnode);
  const vnode = input._build(context);
  // const { attributes, children } = vnode;
  const { attributes } = vnode;
  // console.log('AFTER', vnode);

  // console.dir(children, { depth: 10 });

  // let listHtml: Array<string | number> = [];
  let listHeadJs: Array<Exclude<Js, JSX.Element>> = (vnode._headJs?.(vnode._sharedData).map(convertJsInlineToString(context)) || []);
  let listJs: Array<Exclude<Js, JSX.Element>> = (vnode._js?.(vnode._sharedData).map(convertJsInlineToString(context)) || []);
  let listStyle: Array<Css> = vnode._css ? vnode._css : [];

  const el = toObject(vnode, options.escape, context);
  // console.log('el', el);
  // render components to string
  // const body = (el as any).children.map(el => toObject(el, options.escape, context));

  listStyle = listStyle.concat(el.css);
  listJs = listJs.concat(el.js);
  listHeadJs = listHeadJs.concat(el.headJs);

  // body.forEach(el => {
  //   listHtml.push(el.html);
  //   listStyle.push(el.css);
  //   listJs.push(el.js);
  //   listHeadJs.push(el.headJs);
  // });

  const headJs = format.js(listHeadJs);
  const js = format.js(listJs);
  const style = format.style(listStyle);
  const minify = new Minify(vnode._minify ?? false);
  return (
    '<!DOCTYPE html>' +
    `${vnode._htmlTag}` +
    '<head>' +
      `${minify.html(format.title(attributes?.title || vnode._title))}` +
      `${minify.html(format.description(attributes?.description || vnode._description))}` +
      `${minify.html(format.keywords(attributes?.keywords || vnode._keywords))}` +

    `${(vnode._head || []).join('')}` +

    `${minify.style(style)}` +
    `${headJs}` +
    '</head>' +
    '<body>' +
    `${minify.html(el.html)}` +
    `${js}` +
    '</body>' +
    '</html>'
  );
};


export function toTurboHtml(vnode: JSXElementWithDataForRender, options: { targetElId?: string | number; escape: boolean, minify?: boolean }) {

  // const { children } = vnode;

  // console.dir(children, { depth: 10 });
  // render components to string

  const { html, css: listStyle, headJs: listHeadJs, js: listJs, domId } = toObject(vnode, options.escape);

  let id = options.targetElId;
  if (!id) {
    id = domId;
    if (!id) {
      throw new Error('Not found targetElId: not passed and not found in root component. You should pass targetElId or set id for root component');
    }
  }

  const js = format.js(listHeadJs.flat().concat(listJs.flat()));
  const css = format.style(listStyle.flat());
  const minify = new Minify(options.minify ?? false);

  return { id: id+'', html: minify.html(html), css: minify.style(css), js };
}


function convertJsInlineToString(context: ContextRender) {
  return function ( input: string | Script | JSX.Element) {
    if (typeof input === 'string' || input instanceof Script) {
      return input;
    } else {
      const el: JSX.Element = (input as any)._build(context);
      // console.log({ JSX: el });
      if (el.attributes?.escape) {
        el.children = el.children.map(item => escape(item));
      }
      // console.log({ el, children: el.children });
      return `${el.children.join('')}`;
    }
  };
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




