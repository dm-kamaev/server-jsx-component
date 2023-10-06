import Link from '../element/Link';
import Script from '../element/Script';
import CssClass from '../element/CssClass';

export default {
  title(title: string) {
    title = title.trim().replace(/\s+/g, ' ')
      .replace(/&/g, '&amp;')
      .replace(/\"/g, '\'');
    return '<title>' + title + '</title>';
  },
  description(description: string) {
    description = description.trim().replace(/\s+/g, ' ')
      .replace(/&/g, '&amp;')
      .replace(/\"/g, '\'');
    return '<meta name="description" content="' + description + '">';
  },
  keywords(keywords: string) {
    keywords = keywords.trim().replace(/\s+/g, ' ')
      .replace(/&/g, '&amp;')
      .replace(/\"/g, '\'');
    return '<meta name="keywords" content="' + keywords + '">';
  },
  style: formatStyle,
  js: formatJs
};


function formatStyle(list: Array<CssClass | Link | string>) {
  let res = '';
  const tag = new StateTag('<style>', '</style>');
  list.forEach(el => {
    if (el instanceof CssClass) {
      res += tag.open();
      res += el.getBody();
    } else if (el instanceof Link) {
      res += tag.close();
      res += el.toString();
    } else {
      res += tag.open();
      res += el;
    }
  });

  res += tag.close();

  return res;
}


function formatJs(list: Array<Script | string>) {
  let res = '';
  const tag = new StateTag('<script>', '</script>');
  list.forEach(el => {
    if (el instanceof Script) {
      res += tag.close();
      res += el;
    } else if (typeof el === 'string' && el.trim().startsWith('<script>')) {
      res += tag.close();
      res += el;
    } else {
      res += tag.open();
      res += el;
    }
  });

  res += tag.close();

  return res;
}



class StateTag {
  private _isOpenTag: boolean;
  constructor(private readonly openTag: string, private readonly closeTag: string) {
    this._isOpenTag = false;
  }

  open() {
    let str = '';
    if (!this._isOpenTag) {
      this._isOpenTag = true;
      // eslint-disable-next-line no-unused-vars
      str += this.openTag;
    }
    return str;
  }

  close() {
    let str = '';
    if (this._isOpenTag) {
      this._isOpenTag = false;
      // eslint-disable-next-line no-unused-vars
      str += this.closeTag;
    }
    return str;
  }
}

