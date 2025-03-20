import '@testing-library/jest-dom';
import './src/__mocks__/chrome';

const listeners = new Set();

global.chrome = {
    storage: {
        local: {
            get: jest.fn((keys, callback) => {
                const data = { tasks: [], selectedText: '' }; // Replace with mock data if needed
                callback(data);
            }),
            set: jest.fn((data, callback) => {
                callback && callback();
            }),
            remove: jest.fn((key, callback) => {
                callback && callback();
            }),
        },
        onChanged: {
            addListener: jest.fn((listener) => {
                listeners.add(listener);
            }),
            removeListener: jest.fn((listener) => {
                listeners.delete(listener);
            }),
        },
    },
};

