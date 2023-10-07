export { JSX } from './jsx.type';

export { default as getJsxFactory } from './jsx/getJsxFactory';
import { toObject, toHtmlPage } from './jsx/render';
export { default as IgnisComp } from './IgnisComp';
export { default as IgnisHtmlPage } from './IgnisHtmlPage';

export const render = { toObject, toHtmlPage };

