
import GenCssIdentifier from '@ignis-web/gen-css-identifier';

const options = { notStartsWith: '0123456789' };
const genClassName = new GenCssIdentifier('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', options).except(['ga']);
const genId = new GenCssIdentifier('ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba0123456789', options).except(['ga']);

export interface IGenCssIdentifier { next(): string };

export default {
  forClass(): IGenCssIdentifier {
    return genClassName;
  },
  forId(): IGenCssIdentifier {
    return genId;
  }
};