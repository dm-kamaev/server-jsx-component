import { CssClass, mediaRange } from '../src/index';

describe('[CssClass.ts]', function () {

  it('render class', async function () {
    const cl = new CssClass('article', {
      'color': 'red',
      'background-color': 'red',
      fontSize: '24px',
    });
    expect(cl.getBody()).toEqual('.article{color:red;background-color:red;font-size:24px;}');
  });

  it('render class with :hover and :focus', async function () {
    const cl = new CssClass('article', {
      'color': 'red',
      'background-color': 'red',
      fontSize: '24px',
      '&:hover': {
        'background-color': 'orange',
        fontSize: '12px',
      },
      '&:focus': {
        backgroundColor: 'green',
        'font-size': '22px',
      },
    });

    expect(cl.getBody()).toEqual(
      '.article{color:red;background-color:red;font-size:24px;}.article:hover{background-color:orange;font-size:12px;}.article:focus{background-color:green;font-size:22px;}'
    );
  });

  test.each([
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('300px <= width <= 750px')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (min-width:300px) and (max-width:750px){.article{font-size:120px;}.article:focus{background-color:green;}}'],
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('300px <= width')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (min-width:300px){.article{font-size:120px;}.article:focus{background-color:green;}}'],
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('width >= 300px')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (min-width:300px){.article{font-size:120px;}.article:focus{background-color:green;}}'],
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('width <= 300px')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (max-width:300px){.article{font-size:120px;}.article:focus{background-color:green;}}'],
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('300px >= width')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (max-width:300px){.article{font-size:120px;}.article:focus{background-color:green;}}']
  ])('render class with @media rules', ({ class_name, props }, expected) => {
    const cl = new CssClass(class_name, props);
    expect(cl.getBody()).toBe(expected);
  });

  test.each([
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('width > 300px')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (min-width:300.01px){.article{font-size:120px;}.article:focus{background-color:green;}}'],
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('width < 300px')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (max-width:299.99px){.article{font-size:120px;}.article:focus{background-color:green;}}'],
    [{
      class_name: 'article', props: {
        backgroundColor: 'red',
        [`@media screen and ${mediaRange('300px < width < 750px')}`]: {
          'font-size': '120px',
          '&:focus': {
            'background-color': 'green'
          },
        }
      }
    }, '.article{background-color:red;}@media screen and (min-width:300.01px) and (max-width:749.99px){.article{font-size:120px;}.article:focus{background-color:green;}}'],
  ])('calc limit for @media rules', ({ class_name, props }, expected) => {
    const cl = new CssClass(class_name, props);
    expect(cl.getBody()).toBe(expected);
  });

});
