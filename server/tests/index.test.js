'use strict';

const Sequelize = require('sequelize');
const fs = require('fs');

jest.mock('../config/config.js', () => {
    console.log('Mocked config:', {
        development: {
            use_env_variable: 'TEST_DB_URL',
        },
        production: {
            use_env_variable: 'TEST_DB_URL',
        }
    });
    return {
        development: {
            use_env_variable: 'TEST_DB_URL',
        },
        production: {
            use_env_variable: 'TEST_DB_URL', 
        },
    };
});
  

jest.mock('sequelize', () => {
    const SequelizeMock = jest.fn((url, config) => {
        console.log(`Sequelize constructor called with: ${url}`, config);
        return {
            authenticate: jest.fn().mockResolvedValue(true), // Simulate successful DB connection
        };
    });
    return SequelizeMock;
});

describe('models/index.js', () => {
    let db;

    beforeEach(() => {
        jest.resetModules(); // Clear module cache
        jest.spyOn(fs, 'readdirSync').mockReturnValue([]); // Mock to avoid actual file reads
    });

    afterEach(() => {
        delete process.env.TEST_DB_URL;
        jest.restoreAllMocks();
    });

    test('initializes Sequelize using environment variable when NODE_ENV is not set', () => {
        delete process.env.NODE_ENV; 
        process.env.TEST_DB_URL = 'test-database-url';

        db = require('../models/index'); 

        expect(require('sequelize')).toHaveBeenCalledWith('test-database-url', expect.any(Object));
        expect(db.sequelize).toBeTruthy();
        expect(db.sequelize.authenticate).toBeDefined();
    });

    test('initializes Sequelize using environment variable when NODE_ENV is set to "development"', () => {
        process.env.NODE_ENV = 'development'; 
        process.env.TEST_DB_URL = 'test-database-url';

        db = require('../models/index');

        expect(require('sequelize')).toHaveBeenCalledWith('test-database-url', expect.any(Object));
        expect(db.sequelize).toBeTruthy();
        expect(db.sequelize.authenticate).toBeDefined();
    });

    test('initializes Sequelize using default environment when NODE_ENV is set to a different value', () => {
        process.env.NODE_ENV = 'production';
        process.env.TEST_DB_URL = 'test-database-url';

        db = require('../models/index'); 

        expect(require('sequelize')).toHaveBeenCalledWith('test-database-url', expect.any(Object));
        expect(db.sequelize).toBeTruthy();
        expect(db.sequelize.authenticate).toBeDefined();
    });
});
