/**
 * Jest Configuration for MindBoost Backend
 */

export default {
    // The test environment that will be used for testing
    testEnvironment: 'node',

    // The root directory that Jest should scan for tests and modules within
    rootDir: './scripts',

    // Match test files with .test.js or .spec.js extension
    testMatch: [
        '**/*.test.js',
        '**/*.spec.js'
    ],

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: '../coverage',

    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/coverage/'
    ],

    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: [
        'node_modules'
    ],

    // An array of file extensions your modules use
    moduleFileExtensions: [
        'js',
        'json',
        'node'
    ],

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },

    // The paths to modules that run some code to configure or set up the testing environment before each test
    setupFiles: [
        'dotenv/config'
    ],

    // The test environment will be initialized with the contents of this file
    setupFilesAfterEnv: [],

    // The glob patterns Jest uses to detect test files
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],

    // Indicates whether each individual test should be reported during the run
    verbose: true
};