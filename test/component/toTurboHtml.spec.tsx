import { getJsxFactory, JSX, IgnisComp, Script, render } from '../../src/index';

describe('[toTurboHtml] – render for frawework @ignis-web/turbo-html { id, html, css, js }', function () {
  const h = getJsxFactory();

  const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
    return <fragment escape={props.escape || false}>{children}</fragment>;
  };

  class ListBook extends IgnisComp<{ books: { id: number, author: string, name: string, year: number }[] }> {

    render() {
      const { books } = this.props;
      this.css('@media screen and (max-width: 599px) { .columns{display:block}}');
      this.css(`
        .column{
          display:flex;
          border-left:12px solid red;
        }
      `);
      this.css(this.cssLink('https://cdn.jsdelivr.net/npm/@mdi/font@6.4.95/css/materialdesignicons.min.css'));
      return (
        <div id={this.createId()} class={this.createClassName()}>
          <p>Count: {books.length}</p>
          {books.map(el => <Book id={el.id} author={el.author} name={el.name} year={el.year}/>)}
          <FuncComponent text='Refresh all' />
        </div>
      );
    }
  }

  class Book extends IgnisComp<{ id: number, author: string, name: string, year: number }> {

    headJs() {
      return [
        'console.log("This js code in <head></head>");',
        <JsCode>console.log("This js code in {'<head></head>'}");</JsCode>,
        this.script('https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js')
          .async()
          .onload('console.log("Highcharts is loading");')
      ];
    }

    js() {
      return [
        this.script('https://cdnjs.cloudflare.com/ajax/libs/jquery.js'),
        'console.log("This js code before </body>");',
        <JsCode>console.log("This js code before {'</body>'}");</JsCode>,
      ];
    }

    render({ id, author, name, year }: { id: number, author: string, name: string, year: number }) {
      const cl_book = this.css({
        color: 'red',
        '&:focus': {
          'background-color': 'orange'
        }
      });

      const cl_author = this.css('list-book__author', {
        textTransform: 'capitalize'
      });

      // create class as simple string
      this.css('.list-book__name{font-size: 16px}');


      return (
        <div id={id} class={cl_book}>
          <p class="list-book__name">Name: {name}</p>
          <p class={cl_author}>Author: {author}</p>
          <p>Year: {year}</p>
         </div>
      );
    }
  }

  function FuncComponent(props: {text: string })  {
    IgnisComp.setDataForFuncComponent(FuncComponent, {
      css() {
        this.css('.refresh{border:1px solid red}');
      },
      headJs() {
        return ['console.log("I am functional component in head");', <JsCode>alert("head");</JsCode>];
      },
      js() {
        return ['console.log("I am functional component in footer");', <JsCode>alert("footer");</JsCode>];
      }
    });

    return (
      <form class="refresh" action="#">
        <button type="submit">{props.text}</button>
      </form>
    );
  }


  beforeAll(() => {
    Script.createOnloadName = () => 'onload_353534543';
  });

  it('render for frawework @ignis-web/turbo-html { id, html, css, js }', function () {
    const books = [
      { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
      { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
    ];
    const data = render.toTurboHtml(<ListBook books={books}/>, { targetElId: 'test', escape: true, minify: true });
    expect(data.id).toBe('test');
    expect(data.html).toEqual(`<div id="Z" class="a"><p>Count: 2</p><div id="1" class="b"><p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: Leo Tolstoy</p><p>Year: 1863</p></div><div id="2" class="b"><p class="list-book__name">Name: White Fang</p><p class="list-book__author">Author: Jack London</p><p>Year: 1906</p></div><form class="refresh" action="#"><button type="submit">Refresh all</button></form></div>`);
    expect(data.css).toEqual(`<style>@media screen and (max-width:599px){.columns{display:block}}.column{display:flex;border-left:12px solid red;}</style><link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@mdi/font@6.4.95/css/materialdesignicons.min.css"/><style>.b{color:red;}.b:focus{background-color:orange;}.list-book__author{text-transform:capitalize;}.list-book__name{font-size:16px}.refresh{border:1px solid red}</style>`);
    expect(data.js).toEqual(`<script>console.log("This js code in <head></head>");console.log("This js code in <head></head>");</script><script>function onload_353534543(){console.log("Highcharts is loading");}</script><script src="https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js" async onload="onload_353534543();"></script><script>console.log("I am functional component in head");alert("head");</script><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.js"></script><script>console.log("This js code before </body>");console.log("This js code before </body>");console.log("I am functional component in footer");alert("footer");</script>`);
  });

  it('[without minify]: render for frawework @ignis-web/turbo-html { id, html, css, js }', function () {
    const books = [
      { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
      { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
    ];
    const data = render.toTurboHtml(<ListBook books={books}/>, { targetElId: 'test', escape: true });
    expect(data.id).toBe('test');
    expect(data.html).toEqual(`<div id="Y" class="c"><p>Count: 2</p><div id="1" class="d"><p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: Leo Tolstoy</p><p>Year: 1863</p></div><div id="2" class="d"><p class="list-book__name">Name: White Fang</p><p class="list-book__author">Author: Jack London</p><p>Year: 1906</p></div><form class="refresh" action="#"><button type="submit">Refresh all</button></form></div>`);
    expect(data.css).toEqual(`<style>@media screen and (max-width: 599px) { .columns{display:block}}
        .column{
          display:flex;
          border-left:12px solid red;
        }
      </style><link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@mdi/font@6.4.95/css/materialdesignicons.min.css"/><style>.d{color:red;}.d:focus{background-color:orange;}.list-book__author{text-transform:capitalize;}.list-book__name{font-size: 16px}.refresh{border:1px solid red}</style>`);
    expect(data.js).toEqual(`<script>console.log("This js code in <head></head>");console.log("This js code in <head></head>");</script><script>function onload_353534543(){console.log("Highcharts is loading");}</script><script src="https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js" async onload="onload_353534543();"></script><script>console.log("I am functional component in head");alert("head");</script><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.js"></script><script>console.log("This js code before </body>");console.log("This js code before </body>");console.log("I am functional component in footer");alert("footer");</script>`);
  });


  it('without pass targetElId', function () {
    const books = [
      { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
      { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
    ];
    const data = render.toTurboHtml(<ListBook books={books}/>, { escape: true, minify: true });
    const id = 'X';
    expect(data.id).toBe(id);
    expect(data.html).toEqual(`<div id="${id}" class="e"><p>Count: 2</p><div id="1" class="f"><p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: Leo Tolstoy</p><p>Year: 1863</p></div><div id="2" class="f"><p class="list-book__name">Name: White Fang</p><p class="list-book__author">Author: Jack London</p><p>Year: 1906</p></div><form class="refresh" action="#"><button type="submit">Refresh all</button></form></div>`);
    expect(data.css).toEqual(`<style>@media screen and (max-width:599px){.columns{display:block}}.column{display:flex;border-left:12px solid red;}</style><link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@mdi/font@6.4.95/css/materialdesignicons.min.css"/><style>.f{color:red;}.f:focus{background-color:orange;}.list-book__author{text-transform:capitalize;}.list-book__name{font-size:16px}.refresh{border:1px solid red}</style>`);
    expect(data.js).toEqual(`<script>console.log("This js code in <head></head>");console.log("This js code in <head></head>");</script><script>function onload_353534543(){console.log("Highcharts is loading");}</script><script src="https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js" async onload="onload_353534543();"></script><script>console.log("I am functional component in head");alert("head");</script><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.js"></script><script>console.log("This js code before </body>");console.log("This js code before </body>");console.log("I am functional component in footer");alert("footer");</script>`);
  });


  it('catch error not found targetElId', function () {

    class ListBook extends IgnisComp<{ books: { id: number, author: string, name: string, year: number }[] }> {

      render() {
        const { books } = this.props;
        this.css('@media screen and (max-width: 599px) { .columns{display:block}}');
        this.css('.column{display:flex;border-left:12px solid red;}');
        this.css(this.cssLink('https://cdn.jsdelivr.net/npm/@mdi/font@6.4.95/css/materialdesignicons.min.css'));
        return (
          <div class={this.createClassName()}>
            <p>Count: {books.length}</p>
            {books.map(el => <Book id={el.id} author={el.author} name={el.name} year={el.year}/>)}
            <FuncComponent text='Refresh all' />
          </div>
        );
      }
    }

    const books = [
      { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
      { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
    ];
    expect(() => render.toTurboHtml(<ListBook books={books} />, { escape: true })).toThrow(Error);
  });

});
