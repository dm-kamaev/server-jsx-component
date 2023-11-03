import { JSX, ArrayElement } from '../jsx.type';

const replacementText: { [name: string]: string } = {
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&#39;',
  '<': '&lt;',
  '>': '&gt;',
};
// type ArrayElement<T extends readonly unknown[]> = T extends Array<infer Element> ? Element : never;


const stringForRegexp = Object.keys(replacementText).join('|');
const regExpForEscape = new RegExp(`(${stringForRegexp})`, 'g');

export function escape(child: ArrayElement<JSX.Children>): ArrayElement<JSX.Children> {
  // console.log({ inputTarget: child });
  if (!child) {
    return child;
  }

  if (child instanceof NoEscape) {
    return child;
  }

  if (typeof child !== 'string') {
    return child;
  }
  // let result = child;

  return child.replace(regExpForEscape, function ($1) {
    const output = replacementText[$1];
    if (!output) {
      throw new Error(`[turbo-html]: Not found symbol for element ${$1}, input string ${child}`);
    }
    return output;
  });

  // Object.entries(replacementText).forEach(([ symbol, replace ]) => {
  //   result = result.replace(new RegExp(symbol, 'g'), replace);
  // });

  // return result;
}

export function escapeAttributes(attributes: JSX.Attribute): JSX.Attribute {
  if (!attributes) {
    return attributes;
  }

  const attr: JSX.Attribute = {};
  Object.entries(attributes).forEach(([name, value]) => {
    attr[name] = value instanceof NoEscape ? value.data : escape(value);
  });
  return attr;
}


export function noEscape(input: string | JSX.Element) {
  return new NoEscape(input);
}

export class NoEscape {
  constructor(public readonly data: string | JSX.Element) {}
}