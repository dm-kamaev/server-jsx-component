import { JSX } from '../jsx.type';
import tpl from '../tpl';

export default function expandChildren(children: JSX.Children): JSX.Children {
  let output: JSX.Children = [];
  children.forEach((el) => {
    if (el instanceof tpl.SwitchCase || el instanceof tpl.IfElseIfElse) {
      const result = el.get();
      output.push(result);
    } else if (el instanceof Array) {
      output = output.concat(expandChildren(el));
    } else {
      output.push(el);
    }
  });

  return output;
}


