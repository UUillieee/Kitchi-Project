
import { jest } from '@jest/globals';

jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  __esModule: true,
  default: {
    UIManager: {}, 
    Linking: {},  
  },
}));

if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
if (typeof globalThis.self === 'undefined') globalThis.self = globalThis;
if (typeof globalThis.navigator === 'undefined') globalThis.navigator = { userAgent: 'node' };


try {
  if (typeof globalThis.document === 'undefined') {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.self = dom.window;
    globalThis.navigator = dom.window.navigator;
  }
} catch {}