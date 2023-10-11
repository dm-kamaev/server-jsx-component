// import { diffStringsUnified } from 'jest-diff';

export { };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      // toBeOdd(): R;
      toBeEqualStr(content: string): R;
    }
  }
}

// expect.extend({
//   toBeEqualStr(input, received) {
//     // expect(formater(input)).toBe(formater(received))
//     if (formater(input) === formater(received)) {
//       return {
//         message: () => `${input} is equal ${received}`,
//         pass: true,
//       };
//     } else {
//       console.log(diffStringsUnified(formater(received), formater(input)));
//       return {
//         message: () => `INPUT:"${input}"\n\n=== NOT EQUAL ===\n\nRECEIVED:"${received}""`,
//         pass: false,
//       };
//     }
//   },
// });

// function formater(str) {
//   return str.replace(/\s+/g, ' ').trim();
// }


