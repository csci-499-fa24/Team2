const jestConfig = require('../jest.config');

describe('Jest Configuration', () => {
  it('should have the correct rootDir', () => {
    expect(jestConfig.rootDir).toBe('.');
  });

  it('should automatically clear mock calls and instances', () => {
    expect(jestConfig.clearMocks).toBe(true);
    expect(jestConfig.resetMocks).toBe(true);
  });

  it('should have the correct module name mappings', () => {
    expect(jestConfig.moduleNameMapper).toEqual({
      '^./firebaseAdminKey$': '<rootDir>/__mocks__/firebaseAdminKey.js',
      '^firebase-admin$': '<rootDir>/__mocks__/firebaseAdmin.js',
    });
  });

  it('should have the correct test environment', () => {
    expect(jestConfig.testEnvironment).toBe('node');
  });

  it('should have correct coverage configuration', () => {
    expect(jestConfig.collectCoverage).toBe(true);
    expect(jestConfig.coverageDirectory).toBe('coverage');
    expect(jestConfig.collectCoverageFrom).toEqual([
      '**/*.js',
      '!**/node_modules/**',
      '!**/coverage/**',
    ]);
    expect(jestConfig.coverageThreshold).toEqual({
      global: {
        functions: 0,
        lines: 0,
        statements: 0,
      },
    });
  });
});
