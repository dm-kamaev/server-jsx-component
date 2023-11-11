

import { Link } from '../src/index';

describe('[Link.ts]', function () {

  it('<link>', async function () {
    const link = new Link('/static/oxygen-fontfacekit/stylesheet.css').rel('stylesheet').charset('utf-8').media('print').sizes('114x114').type('text/css').toString();
    expect(link).toEqual('<link charset="utf-8" rel="stylesheet" media="print" sizes="114x114" type="text/css" href="/static/oxygen-fontfacekit/stylesheet.css"/>')
  });
});
