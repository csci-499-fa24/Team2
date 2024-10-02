// server/jest.config.js
module.exports = {
    // Specify the root directory of your project.
    rootDir: '.',

    // Automatically clear mock calls and instances between every test.
    clearMocks: true,

    // The test environment that will be used for testing.
    testEnvironment: 'node',

    // Glob patterns Jest uses to detect test files.
    testMatch: ['**/tests/**/*.test.js'], // Look for test files in the 'tests' folder

    // Directories to ignore during testing.
    testPathIgnorePatterns: ['/node_modules/'],

    // A list of reporter names that Jest uses when writing coverage reports.
    coverageReporters: ['json-summary', 'clover', 'json', 'lcov', 'text'],

    // Directory where Jest should output its coverage files.
    coverageDirectory: 'coverage',

    // Collect coverage information.
    collectCoverage: true,

    // Patterns to collect coverage from.
    collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/coverage/**'],

    // It won't fail a check for now even with 0% coverage. This gives time for team members to comply
    coverageThreshold: {
        global: {
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },

    // Transform settings if you're using Babel or TypeScript.
    // Uncomment and adjust the following if necessary.
    // transform: {
    //   '^.+\\.jsx?$': 'babel-jest',
    // },
};
