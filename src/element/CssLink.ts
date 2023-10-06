
import Link from './Link';

export default class CssLink extends Link {
  constructor(href: string) {
    super(href);
    this.rel('stylesheet').type('text/css');
  }
};
