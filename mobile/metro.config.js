const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js modules
config.resolver.alias = {
  ...config.resolver.alias,
  buffer: require.resolve('buffer'),
};

config.resolver.fallback = {
  ...config.resolver.fallback,
  buffer: require.resolve('buffer'),
};

module.exports = config;