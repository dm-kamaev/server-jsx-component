# Server JSX components

[![Actions Status](https://github.com/dm-kamaev/server-jsx-component/workflows/Build/badge.svg)](https://github.com/dm-kamaev/server-jsx-component/actions) ![Coverage](https://github.com/dm-kamaev/server-jsx-component/blob/master/coverage/badge-statements.svg)

A minimalistic framework for creating reusable and encapsulated html components  on server side with the help of JSX.
It uses standard abilities🚀  of typescript compiler to work with JSX. For projects written on JavaScript (without TypeScript) may use to convert JSX Babel.
The framework uses ideology of **CssInJs** for work with css and support ability  inline JavaScript code in components.

### Install
```sh
npm i @ignis-web/server-jsx-component -S
```

Navigation:
  - [Function component](#function-component)
  - [Class component](#class-component)
  - [Css](#css)
  - [JavaScript](#javascript)
  - [Css and JavaScript in Function component](#css-and-javascript-in-function-component)
  - [Script and Link](#script-and-link)
  - [Html Page](#html-page)
  - [Tpl](#tpl)
  - [Tsconfig](#tsconfig)

### Function component
```tsx
import { getJsxFactory, render, JSX } from '@ignis-web/server-jsx-component';

const h = getJsxFactory();

const FormatDate = (props: { date: Date, style: string }) => {
  const { date, style } = props;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${year}-${month}-${day}`;
  return <time datetime={dateStr} style={style}>{dateStr}</time>;
};

// second argument for turn on escape mode
const obj = render.toObject(
  <FormatDate date={new Date()} style="color:red"></FormatDate>,
  true
);
// <time datetime="2023-10-7" style="color:red">2023-10-7</time>
console.log(obj.html);
```

### Class component
```tsx
import { getJsxFactory, render, IgnisComp } from '@ignis-web/server-jsx-component';

const h = getJsxFactory();

class FormatDate extends IgnisComp<{ date: Date, style: string }> {
  render() {
    const { date, style } = this.props;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${year}-${month}-${day}`;
    return <time datetime={dateStr} style={style}>{dateStr}</time>;
  }
}

// second argument for turn on escape mode
const obj = render.toObject(
  <FormatDate date={new Date()} style="color:red"></FormatDate>,
  true
);
// <time datetime="2023-10-7" style="color:red">2023-10-7</time>
console.log(obj.html);
```
IgnisComp (`IgnisComp<Props, Children, TSharedData>`) take 3 types: type of properties of component, type of children and type of shared data (for inline javascript code).

If you want render JSX to html not to object then you need method `toHtmlPage`:
```tsx
import {
  getJsxFactory,
  render,
  JSX,
  IgnisComp,
  IgnisHtmlPage
} from '@ignis-web/server-jsx-component';

const h = getJsxFactory();

// For components witout parent:
// https://react.dev/reference/react/Fragment
const Fragment = function (_: any, children: any[]): JSX.Element {
  return <fragment>{children}</fragment>;
};

class FormatDate extends IgnisComp<{ date: Date, style: string }> {
  render() {
    const { date, style } = this.props;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${year}-${month}-${day}`;
    return <time datetime={dateStr} style={style}>{dateStr}</time>;
  }
}

class HtmlPage extends IgnisHtmlPage<{}> {
  render() {
    return <Fragment>{this.children}</Fragment>;
  }
}

const html = render.toHtmlPage(
  <HtmlPage>
    <FormatDate date={new Date()} style="color:red"></FormatDate>
  </HtmlPage>,
  { escape: true }
);
/* <!DOCTYPE html>
<html lang="EN">
<head>
  <title>Hello, I am page with IgnisComponent !</title>
  <meta name="description" content="">
  <meta name="keywords" content="">
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body><time datetime="2023-10-9" style="color:red">2023-10-9</time></body>
</html> */
console.log(html);
```
[More details](#html-page)

### Css
You can create css classes in components: in object style (**CssInJS**) or as simple string. Class names are generated with built-in generator:
```tsx
import {
  getJsxFactory,
  render,
  IgnisComp
} from '@ignis-web/server-jsx-component';

const h = getJsxFactory();

class Book extends IgnisComp<
  { id: number, author: string, name: string, year: number }
> {
  render() {
    const { id, author, name, year } = this.props;
    // Create css class as css in js.
    // Class name is generated automatically
    const cl_book = this.css({
      color: 'red',
      // properties as camel case
      fontSize: '12px',
      '&:focus': {
        // properties as kebab case
        'background-color': 'orange'
      }
    });

    // Create css class as css in js, but use specific class name
    const cl_author = this.css('list-book__author', {
      textTransform: 'capitalize'
    });

    // Create css class as string.
    // Class name is generated automatically
    this.css('.list-book__name{font-size: 16px}');

    return (
      <div class={cl_book}>
        <p class="list-book__name">Name: {name}</p>
        <p class={cl_author}>Author: {author}</p>
        <p>Year: {year}</p>
      </div>
    );
  }
}

// second argument for turn on escape mode
const obj = render.toObject(
  <Book id={1} author="Ivan Turgenev" name="Hunter's Notes" year={1852}></Book>,
  true
);
/*
<div class="a">
  <p class="list-book__name">Name: Hunter&#39;s Notes</p>
  <p class="list-book__author">Author: Ivan Turgenev</p>
  <p>Year: 1852</p>
</div>
*/
console.log(obj.html);
/*
[
  CssClass {
    _name: 'a',
    _obj: { color: 'red', fontSize: '12px', '&:focus': [Object] }
  },
  CssClass {
    _name: 'list-book__author',
    _obj: { textTransform: 'capitalize' }
  },
  '.list-book__name{font-size: 16px}'
]
*/
console.log(obj.css);
```
##### Note:
You shouldn't create css inside block if/else statement:
```js
  if (Math.random() > 0.5) {
    const cl_author = this.css('list-book__author', {
      textTransform: 'capitalize'
    });
  }
```
**It will not work!**


### JavaScript
With methods `headJs()` and `js()` you can add javascript code in component as JSX block code, as string, or as script tag:
```tsx
import {
  getJsxFactory,
  render,
  IgnisComp,
  JSX
} from '@ignis-web/server-jsx-component';

const h = getJsxFactory();

// Component for wrapping inline js code
const JsCode = function (
  props: { escape?: boolean }, children: any[]
): JSX.Element {
  // XSS escape is disable by default
  return <fragment escape={props.escape || false}>{children}</fragment>;
};

class Book extends IgnisComp<
  { id: number; name: string; author: string; year: number },
  never,
  // Third parameter is type of shared data
  { id: number }
> {

  // javascript for all components Book. It will be place in <head></head>
  headJs() {
    // get all ids for components Book
    // Array<{ id: number }>
    const data = this.getListSharedData();
    return [
      // Inject inline code as JSX
      <JsCode>
        console.log('Escaped value {`${this.escape('<body>')}`}');
      </JsCode>,
      // Inject script script src="..."
      this.script('/assets/book.js'),
      // Inject inline code as string
      `[${data.map(el => el.id).join(',')}].forEach(id => new Book(id);`
    ];
  }

  // javascript for all components Book.
  // It will be place before tag <body> close
  js() {
    return [
      // Inject inline code as string
      'console.log("I am book in footer!!!");',
    ];
  }


  render() {
    const { id, name, author, year } = this.props;

    // You can store shared data for specific type
    // components (in this case Book) which were used on page
    this.setSharedData('id', id);

    return (
      <div>
        <p class="list-book__name">Name: {name}</p>
        <p>Author: {author}</p>
        <p>Year: {year}</p>
      </div>
    );
  }
}


const books = [
  { id: 1, author: 'Ivan Turgenev', name: 'Hunter\'s Notes', year: 1852 },
  { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
];
const obj = render.toObject(
  <div>
    {books.map(el =>
      <Book
        id={el.id}
        author={el.author}
        name={el.name}
        year={el.year}
      ></Book>
    )}
  </div>,
// second argument for turn on escape mode
  true
);
/*
<div>
  <div>
    <p class="list-book__name">Name: Hunter&#39;s Notes</p>
    <p>Author: Ivan Turgenev</p>
    <p>Year: 1852</p>
  </div>
  <div>
    <p class="list-book__name">Name: White Fang</p>
    <p>Author: Jack London</p>
    <p>Year: 1906</p>
  </div>
</div>
*/
console.log(obj.html);
/*
[
  "console.log('Escaped value &lt;body&gt;');",
  Script {
    _src: '/assets/book.js',
    _howLoad: '',
    _code: '',
    _onloadFuncName: '',
    _onloadCb: null
  },
  '[1,2].forEach(id => new Book(id);'
]
*/
console.log(obj.headJs);
/*
[ 'console.log("I am book in footer!!!");' ]
*/
console.log(obj.js);
```

* `headJs()` - this method is intended for declaration javascript for all specific type components (in this case for all components of "Book" type). Tags `<script>` will be placed in `<head></head>`.
* `js()` - this method is similar to `headJS()`, but tags `<script>` will be placed before tag `<body>` close.
*  `this.setSharedData(key, value)` - We can store shared data for specific type components (in this case for all components of "Book" type), which were used on the html page. For example, we save id of books and get them in declaration of javascript code for using in our business logic.
*  `this.getListSharedData()` - We get shared data as array (instance of components may be many on page).


### Css and JavaScript in Function component
```tsx
import { getJsxFactory, render, IgnisComp, JSX } from '@ignis-web/server-jsx-component';

const h = getJsxFactory();

// Component for wrapping inline js code
const JsCode = function (
  props: { escape?: boolean }, children: any[]
): JSX.Element {
  return <fragment escape={props.escape || false}>{children}</fragment>;
};

const FormatDate = (props: { date: Date, style: string }) => {
  // pass type of shared data
  IgnisComp.setDataForFuncComponent<{ id: number }>(FormatDate, {
    // set css
    css() {
      this.css('.time{color: green}');
      this.css(this.cssLink('http://my.domain/css/base.css'));
      this.css({
        fontSize: '12px',
        backgroundColor: 'red',
      });
    },
    // set shared data
    sharedData: { id: Date.now() },
    headJs() {
      return [
        this.script('http://cool-timepicker.js'),
        `console.log('Ids of TimePicker ${
          JSON.stringify(this.getSharedData())
        }');`,
      ]
    },
    js() {
      return [
        <JsCode>
          console.log('TimePicker init {JSON.stringify(this.getSharedData())}');
        </JsCode>
      ]
    },
  });
  const { date, style } = props;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${year}-${month}-${day}`;
  return <time datetime={dateStr} style={style}>{dateStr}</time>;
};

const obj = render.toObject(
  <FormatDate date={new Date()} style="color:red"></FormatDate>,
  true
);
// <time datetime="2023-10-7" style="color:red">2023-10-7</time>
console.log(obj.html);
/*
[
  '.time{color: green}',
  CssLink {
    _href: 'http://my.domain/css/base.css',
    _rel: 'stylesheet',
    _type: 'text/css'
  },
  CssClass {
    _name: 'a',
    _obj: { fontSize: '12px', backgroundColor: 'red' }
  }
]
*/
console.log(obj.css);
/*
[
  Script {
    _src: 'http://cool-timepicker.js',
    _howLoad: '',
    _code: '',
    _onloadFuncName: '',
    _onloadCb: null
  },
  `console.log('Ids of TimePicker [{"id":1696852720137}]');`
]
*/
console.log(obj.headJs);
/*
[ `console.log('TimePicker init [{"id":1696852720137}]');` ]
*/
console.log(obj.js);
```

### Script and Link
There are useful  set of methods in component
```js
this.css(this.cssLink('https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma-rtl.min.css'))
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma-rtl.min.css"/>
```
Method `this.cssLink` is used for convenient creation of tag `<link>`.

```js
this.script('https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js')
  .async()
  .onload('console.log("Highcharts is loading");')
```
Method `this.script` is used for convenient creation of tag `<script>`.
* `this.script(src?)` - to create tag with link. Src is optional
* `async()` - to add attribute `async`
* `defer()` - to add attribute `defer`
* `onload(string)` - to add attribute `onload` with passed js code
* `code(string)` - to add js code inside `<script></script>`


### Html Page
If you don't want manually building html page you can using special class `IgnisHtmlPage` which collecting html code of components and inserting all of needed css and js code.
For example, we create three components: `HtmlPage`(inherited from `IgnisHtmlPage`), `List Book`, `Book` and you will see the basic capabilities such as component approach and isolated `css in js`.
```tsx
import { getJsxFactory, render, IgnisComp, IgnisHtmlPage, noEscape, JSX } from '@ignis-web/server-jsx-component';

const h = getJsxFactory();

// Component for wrapping inline js code
const JsCode = function (
  props: { escape?: boolean }, children: any[]
): JSX.Element {
  return <fragment escape={props.escape || false}>{children}</fragment>;
};
// For components witout parent: https://react.dev/reference/react/Fragment
const Fragment = function (_: any, children: any[]): JSX.Element {
  return <fragment>{children}</fragment>;
};

class HtmlPage extends IgnisHtmlPage<{}> {

  // turn on/of minificaton of output html
  minify() {
    return true;
  }

  title() {
    return 'Jsx Server component';
  }

  description() {
    return 'It\'s description of page';
  }

  keywords() {
    return `
      keyword1,
      keyword2
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

  // global javascript for footer.
  // It will be place before tag <body> close
  js() {
    return [
      'console.log("I am run in end of page");',
    ];
  }

  render() {
    const id = this.createId();
    const cls = this.createClassName();


    this.css(
      this.cssLink('https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma-rtl.min.css')
    );
    this.css('.column', { display: 'flex', borderLeft: '12px solid red' });

    return (
      <Fragment>
        <div id={id} class={'columns ' + cls}>
          {this.children}
        </div>
      </Fragment>
    )
  }
}

class ListBook extends IgnisComp<
  {
    title: JSX.Element,
    books: Array<{ id: number; name: string; author: string; year: number }>
  }
> {
  render() {
    const { title, books } = this.props;
    return (
      <div>
        {title}
        <p>Count: {books.length}</p>
        {/* Collection of methods for handy work with JSX elements: forEach, if/else/else if, switch/case, each and etc. */}
        {this.tpl.forEach(books, el => <Book data={el}></Book>)}
      </div>
    );
  }
}

class Book extends IgnisComp<
  { data: { id: number; name: string; author: string; year: number } },
  never,
  { id: number }
> {

  // javascript for all components Book.
  // It will be place in <head></head>
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

  // javascript for all components Book.
  // It will be place before tag <body> close
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

    // You can store shared data for specific type
    // components (in this case Book) which were used on page
    this.setSharedData('id', id);

    return (
      <div class={cl_book}>
        <p class="list-book__name">Name: {name}</p>
        <p class={cl_author}>Author: {author}</p>
        <p>Year: {year} ${'\n\n\n'}</p>
      </div>
    );
  }
}

const books = [
  { id: 1, author: 'Leo Tolstoy', name: 'War and Peace', year: 1863 },
  { id: 2, author: 'Jack London', name: 'White Fang', year: 1906 }
];
const htmlPage: JSX.Element = (
  <HtmlPage
  // You can redefine meta tags for page via attributes
  /*
    title='Test'
    description='Test'
    keywords='Test'
  */
  >
    <div class="column">
      <ListBook
        books={books}
        title={<h1>User's list books:</h1>}>
      </ListBook>
      {/* Disable escape XSS content for value */ }
      <div
        data-el-data={noEscape(JSON.stringify({ key: 'key', name: '<script></script>' }))}
      ></div>
    </div>
    {/* Disable escape XSS content for node */ }
    <script noEscape>
      console.log('console.log');
    </script>
  </HtmlPage>
);
const html = render.toHtmlPage(htmlPage, { escape: true });
// <!DOCTYPE html><html lang="EN"><head><title>Jsx Server component</title>...</body></html>
console.log(html);
```
[More examples](https://github.com/dm-kamaev/server-jsx-component/tree/master/src/example)

### Tpl
Collection of methods for handy work with JSX elements: `forEach`, `if/else/else if`, `switch/case`, `each`, `class` and etc.

##### forEach:
```tsx
<div>
  {this.tpl.forEach(books, el => <Book data={el}></Book>)}
</div>
```

##### if/else/else if:
```tsx
<div>
  {this.tpl
    .if(value === 1, () => <p>is if</p>)
    .elseIf(value === 2, <p>is else if</p>)
    .else(() => `<p>is else</p>`)
  }
</div>
```

Passing result of condtion:
```tsx
const object: { key1: string } | { key2: number } = { key1: 'ssdf' } as any;
<div>
  {this.tpl
    .if('key1' in object && object.key1, value =>
      <p>object has key1, value = {value}, type value is string</p>
    )
    .elseIf('key2' in object && object.key2, value =>
      <p>object has key2, value = {value}, type value is number</p>
    )
    .else(() => `<p>is unknown object</p>`)
  }
</div>
```

##### switch/case
```tsx
<div>
  {this.tpl
    .switch(value)
    .case(1, (val) => <p>is {val}</p>)
    .case([2,3], <p>is 2 or 3</p>)
    .default(() => `<p>is other</p>`)
  }
</div>
```

##### each
```tsx
<div>
  {tpl.each({ k1: value, k2: date }, (value, key, index) => {
    if (index > 0) {
      return;
    }
    return (
      <li>
        <FormatDate date={value} style="margin-top:10px" />
      </li>
    );
  })}
</div>
```

##### class
Method for create css classes:
```tsx
<div>
  {/* <div class="danger"></div> */}
  <div {...this.tpl.class({ danger: true, success: false })}></div>
</div>
```

##### func
It's alternative IIFE:
```tsx
<div>
  {this.tpl.func(() => {
    if (true) {
      return <div>True</div>;
    } else {
      return <div>False</div>;
    }
  })}
</div>
```

### Tsconfig
For proper build project, you should add follow fields in `tsconfig.json`:
```json
{
  "compilerOptions": {
    ...
    "lib": [
      "DOM"
    ],
    ...
    "jsx": "react",
    "jsxFactory": "h"
  }
}
```
`jsx` and `jsxFactory` are options for typescript compiler which translating jsx to javascript code.
`DOM` is option for correct work of autocomplete for css properties (method `this.css()`).

If you want transform jsx to javascript wihout typescript compiler, you should use **babel**:
```sh
npm i babel-cli babel-plugin-transform-jsx -D
```
.babelrc
```json
{
  "plugins": ["babel-plugin-transform-jsx"]
}
```

#### TODO
* Add support handlers onlClick/onChange and etc


