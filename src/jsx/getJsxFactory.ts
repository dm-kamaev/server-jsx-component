import { JSX, JSXElementWithDataForRender, ContextRender, JSXFabricElementWithDataForRender } from '../jsx.type';
import expandChildren from './expandChildren';
import * as crypto from 'node:crypto';

import IgnisComp from '../IgnisComp';
import { IGenCssIdentifier } from '../generator';


export default function getJsxFactory(option?: { generator?: { generatorId?: IGenCssIdentifier; generatorClassName?: IGenCssIdentifier; } }): JSX.FunctionComponent<any> | JSX.ClassComponent {
  const h = (
    elementName: JSX.ElementName,
    attributes: JSX.Attribute,
    ...children: JSX.Children
  ): JSX.Element | JSXFabricElementWithDataForRender => {

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
        // const result = el.render(attributes || {}, children);
        const result = {
          _build(context: ContextRender): JSX.Element {
            const css = context[(el as IgnisComp<any>).id]?.css;
            if (css) {
              el.setCss(css);
            }
            const result = el.render(attributes || {}, children);

            for (const [name, val ] of Object.entries(el.buildDataForRender?.() || [])) {
              (result as any)[name] = val;
            }
            for (const [name, val] of Object.entries(el.buildDataForRenderPage?.() || [])) {
              (result as any)[name] = val;
              result.attributes = attributes;
            }
            // if (elementName.name === 'BookYear') {
            //   console.log(elementName.name, result);
            // }
            // console.log(result);
            return result;
          }
        };
        return result as unknown as JSX.Element;
      } else {
        if (!(elementName as any)._id) {
           (elementName as any)._id = crypto.randomUUID()+':'+(elementName.name || '');
        }
        const result = {
          _build(context: ContextRender): JSX.Element {
            const css = context[(elementName as any)._id]?.css;
            if (css) {
              (elementName as any)._css = css;
            }
            const result = elementName(attributes || {}, children);

            for (const [name, val] of Object.entries(IgnisComp.buildDataForRender(elementName as any))) {
              (result as any)[name] = val;
            }
            IgnisComp.cleanFuncComponent(elementName);
            return result;
          }
        };
        // console.log(result);
       return result as unknown as JSX.Element;
      }
    }
  };
  return h;
}


function isClass(func: Function): func is JSX.ClassComponent {
  return /^class\s/.test(Function.prototype.toString.call(func))
}
