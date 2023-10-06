const replacementText: { [name: string]: string } = {
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&#39;',
  '<': '&lt;',
  '>': '&gt;',
};
type ArrayElement<T extends readonly unknown[]> = T extends Array<infer Element> ? Element : never;

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
  let result = child;

  Object.entries(replacementText).forEach(([ symbol, replace ]) => {
    result = result.replace(new RegExp(symbol, 'g'), replace);
  });

  return result;
}

export function escapeAttributes(attributes: JSX.Attribute): JSX.Attribute {
  if (!attributes) {
    return attributes;
  }

  const attr: JSX.Attribute = {};
  Object.entries(attributes).forEach(([name, value]) => {
    // if (name === 'data-el-data') {
    //   console.log({ attributes, name, value: value, });
    // }
    attr[name] = value instanceof NoEscape ? value.data : escape(value);
    // if (name === 'data-el-data') {
    //   console.log(attr[name]);
    // }
  });
  return attr;
}


export function noEscape(input: string | JSX.Element) {
  return new NoEscape(input);
}

class NoEscape {
  constructor(public readonly data: string | JSX.Element) {}
}