module.exports = {
    testEnvironment: 'jsdom', // Simulate a browser environment
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Setup script for RTL matchers
    globals: {
        'NODE_ENV': 'test',
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    },
    // Add coverage configuration
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['lcov', 'text', 'text-summary'],
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/tests/**',
        '!**/node_modules/**',
        '!src/index.js',
    ],
    // starting coverage thresholds can be changed later
    coverageThreshold: {
        global: {
            statements: 0,
            branches: 0,
            functions: 0,
            lines: 0,
        },
    },
};