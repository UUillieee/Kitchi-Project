const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
  events: path.resolve(__dirname, 'node_modules/events-browserify'),
  crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
  http: path.resolve(__dirname, 'node_modules/stream-http'),
  https: path.resolve(__dirname, 'node_modules/https-browserify'),
  os: path.resolve(__dirname, 'node_modules/os-browserify/browser'),
  path: path.resolve(__dirname, 'node_modules/path-browserify'),
  process: path.resolve(__dirname, 'node_modules/process'),
  buffer: path.resolve(__dirname, 'node_modules/buffer'),
  util: path.resolve(__dirname, 'node_modules/util'),
};

module.exports = config;
