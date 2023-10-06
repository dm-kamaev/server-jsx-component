/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['^.+\\.js$'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  // bail: 1,
  verbose: true,
  // automock: false,
  setupFilesAfterEnv: ['./test/jest-setup.ts'],
  coverageReporters: ['json-summary', 'json-summary', 'text', 'lcov']
};
