import GenCssIdentifier from '@ignis-web/gen-css-identifier';
import { getJsxFactory, IgnisComp, render, JSX, CssClass, Script } from '../../src/index';
import assert from 'assert';

describe('[IgnisComp: class component]', function () {

  beforeAll(() => {
    Script.createOnloadName = () => 'onload';
  });


  it('class component without escape', function () {
    const h = getJsxFactory();

    const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
      return <fragment escape={props.escape || false}>{children}</fragment>;
    };

    class Book extends IgnisComp<{ data: { id: number; name: string; author: string; year: number }, title: string }, never, { id: number }> {
      // javascript for all components Book. It will be place in <head></head>
      headJs() {
        // get all ids for components Book
        const data = this.getListSharedData();
        return [
          <JsCode>
            console.log('Escaped value {`${this.escape('<body>')}`}');
          </JsCode>,
          this.script('/assets/book.js'),
          `[${data.map(el => el.id).join(',')}].forEach(id => new Book(id);`
        ];
      }

      // javascript for all components Book. It will be place before tag <body> close
      js() {
        return [
          'console.log("I am book in footer!!!");',
        ];
      }


      render() {
        const { title, data: { id, name, author, year } } = this.props;

        // create class via css in js
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

        // You can store shared data for specific type components(in this case Book)  which were used on page
        let _id = this.setSharedData('id', id);
        const state = this.setSharedData({ id: _id });

        assert.ok(id === state.id);

        return (
          <div class={cl_book}>
            {title}
            <p class="list-book__name">Name: {name}</p>
            <p class={cl_author}>Author: {author}</p>
            <p>Year: {year}</p>
          </div>
        );
      }
    }


    const book = { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 };

    const object = render.toObject(
      <div class="column">
        <Book data={book} title={'<script>alert("XSS");</script>'}></Book>
      </div>, false);

    expect(object.html).toEqual('<div class="column"><div class="a"><script>alert("XSS");</script><p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: Leo Tolstoy</p><p>Year: 1863</p></div></div>');
    expect(object.css).toHaveLength(3);
    expect(object.css[0]).toBeInstanceOf(CssClass);
    expect(object.css[1]).toBeInstanceOf(CssClass);
    expect(object.css[2]).toBe('.list-book__name{font-size: 16px}');

    expect(object.headJs).toHaveLength(3);
    expect(object.headJs[0]).toEqual("console.log('Escaped value &lt;body&gt;');");
    expect(object.headJs[1]).toBeInstanceOf(Script);
    expect(object.headJs[2]).toEqual('[1].forEach(id => new Book(id);');

    expect(object.js).toMatchObject([
      'console.log("I am book in footer!!!");',
    ]);
  });


  it('class component with escape', function () {
    const h = getJsxFactory();

    const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
      return <fragment escape={props.escape || false}>{children}</fragment>;
    };

    class Book extends IgnisComp<{ data: { id: number; name: string; author: string; year: number }, title: string }, never, { id: number }> {
      // javascript for all components Book. It will be place in <head></head>
      headJs() {
        // get all ids for components Book
        const data = this.getListSharedData();
        return [
          <JsCode>
            console.log('Escaped value {`${this.escape('<body>')}`}');
          </JsCode>,
          this.script('/assets/book.js'),
          `[${data.map(el => el.id).join(',')}].forEach(id => new Book(id);`
        ];
      }

      // javascript for all components Book. It will be place before tag <body> close
      js() {
        return [
          'console.log("I am book in footer!!!");',
        ];
      }


      render() {
        const { title, data: { id, name, author, year } } = this.props;

        // create class via css in js
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

        // You can store shared data for specific type components(in this case Book)  which were used on page
        this.setSharedData('id', id);

        return (
          <div class={cl_book}>
            {title}
            <p class="list-book__name">Name: {name}</p>
            <p class={cl_author}>Author: {author}</p>
            <p>Year: {year}</p>
          </div>
        );
      }
    }


    const book = { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 };

    const object = render.toObject(
      <div class="column">
        <Book data={book} title={'<script>alert("XSS");</script>'}></Book>
      </div>, true);

    expect(object.html).toEqual(
      '<div class="column"><div class="b">&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;'+
      '<p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: Leo Tolstoy</p><p>Year: 1863</p></div></div>'
    );
    expect(object.css).toHaveLength(3);
    expect(object.css[0]).toBeInstanceOf(CssClass);
    expect(object.css[1]).toBeInstanceOf(CssClass);
    expect(object.css[2]).toBe('.list-book__name{font-size: 16px}');

    expect(object.headJs).toHaveLength(3);
    expect(object.headJs[0]).toEqual("console.log('Escaped value &lt;body&gt;');");
    expect(object.headJs[1]).toBeInstanceOf(Script);
    expect(object.headJs[2]).toEqual('[1].forEach(id => new Book(id);');

    expect(object.js).toMatchObject([
      'console.log("I am book in footer!!!");',
    ]);
  });


  it('many components', function () {
    const h = getJsxFactory();

    const Fragment = (_: any, children: any[]): JSX.Element => {
      return <fragment>{children}</fragment>;
    };

    const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
      return <fragment escape={props.escape || false}>{children}</fragment>;
    };

    class ListBook extends IgnisComp<{ title: JSX.Element, books: Array<{ id: number; name: string; author: string; year: number }> }> {
      render() {
        const { title, books } = this.props;
        return (
          <div>
            {title}
            <p>Count: {books.length}</p>
            {this.tpl.forEach(books, el => <Book data={el}></Book>)}
          </div>
        );
      }
    }

    class Book extends IgnisComp<{ data: { id: number; name: string; author: string; year: number } }, never, { id: number }> {

      // javascript for all components Book. It will be place in <head></head>
      headJs() {
        // get all ids for components Book
        const data = this.getListSharedData();
        return [
          <JsCode>
            console.log('Escaped value {`${this.escape('<body>')}`}');
          </JsCode>,
          this.script('/assets/book.js'),
          `[${data.map(el => el.id).join(',')}].forEach(id => new Book(id);`
        ];
      }

      // javascript for all components Book. It will be place before tag <body> close
      js() {
        return [
          'console.log("I am book in footer!!!");',
        ];
      }


      render() {
        const { data: { id, name, author, year } } = this.props;

        // create class via css in js
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

        // You can store shared data for specific type components(in this case Book)  which were used on page
        this.setSharedData('id', id);

        return (
          <div class={cl_book}>
            <p class="list-book__name">Name: {name}</p>
            <p class={cl_author}>Author: {author}</p>
            <p>Year: <BookYear year={year}/> </p>
          </div>
        );
      }
    }


    class BookYear extends IgnisComp<{ year: number }> {

      render({ year }: { year: number }) {
        const cl_early_year = this.css({
          color: 'green',
        });

        const cl_middle_year = this.css({
          color: 'orange',
        });

        const cl_late_year = this.css({
          color: 'blue',
        });

        // tpl is built in library for convenient work with conditions in template
        return (
          <Fragment>
            {this.tpl
              .if(year < 1600, () => <span class={cl_early_year}>{year}</span>)
              .else_if(year > 1600 && year > 1900, () => <span class={cl_middle_year}>{year}</span>)
              .else(<span class={cl_late_year}>{year}</span>)
            }
          </Fragment>
        );
      }
    }


    function FuncComponent(props: { id: number }) {
      let $cl_example!: CssClass;
      IgnisComp.setDataForFuncComponent<{ id: number }>(FuncComponent, {
        css() {
          $cl_example = this.css('example-description', { border:'1px solid red'});
        },
        sharedData: { id: props.id },
        headJs() {
          return [`console.log("I am functional component in head");', ' <script>alert("${JSON.stringify(this.getSharedData())}");</script>`];
        },
        js() {
          return [
            <JsCode>
              console.log("I am functional component in footer");
            </JsCode>
          ]
        },
      });

      return (
        <section>
          <header>I am functional component</header>
          <footer class={$cl_example}>{props.id}</footer>
        </section>
      );
    }

    const books = [
      { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
      { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
    ];

    const object = render.toObject(
      <div class="column">
        <ListBook books={books} title={<h1>User's list books:</h1>}></ListBook>
        <FuncComponent id={34534} />
        <FuncComponent id={7777} />
      </div>, false);

    expect(object.html).toEqual(`<div class="column"><div><h1>User's list books:</h1><p>Count: 2</p><div class="c"><p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: Leo Tolstoy</p><p>Year: <span class="f">1863</span></p></div><div class="c"><p class="list-book__name">Name: White Fang</p><p class="list-book__author">Author: Jack London</p><p>Year: <span class="e">1906</span></p></div></div><section><header>I am functional component</header><footer class="example-description">34534</footer></section><section><header>I am functional component</header><footer class="example-description">7777</footer></section></div>`);
    expect(object.css).toHaveLength(7);
    expect(object.css[0]).toBeInstanceOf(CssClass);
    expect(object.css[1]).toBeInstanceOf(CssClass);
    expect(object.css[2]).toBe('.list-book__name{font-size: 16px}');
    expect(object.css[3]).toBeInstanceOf(CssClass);
    expect(object.css[4]).toBeInstanceOf(CssClass);
    expect(object.css[5]).toBeInstanceOf(CssClass);
    expect((object.css[6] as CssClass).getName()).toEqual('example-description');

    expect(object.headJs).toHaveLength(4);
    expect(object.headJs[0]).toEqual("console.log('Escaped value &lt;body&gt;');");
    expect(object.headJs[1]).toBeInstanceOf(Script);
    expect(object.headJs[2]).toEqual('[1,2].forEach(id => new Book(id);');
    expect(object.headJs[3]).toEqual(`console.log("I am functional component in head");', ' <script>alert("[{"id":34534},{"id":7777}]");</script>`);

    expect(object.js).toMatchObject([
      'console.log("I am book in footer!!!");',
      'console.log("I am functional component in footer");'
    ]);

  });

  it('with custom generator', function () {
    const generatorId = new GenCssIdentifier('1234');
    const generatorClassName = new GenCssIdentifier('#$!');
    const h = getJsxFactory({ generator: { generatorId, generatorClassName } });

    const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
      return <fragment escape={props.escape || false}>{children}</fragment>;
    };

    class Book extends IgnisComp<{ title: string; data: { id: number; name: string; author: string; year: number } }, never, { id: number }> {

      // javascript for all components Book. It will be place in <head></head>
      headJs() {
        // get all ids for components Book
        const data = this.getListSharedData();
        return [
          <JsCode>
            console.log('Escaped value {`${this.escape('<body>')}`}');
          </JsCode>,
          this.script('/assets/book.js'),
          `[${data.map(el => el.id).join(',')}].forEach(id => new Book(id);`
        ];
      }

      // javascript for all components Book. It will be place before tag <body> close
      js() {
        return [
          'console.log("I am book in footer!!!");',
        ];
      }


      render() {
        const { title, data: { id, name, author, year } } = this.props;

        // create class via css in js
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

        // You can store shared data for specific type components(in this case Book)  which were used on page
        this.setSharedData('id', id);

        return (
          <div id={this.createId()} class={cl_book}>
            {title}
            <p class="list-book__name">Name: {name}</p>
            <p class={cl_author}>Author: {author}</p>
            <p>Year: {year}</p>
          </div>
        );
      }
    }

    const book = { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 };
    const object = render.toObject(
      <div class="column">
        <Book data={book} title={'<script>alert("XSS");</script>'}></Book>
      </div>
    , true);
    expect(object.html).toEqual('<div class="column"><div id="1" class="#">&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;<p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: Leo Tolstoy</p><p>Year: 1863</p></div></div>');
  });


  it('nested components', function () {
    const h = getJsxFactory();

    const Fragment = (_: any, children: any[]): JSX.Element => {
      return <fragment>{children}</fragment>;
    };

    const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
      return <fragment escape={props.escape || false}>{children}</fragment>;
    };

    class ListBook extends IgnisComp<{ title: JSX.Element, books: Array<{ id: number; name: string; author: string; year: number }> }> {

      headJs() {
        return [
          <JsCode>alert('head js');</JsCode>
        ]
      }

      js() {
        return [
          <JsCode>console.log('js');</JsCode>
        ]
      }

      render() {
        const { title, books } = this.props;
        const sliceBooks = books.slice(1);

        const $author = this.css({ fontWeight: 'bold' });
        return (
          <Fragment>
            <Fragment>
              <Fragment>
                <Fragment>
                  <div>
                    {title}
                    <p>Count: {books.length}</p>
                    {this.tpl.forEach(books, el => (<div><p class={$author}>Author: {el.author}</p><p>Name: {el.name}</p><p>Year: {el.year}</p></div>))}
                    {sliceBooks.length ? <ListBook title={title} books={sliceBooks} /> : ''}
                  </div>
                </Fragment>
              </Fragment>
            </Fragment>
          </Fragment>
        );
      }
    }


    const books = [
      { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
      { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
    ];

    const object = render.toObject(
      <div class="column">
        <ListBook books={books} title={<h1>User's list books:</h1>}></ListBook>
      </div>, false);

    expect(object.html).toEqual(`<div class="column"><div><h1>User's list books:</h1><p>Count: 2</p><div><p class="g">Author: Leo Tolstoy</p><p>Name: War and Peace</p><p>Year: 1863</p></div><div><p class="g">Author: Jack London</p><p>Name: White Fang</p><p>Year: 1906</p></div><div><h1>User's list books:</h1><p>Count: 1</p><div><p class="g">Author: Jack London</p><p>Name: White Fang</p><p>Year: 1906</p></div></div></div></div>`);

    expect(object.css).toHaveLength(1);
    expect(object.css[0]).toBeInstanceOf(CssClass);
    expect((object.css[0] as CssClass).getName()).toEqual('g');

    expect(object.headJs).toMatchObject([ "alert('head js');" ]);
    expect(object.js).toMatchObject([ "console.log('js');" ]);

  });
});
