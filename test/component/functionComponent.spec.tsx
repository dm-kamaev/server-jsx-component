
import { getJsxFactory, IgnisComp, render } from '../../src/index';
import Script from '../../src/element/Script';

describe('[IgnisComp: functional component]', function () {
  const h = getJsxFactory();
  const JsCode = function (props: { escape?: boolean }, children: any[]): JSX.Element {
    return <fragment escape={props.escape || false}>{children}</fragment>;
  };

  const FormatDate = (props: { date: Date, style: string }) => {
    IgnisComp.setDataForFuncComponent<{ id: number }>(FormatDate, {
      css: [ '.time{color: green}'],
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

  beforeAll(() => {
    Script.createOnloadName = () => 'onload';
    Date.now = () => 1696432990412;
  });


  it('functional component without escape', async function () {
    const object = render.toObject(<FormatDate date={new Date('2023-09-23 01:00:00')} style={'color:<>red'}></FormatDate>, false);

    expect(object.html).toBe('<time datetime="2023-9-23" style="color:<>red">2023-9-23</time>');
    expect(object.css).toMatchObject(['.time{color: green}']);

    expect(object.headJs).toHaveLength(2);
    expect(object.headJs[0]).toBeInstanceOf(Script);
    expect(object.headJs[1]).toBe(`console.log('Ids of TimePicker [{"id":1696432990412}]');`);

    expect(object.js).toMatchObject([`console.log('TimePicker init [{"id":1696432990412}]');`]);
  });

  it('functional component with escape', async function () {
    const object = render.toObject(<FormatDate date={new Date('2023-09-23 01:00:00')} style={'"<script>alert(1);</script>"'}></FormatDate>, true);

    expect(object.html).toBe('<time datetime="2023-9-23" style="&quot;&lt;script&gt;alert(1);&lt;/script&gt;&quot;">2023-9-23</time>');
    expect(object.css).toMatchObject(['.time{color: green}']);

    expect(object.headJs).toHaveLength(2);
    expect(object.headJs[0]).toBeInstanceOf(Script);
    expect(object.headJs[1]).toBe(`console.log('Ids of TimePicker [{"id":1696432990412}]');`);

    expect(object.js).toMatchObject([`console.log('TimePicker init [{"id":1696432990412}]');`]);
  });


});