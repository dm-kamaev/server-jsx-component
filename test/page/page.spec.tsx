import { getJsxFactory, IgnisComp, IgnisHtmlPage, render, JSX } from '../../src/index';
import { noEscape } from '../../src/jsx/escape';

describe('[IgnisHtmlPage]', () => {

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 9, 5));
    Date.now = () => 1696432990412;
  });

  const h = getJsxFactory();
  const Fragment = (_: any, children: any[]): JSX.Element => {
    return <fragment>{children}</fragment>;
  };

  const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
    return <fragment escape={props.escape || false}>{children}</fragment>;
  };

  const FormatDate = (props: { date: Date, style: string }) => {
    IgnisComp.setDataForFuncComponent<{ id: number }>(FormatDate, {
      css: function () { this.css('.time{color: green}') },
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

    onClick(e) {
      console.log('Click');
    }

    render() {
      const { title, date, author, lead } = this.props;
      const id = this.createId();
      const cls = this.createClassName();
      const value = 3;
      return (
        <article id={id} for="example" class={'test ' + cls} style="margin-top:20px">
          <h1 data-el-data={JSON.stringify(['<script></script>', 'alert(1)' ])}>{title}</h1>
          <ul>
            {/* onClick={this.onClick} */}
            {this.tpl.forEach([date, date], (d, i) => {
              if (i === 0) {
                return;
              }
              return (
                <li>
                  <FormatDate date={d} style="margin-top:10px" />
                </li>
              );
            })}
            {this.tpl.each({ d1: date, d2: date }, (d, _, i) => {
              if (i > 0) {
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
              .case(1, () => <p>is 1</p>)
              .case([2,3], <p>is 2 or 3</p>)
              .default(() => `<p>is other</p>`)
            }
            {this.tpl
              // @ts-expect-error
              .if(value === 1, () => <p>is if</p>)
              // @ts-expect-error
              .elseIf(value === 2, <p>is else if</p>)
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

  const title = 'Hello TypeScript and JSX!';
  const lead = <p>I like TypeScript and JSX.</p>;
  const id = 'main';

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

  it('whole page: with 2 children', () => {
    const doc: JSX.Element = (
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

    const html = render.toHtmlPage(doc, { escape: true });

    expect(html).toEqual(`<!DOCTYPE html><html lang="EN"><head><title>Title from method</title><meta name="description" content="Description from method"><meta name="keywords" content="Keywords from method"><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" type="text/css" href="http://bulma-calendar/dist/css/bulma-calendar.min.css"/><style>.global-title{color:#333;font-size:24px;}.time{color: green}.b{color:red;}.b:focus{background-color:orange;}.list-book__author{text-transform:capitalize;}.list-book__name{font-size: 16px}.lead{color:red}</style><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Wikiki/bulma-tooltip@3.0.2/dist/css/bulma-tooltip.min.css"/><script>alert("Alert on page in header");</script><script src="http://cool-timepicker.js"></script><script>console.log('Ids of TimePicker [{"id":1696432990412},{"id":1696432990412}]');console.log("This js code in <head></head>, sharedData = [{"id":1696432990412},{"id":1696432990412}]");console.log('JSX inline script code in <head>'); console.log('JSX inline script code in <head>');</script><script>function __onload_1696432990412(){console.log("Highcharts is loading");}</script><script src="https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js" async onload="__onload_1696432990412();"></script></head><body>123<article id="Z" for="example" class="test a" style="margin-top:20px"><h1 data-el-data="[&quot;&lt;script&gt;&lt;/script&gt;&quot;,&quot;alert(1)&quot;]">Hello TypeScript and JSX!</h1><ul><li><time datetime="2023-10-5" style="margin-top:10px">2023-10-5</time></li><li><time datetime="2023-10-5" style="margin-top:10px">2023-10-5</time></li><p>is 1</p>&lt;p&gt;is else&lt;/p&gt;<li><div id="879" class="b"><p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: &lt;^o^&gt;/</p><p>Year: 1894</p></div></li></ul><div id="1696432990412" class="lead"><p>I like TypeScript and JSX.</p></div><div id="1696432990412" class="lead"><p>I like TypeScript and JSX.</p></div><div class="body"><p id="main" data-el-data="{"key":"key","name":"<script></script>"}">The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.</p></div></article><script>console.log('Hello world!!!'); document.getElementById('main').innerHTML = 'Replace via js';</script><script>alert('Alert on page in footer');console.log("Hell I am doc");console.log('TimePicker init [{"id":1696432990412},{"id":1696432990412}]');</script><script src="https://unpkg.com/axios/dist/axios.min.js"></script><script>console.log('This js code before sharedData = [{"id":1696432990412},{"id":1696432990412}] </body>');console.log('JSX inline script code in footer <body>');</script></body></html>`);
  });

  it('whole page: with 1 child', () => {
    const doc: JSX.Element = (
      <HtmlPage
        // title='Test' description='Description' keywords='Keywords'
      >
        <Doc title={title} date={new Date()} author="<^o^>/" lead={lead}>
          <p id={id} data-el-data={noEscape(JSON.stringify({ key: 'key', name: '<script></script>' }))}>
            The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.
          </p>
        </Doc>
      </HtmlPage>
    );

    const html = render.toHtmlPage(doc, { escape: true });

    expect(html).toEqual(`<!DOCTYPE html><html lang="EN"><head><title>Title from method</title><meta name="description" content="Description from method"><meta name="keywords" content="Keywords from method"><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" type="text/css" href="http://bulma-calendar/dist/css/bulma-calendar.min.css"/><style>.global-title{color:#333;font-size:24px;}.time{color: green}.d{color:red;}.d:focus{background-color:orange;}.list-book__author{text-transform:capitalize;}.list-book__name{font-size: 16px}.lead{color:red}</style><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Wikiki/bulma-tooltip@3.0.2/dist/css/bulma-tooltip.min.css"/><script>alert("Alert on page in header");</script><script src="http://cool-timepicker.js"></script><script>console.log('Ids of TimePicker [{"id":1696432990412},{"id":1696432990412}]');console.log("This js code in <head></head>, sharedData = [{"id":1696432990412},{"id":1696432990412}]");console.log('JSX inline script code in <head>'); console.log('JSX inline script code in <head>');</script><script>function __onload_1696432990413(){console.log("Highcharts is loading");}</script><script src="https://cdnjs.cloudflare.com/ajax/libs/highcharts/9.3.2/highcharts.js" async onload="__onload_1696432990413();"></script></head><body>123<article id="Y" for="example" class="test c" style="margin-top:20px"><h1 data-el-data="[&quot;&lt;script&gt;&lt;/script&gt;&quot;,&quot;alert(1)&quot;]">Hello TypeScript and JSX!</h1><ul><li><time datetime="2023-10-5" style="margin-top:10px">2023-10-5</time></li><li><time datetime="2023-10-5" style="margin-top:10px">2023-10-5</time></li><p>is 1</p>&lt;p&gt;is else&lt;/p&gt;<li><div id="879" class="d"><p class="list-book__name">Name: War and Peace</p><p class="list-book__author">Author: &lt;^o^&gt;/</p><p>Year: 1894</p></div></li></ul><div id="1696432990412" class="lead"><p>I like TypeScript and JSX.</p></div><div id="1696432990412" class="lead"><p>I like TypeScript and JSX.</p></div><div class="body"><p id="main" data-el-data="{"key":"key","name":"<script></script>"}">The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.</p></div></article><script>alert('Alert on page in footer');console.log("Hell I am doc");console.log('TimePicker init [{"id":1696432990412},{"id":1696432990412}]');</script><script src="https://unpkg.com/axios/dist/axios.min.js"></script><script>console.log('This js code before sharedData = [{"id":1696432990412},{"id":1696432990412}] </body>');console.log('JSX inline script code in footer <body>');</script></body></html>`);
  });

  it('default title, description, keywords', () => {

    class HtmlPage extends IgnisHtmlPage<{}, any[]> {
      render() {
        return <Fragment>{this.children}</Fragment>
      }
    }

    const page: JSX.Element = (
      <HtmlPage>
        <p id={id} data-el-data={noEscape(JSON.stringify({ key: 'key', name: '<script></script>' }))}>
          The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.
        </p>
      </HtmlPage>
    );

    const html = render.toHtmlPage(page, { escape: true });
    expect(html).toEqual(`<!DOCTYPE html><html lang="EN"><head><title>Hello, I am page with IgnisComponent !</title><meta name="description" content=""><meta name="keywords" content=""><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><p id="main" data-el-data="{"key":"key","name":"<script></script>"}">The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.</p></body></html>`);
  });

  it('set title, description, keywords via attributes', () => {

    class HtmlPage extends IgnisHtmlPage<{ title?: string; keywords?: string; description?: string }, any[]> {
      render() {
        return <Fragment>{this.children}</Fragment>
      }
    }

    const page: JSX.Element = (
      <HtmlPage
        title='Test'
        keywords='Test'
        description='Test'
      >
        <p id={id} data-el-data={noEscape(JSON.stringify({ key: 'key', name: '<script></script>' }))}>
          The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.
        </p>
      </HtmlPage>
    );

    const html = render.toHtmlPage(page, { escape: true });

    expect(html).toEqual(`<!DOCTYPE html><html lang="EN"><head><title>Test</title><meta name="description" content="Test"><meta name="keywords" content="Test"><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><p id="main" data-el-data="{"key":"key","name":"<script></script>"}">The document is <a href="https://www.typescriptlang.org/docs/handbook/jsx.html">here</a>.</p></body></html>`);
  });

  it('escape children in head js and footer js', () => {

    class EscapeChildren extends IgnisComp<any> {
      headJs() {
        return [
          <JsCode escape>
            console.log('I am code in header {'<script></script>'});
          </JsCode>
        ];
      }

      js() {
        return [
          <JsCode escape>
            console.log('I am code in footer {'<script></script>'}');
          </JsCode>,
          '<script>document.querySelector("#page").innerHTML = "none";</script>',
          '<script>requestAnimationFrame(function () { console.log("requestAnimationFrame"); });</script>',
        ];
      }

      render() {
        return (
          <div {...this.tpl.class({ danger: true, success: false })}>
            Example
            <p>{this.tpl.func(() => {
              return <div>Call function</div>;
            })}</p>
            {this.tpl.each({ 23: { id: 23, name: 'John', lastName: 'Parker' }, 24: { id: 23, name: 'Maddison',  } }, (el, userId, index) => {
              return (
                <div id={userId} data-i-inder={index}>
                  <p {...this.tpl.class({ title: true, big: true })}>Id: {el.id}</p>
                  {this.tpl.if(true, <p>Name: {el.name}</p>)}
                  {this.tpl.if('lastName' in el, () => <p>Last Name: {'lastName' in el && el.lastName}</p>)}
                  {this.tpl
                    .switch(2)
                    .case(1, () => <p>is 1</p>)
                    .case([2,3], <p>is 2 or 3</p>)
                  }
                  {this.tpl
                    .switch(12)
                    .case(1, () => <p>is 1</p>)
                    .case([2,3], <p>is 2 or 3</p>)
                    .default(<p>is default</p>)
                  }
                  {this.tpl.if('lastName' in el, () => <p>User has last Name</p>).elseIf(!('lastName' in el), <p>User hasn't last name</p>)}
                </div>
              );
            })}
          </div>
        );
      }
    }
    const page: JSX.Element = (
      <HtmlPage>
        <EscapeChildren/>
      </HtmlPage>
    );

    const html = render.toHtmlPage(page, { escape: true });
    expect(html).toEqual(`<!DOCTYPE html><html lang="EN"><head><title>Title from method</title><meta name="description" content="Description from method"><meta name="keywords" content="Keywords from method"><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" type="text/css" href="http://bulma-calendar/dist/css/bulma-calendar.min.css"/><style>.global-title{color:#333;font-size:24px;}</style><script>alert("Alert on page in header");console.log(&#39;I am code in header &lt;script&gt;&lt;/script&gt;);</script></head><body>123<div class="danger">Example<p><div>Call function</div></p><div id="23" data-i-inder="0"><p class="title big">Id: 23</p><p>Name: John</p><p>Last Name: Parker</p><p>is 2 or 3</p><p>is default</p><p>User has last Name</p></div><div id="24" data-i-inder="1"><p class="title big">Id: 23</p><p>Name: Maddison</p><p>is 2 or 3</p><p>is default</p><p>User hasn&#39;t last name</p></div></div><script>alert('Alert on page in footer');console.log(&#39;I am code in footer &lt;script&gt;&lt;/script&gt;&#39;);</script><script>document.querySelector("#page").innerHTML = "none";</script><script>requestAnimationFrame(function () { console.log("requestAnimationFrame"); });</script></body></html>`);
  });
})