module.exports = {
  displayName: 'Integration Tests',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/**/*.integration.test.{js,ts}',
    '<rootDir>/**/*.integration.spec.{js,ts}'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/setup.ts'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../apps/web/src/$1',
    '^@neurallog/(.*)$': '<rootDir>/../../packages/$1/src'
  },
  testTimeout: 30000,
  maxWorkers: 1,
  globalSetup: '<rootDir>/global-setup.ts',
  globalTeardown: '<rootDir>/global-teardown.ts',
  collectCoverageFrom: [
    '../../apps/**/*.{js,ts,tsx}',
    '../../packages/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true
};
