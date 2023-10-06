import tpl from '../../../tpl';

export default function expandChildren(children: JSX.Children): JSX.Children {
  let output: JSX.Children = [];
  children.forEach((item) => {
    if (item instanceof tpl.SwitchCase || item instanceof tpl.IfElseIfElse) {
      const result = item.get();
      output.push(result);
    } else if (item instanceof Array) {
      output = output.concat(expandChildren(item));
    } else {
      output.push(item);
    }
  });

  return output;
}


