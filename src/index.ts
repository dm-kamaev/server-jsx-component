export { JSX } from './jsx.type';

export { default as getJsxFactory } from './jsx/getJsxFactory';

import { toObject, toHtmlPage, toTurboHtml } from './jsx/render';
export const render = { toObject, toHtmlPage, toTurboHtml };

export { default as IgnisComp } from './IgnisComp';
export { default as IgnisHtmlPage } from './IgnisHtmlPage';

export { escape, noEscape } from './jsx/escape';
export { default as tpl } from './tpl';
export { default as Script } from './element/Script';
export { default as CssClass } from './element/CssClass';
export { default as Link } from './element/Link';
export { default as CssLink } from './element/CssLink';
export { default as mediaRange } from './mediaRange';



