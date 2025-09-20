module.exports = function (api) {
  if (api && api.cache) api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    plugins: ['react-native-reanimated/plugin'], 
  };
};