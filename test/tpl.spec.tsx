import { getJsxFactory, tpl, render } from '../src/index';

describe('[tpl]', function () {

  const h = getJsxFactory();

  it('two if in attribute', async function () {
    const result = render.toObject(<p {...tpl.if(true, () => ({ class: 'test' })).getAsAttr()} {...tpl.if(true, (id) => ({ id })).getAsAttr()}></p>, true);
    expect(result.html).toEqual('<p class="test" id="true"></p>');
  });

  it('if and switch in attribute', async function () {
    const result = render.toObject(<p {...tpl.if(true, () => ({ class: 'test' }))} {...tpl.switch(1).case(1, (id) => ({ id }))}></p>, true);
    expect(result.html).toEqual('<p class="test" id="1"></p>');
  });

  it('two if in attribute (without attributes)', async function () {
    const result = render.toObject(<p {...tpl.if(false, () => ({ class: 'test' })).getAsAttr()} {...tpl.if(false, (id) => ({ id })).getAsAttr()}></p>, true);
    expect(result.html).toEqual('<p></p>');
  });

  test.each([
    [1, '<p class="true 1" id="1"></p>'],
    [2, '<p class="true 2" id="2"></p>'],
    [3, '<p class="other" id="3"></p>'],
  ])('if/else/else if with attributes', (value, expected) => {
    const result = render.toObject(<p
      {...tpl
        .if(value === 1, val => ({ class: `${val} ${value}` }))
        .elseIf(value === 2, val => ({ class: `${val} ${value}` }))
        .else(({ class: 'other' }))
      }
      {...tpl
        .switch(value)
        .case(1, (id) => ({ id }))
        .case(2, (id) => ({ id }))
        .default((id) => ({ id }))
      }></p>, true);
    expect(result.html).toEqual(expected);
  });


  test.each([
    [ { key1: 'key1' }, '<p>object has key1, value = key1 (type string)</p>' ],
    [ { key2: 3453 }, '<p>object has key2, value = 3453 (type number)</p>' ],
    [ {}, '&lt;p&gt;is unknown object&lt;/p&gt;' ],
  ])('if/else/else if', (object, expected) => {
    const result = render.toObject(<div>{tpl
      .if('key1' in object && object.key1, (value) => <p>object has key1, value = {value} (type string)</p>)
      .elseIf('key2' in object && object.key2, (value) => <p>object has key2, value = {value} (type number)</p>)
      .else(() => `<p>is unknown object</p>`)
    }</div>, true);
    expect(result.html).toBe(`<div>${expected}</div>`);
  });

  test.each([
    [ { key1: 'key1' }, '<p>object has key1, value = key1 (type string)</p>' ],
    [ { key2: 3453 }, '<p>object has key2, value = 3453 (type number)</p>' ],
    [ {}, '<p>is unknown object</p>' ],
  ])('if/else/else if without callback', (object, expected) => {
    const result = render.toObject(<div>{tpl
      .if('key1' in object && object.key1,<p>object has key1, value = key1 (type string)</p>)
      .elseIf('key2' in object && object.key2, <p>object has key2, value = 3453 (type number)</p>)
      .else(<p>is unknown object</p>)
    }</div>, true);
    expect(result.html).toBe(`<div>${expected}</div>`);
  });

  test.each([
    [ { key1: 'key1' }, '<p>object has key1, value = key1 (type string)</p>' ],
    [ { key2: 3453 }, '<p>object has key2, value = 3453 (type number)</p>' ],
    [ {}, '<p>is unknown object</p>' ],
  ])('if/else/else return string', (object, expected) => {
    const result = render.toObject(<div>{tpl
      .if('key1' in object && object.key1, '<p>object has key1, value = key1 (type string)</p>')
      .elseIf('key2' in object && object.key2, () => '<p>object has key2, value = 3453 (type number)</p>')
      .else('<p>is unknown object</p>')
    }</div>, false);
    expect(result.html).toBe(`<div>${expected}</div>`);
  });

  test.each([
    [{ key1: 'key1' }, '<div></div>' ],
    [{ key2: 3453 }, '<div></div>' ],
    [{}, '<div></div>' ],
  ])('if/else/else return empty', (object, expected) => {
    const result = render.toObject(<div> {tpl
      .if('key1' in object && object.key1, () => ({ branch: 'if' }))
      .elseIf('key2' in object && object.key2, () => ({ branch: 'else if' }))
      .else(() => ({ branch: 'else' }))
    }</div>, true);
    expect(result.html).toBe(`${expected}`);
  });

  test.each([
    [1, '<p>1</p>'],
    [2, '<div>2</div>'],
    [3, '<div>3</div>'],
    [10, '<span>10</span>'],
  ])('switch/case', (value, expected) => {
    const result = render.toObject(<div>{tpl
      .switch(value)
      .case(1, (val) => <p>{val}</p>)
      .case([2, 3], (val) => <div>{val}</div>)
      .default((val) => <span>{val}</span>)
    }</div>, true);
    expect(result.html).toBe(`<div>${expected}</div>`);
  });

  test.each([
    [1, '<p>1</p>'],
    [2, '<div>2</div>'],
    [10, ''],
  ])('switch/case without default', (value, expected) => {
    const result = render.toObject(<div>{tpl
      .switch(value)
      .case(1, (val) => <p>{val}</p>)
      .case(2, (val) => <div>{val}</div>)
    }</div>, true);
    expect(result.html).toBe(`<div>${expected}</div>`);
  });

  test.each([
    [1, '<p>1</p>'],
    [2, '<div>2 or 3</div>'],
    [3, '<div>2 or 3</div>'],
    [10, '<span>other</span>'],
  ])('switch/case without callback', (value, expected) => {
    const result = render.toObject(<div>{tpl
      .switch(value)
      .case(1, <p>1</p>)
      .case([2, 3], <div>2 or 3</div>)
      .default(<span>other</span>)
    }</div>, true);
    expect(result.html).toBe(`<div>${expected}</div>`);
  });

  test.each([
    [1, '<p>1</p>'],
    [2, '<div>2 or 3</div>'],
    [3, '<div>2 or 3</div>'],
    [10, '<span>other</span>'],
  ])('switch/case return string', (value, expected) => {
    const result = render.toObject(<div>{tpl
      .switch(value)
      .case(1, () => `<p>1</p>`)
      .case([2, 3], `<div>2 or 3</div>`)
      .default(() => `<span>other</span>`)
    }</div>, false);
    expect(result.html).toBe(`<div>${expected}</div>`);
  });

  test.each([
    [1, '<div></div>'],
    [2, '<div></div>'],
    [3, '<div></div>'],
    [10, '<div></div>'],
  ])('switch/case return empty', (value, expected) => {
    const result = render.toObject(<div>{tpl
      .switch(value)
      .case(1, () => ({ branch: 'case 1' }))
      .case([2, 3], ({ branch: 'case 2' }))
      .default(() => ({ branch: 'default' }))
    }</div>, false);
    expect(result.html).toBe(`${expected}`);
  });
});
