export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/test/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  // coverageDirectory: './coverage',
  // coveragePathIgnorePatterns: ['node_modules', 'src/database', 'src/test', 'src/types'],
  // reporters: ['default', 'jest-junit'],
  moduleNameMapper: {
    '^\./(.*).js$': './$1'
  },
  globals: { 
    'ts-jest': { 
      "tsconfig": "tsconfig.test.json"
    },
  },
};
