
import { getJsxFactory, render, JSX, tpl, noEscape, IgnisComp, IgnisHtmlPage } from '../index';

const h = getJsxFactory();
// For components witout parent: https://react.dev/reference/react/Fragment
const Fragment = (_: any, children: any[]): JSX.Element => {
  return <fragment>{children}</fragment>;
};
// Component for wrapping inline js code
const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
  return <fragment escape={props.escape || false}>{children}</fragment>;
};

const FormatDate = (props: { date: Date, style: string }) => {
  IgnisComp.setDataForFuncComponent<{ id: number }>(FormatDate, {
    css: () => [ '.time{color: green}'],
    sharedData: { id: Date.now() },
    headJs() {
      return [
        this.script('http://cool-timepicker.js'),
        `console.log('Ids of TimePicker ${JSON.stringify(this.getSharedData())}');`,
      ]
    },
    js() {
      return [
        // `console.log("This js code before sharedData = ${JSON.stringify(this.getSharedData())} </body>")`,
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

class Lead extends IgnisComp<any, any[], { id: number }> {

  headJs() {
    return [
      `console.log("This js code in <head></head>, sharedData = ${JSON.stringify(this.getListSharedData())}");`,
      <JsCode>
        console.log('JSX inline script code in {'<head>'}');
        console.log('JSX inline script code in {'<head>'}');
      </JsCode>,
      this.script('https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js')
        .async()
        .onload('console.log("Highcharts is loading");')
    ];
  }

  js() {
    return [
      this.script('https://unpkg.com/axios/dist/axios.min.js'),
      `console.log('This js code before sharedData = ${JSON.stringify(this.getListSharedData())} </body>');`,
      <JsCode>
        console.log('JSX inline script code in footer {'<body>'}');
      </JsCode>
    ];
  }

  render() {
    this.css('.lead{color:red}');
    this.css(this.link('https://cdn.jsdelivr.net/gh/Wikiki/bulma-tooltip@3.0.2/dist/css/bulma-tooltip.min.css').rel('stylesheet'));
    const id = this.setSharedData('id', Date.now());
    return <div id={id} class="lead">{this.children}</div>;
  }
}


class Body extends IgnisComp<any, any[]> {
  render(_, children: any[]) {
    // or {this.children}
    return <div class="body">{children}</div>;
  }
}


class Author extends IgnisComp<{ id: number, author: string, name: string, year: number }> {
  render() {
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

    const { id, author, name, year } = this.props;

    return (
      <div id={id} class={cl_book}>
        <p class="list-book__name">Name: {name}</p>
        <p class={cl_author}>Author: {author}</p>
        <p>Year: {year}</p>
      </div>
    );
  }
}

class Doc extends IgnisComp<{ title: string; date: Date; author: string; lead: JSX.Element }, any[]> {

  js() {
    return ['console.log("Hell I am doc");'];
  }

  render() {
    const { title, date, author, lead } = this.props;
    const id = this.createId();
    const cls = this.createClassName();
    const value = Date.now();
    return (
      <article id={id} for="example" class={'test ' + cls} style="margin-top:20px">
        <h1 data-el-data={JSON.stringify(['<script></script>', 'alert(1)' ])}>{title}</h1>
        <ul>
          {/* onClick={this.onClick} */}
          {tpl.forEach([date, date], (d, i) => {
            if (i === 0) {
              return;
            }
            return (
              <li>
                <FormatDate date={d} style="margin-top:10px" />
              </li>
            );
          })}
          {tpl.each({ d1: date, d2: date }, (d, key, index) => {
            if (index > 0) {
              return;
            }
            return (
              <li>
                <FormatDate date={d} style="margin-top:10px" />
              </li>
            );
          })}
          {this.tpl
            .switch(1)
            .case(1, (val) => <p>is {val}</p>)
            .case([2,3], <p>is 2 or 3</p>)
            .default(() => `<p>is other</p>`)
          }
          {this.tpl
            .if(value, (value) => <p>is if</p>)
            // .if(value === 1, (value) => <p>is if</p>)
            .elseIf(value === Date.now(), (val) => <p>is else if</p>)
            // .elseIf(value, (val) => <p>is else if</p>)
            .else(() => `<p>is else</p>`)
          }
          <li><Author id={879} author={author} year={1894} name="War and Peace"></Author></li>
        </ul>
        <Lead>{lead}</Lead>
        <Lead>{lead}</Lead>
        <Body>{this.children}</Body>
      </article>
    );
  }
}



class HtmlPage extends IgnisHtmlPage<{ title?: string; description?: string; keywords?: string }, any[]> {

  title() {
    return 'Title from method';
  }

  description() {
    return 'Description from method';
  }

  keywords() {
    return 'Keywords from method';
  }

  headJs() {
    return [
      'alert("Alert on page in header");',
    ];
  }

  js() {
    return [
      <JsCode>
        alert('Alert on page in footer');
      </JsCode>
    ];
  }

  render() {
    this.css(this.cssLink('http://bulma-calendar/dist/css/bulma-calendar.min.css'));
    this.css('global-title', {
      color: '#333',
      'font-size': '24px',
    });
    return (
      <Fragment>
        {this.tpl.forEach([1, 2, 3], (el) => el)}
        {this.children}
      </Fragment>
    );
  }
}


const title = 'Hello TypeScript and JSX!';
const lead = <p>I like TypeScript and JSX.</p>;
const id = 'main';
const doc: JSX.Element = (
  <Doc title={title} date={new Date()} author="<^o^>/" lead={lead}>
    <p id={id}>
      The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.
    </p>
    <script>
      console.log('Hello world!!!');
      document.getElementById('{id}').innerHTML = 'Replace via js';
    </script>
  </Doc>
);
// Render to object
const object = render.toObject(doc, true);
console.log(object);


const page: JSX.Element = (
  <HtmlPage
    // title='Test' description='Description' keywords='Keywords'
  >
    <Doc title={title} date={new Date()} author="<^o^>/" lead={lead}>
      <p id={id} data-el-data={noEscape(JSON.stringify({ key: 'key', name: '<script></script>' }))}>
        The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.
      </p>
    </Doc>
    <script noEscape>
      console.log('Hello world!!!');
      document.getElementById('{id}').innerHTML = 'Replace via js';
    </script>
  </HtmlPage>
);

const html = render.toHtmlPage(page, { escape: true });
console.log(html);
