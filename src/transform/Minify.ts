
export default class Minify {
  constructor(private _is_minify: boolean) {}

  style(css: string) {
    if (this._is_minify) {
      return css.replace(/\/\*[^\/\*\*\/]+\*\//g, '') // коментарии вида /**/
        .replace(/\s+/g, ' ')
        .replace(/\s+{\s+/g, '{')
        .replace(/\s+}\s+/g, '}')
        .replace(/;\s+/g, ';')
        .replace(/:\s+/g, ':')
        .replace(/{\s+/g, '{')
        .replace(/\s+}/g, '}')
        .trim();
    } else {
      return css;
    }
  }

  html(html: string) {
    if (this._is_minify) {
      return html.replace(/\s+/g, ' ') // нельзя слитно ибо аттрибуты тэгов должны иметь пробелы
        .replace(/>\s+</g, '><')
        .replace(/>\s+/g, '>')
        .replace(/\s+</g, '<')
        .trim();
    } else {
      return html;
    }
  }
};

