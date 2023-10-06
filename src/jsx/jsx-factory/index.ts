import expandChildren from './lib/expandChildren';

import IgnisComp from '../../IgnisComp';
import { IGenCssIdentifier } from '../../generator';

export const getJsxFactory = (option?: { generator?: { generatorId?: IGenCssIdentifier; generatorClassName?: IGenCssIdentifier; } }): JSX.FunctionComponent<any> | JSX.ClassComponent => {
  const h = (
    elementName: JSX.ElementName,
    attributes: JSX.Attribute,
    ...children: JSX.Children
  ): JSX.Element => {

    if (typeof elementName === 'string') {
      return {
        elementName,
        attributes,
        children: expandChildren(children),
      };
    } else {
      if (isClass(elementName)) {
        const generator = option?.generator;
        const el = new elementName(attributes || {}, children, generator);
        const result = el.render(attributes || {}, children);

        for (const [name, val ] of Object.entries(el.buildDataForRender?.() || [])) {
          (result as any)[name] = val;
        }

        for (const [name, val] of Object.entries(el.buildDataForRenderPage?.() || [])) {
          (result as any)[name] = val;
          result.attributes = attributes;
        }

        return result;
      } else {
        const result = elementName(attributes || {}, children);

        for (const [name, val] of Object.entries(IgnisComp.buildDataForRender(elementName))) {
          (result as any)[name] = val;
        }
        IgnisComp.cleanFuncComponent(elementName);
        return result;
      }
    }
  };
  return h;
}


function isClass(func: Function): func is JSX.ClassComponent {
  return /^class\s/.test(Function.prototype.toString.call(func))
}
