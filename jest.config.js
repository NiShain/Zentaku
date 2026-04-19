module.exports = {
  // Test environment
  testEnvironment: 'node',

  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  // Test file patterns
  testMatch: ['**/test/**/*.test.js', '**/__tests__/**/*.js'],

  // Reporters - output to console and file
  reporters: [
    'default',
    [
      './test/reporters/file-reporter.js',
      {
        outputFile: 'test/test-results/test-output.log',
      },
    ],
  ],

  // Coverage configuration
  collectCoverageFrom: ['src/**/*.js', '!src/generated/**', '!**/node_modules/**', '!**/test/**'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Verbose output
  verbose: true,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Timeout for tests
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
};
