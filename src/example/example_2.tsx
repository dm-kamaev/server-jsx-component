
import { getJsxFactory, render, JSX } from '../index';

import IgnisComp from '../IgnisComp';
import IgnisHtmlPage from '../IgnisHtmlPage';

// Set custom generator for css class and id of dom elements
// import GenCssIdentifier from '@ignis-web/gen-css-identifier';
// const generatorId = new GenCssIdentifier('1234');
// const generatorClassName = new GenCssIdentifier('#$!');
// const h = getJsxFactory({ generator: { generatorId, generatorClassName } });

const h = getJsxFactory();
// For components witout parent: https://react.dev/reference/react/Fragment
const Fragment = function (_: any, children: any[]): JSX.Element {
  return <fragment>{children}</fragment>;
};
// Component for wrapping inline js code
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
  IgnisComp.setDataForFuncComponent<{ id: number }>(FuncComponent, {
    css: () =>[`
    .example-description{border:1px solid red}
  `],
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
      <footer class="example-description"></footer>
    </section>
  );
}

class HtmlPage extends IgnisHtmlPage<any> {

  minify() {
    return false;
  }

  keywords() {
    return `
      cfa,
      cfa сертификат,
      cfa level 1,
      cfa exam,
      cfa сертификат,
      экзамен cfa,
      подготовка к cfa level 1,
      cfa mock exam,
      пример теста cfa,
      qbank cfa,
      cfa задачи,
      cfa вопросы,
      тест cfa level 1,
      cfa тест,
      cfa экзамен подготовка,
      cfa экзамен пример
    `;
  }


  // global javascript for section: It will be place in <head></head>
  headJs() {
    return [
      this.script('https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js')
        .async()
        .onload('console.log("Highcharts is loading");')
    ];
  }

  // global javascript for footer. It will be place before tag <body> close
  js() {
    return [
      'console.log("I am run in end of page");',
    ];
  }

  render() {
    const id = this.createId();
    const cls = this.createClassName();


    this.css(this.cssLink('https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma-rtl.min.css'));
    this.css('.column', { display: 'flex', borderLeft: '12px solid red' });

    return (
      <Fragment>
        <div id={id} class={'columns '+cls}>
          {this.children}
        </div>
      </Fragment>
    )
  }
}

const books = [
  { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
  { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
];
const htmlPage: JSX.Element = (
  <HtmlPage
  // title='Test' description='Description' keywords='Keywords'
  >
    <div class="column">
      <ListBook books={books} title={<h1>User's list books:</h1>}></ListBook>
      <FuncComponent id={34534} />
    </div>
  </HtmlPage>
);


const html = render.toHtmlPage(htmlPage, { escape: true });
console.log(html);
