
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

 
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native'
      + '|@react-native'
      + '|react-clone-referenced-element'
      + '|react-native-.*'
      + '|expo(nent)?'
      + '|@expo(nent)?/.*'
      + '|expo-.*'
      + '|expo-router'
      + '|expo-modules-core'
      + '|@expo/.*'
      + '|@react-navigation/.*'
      + ')',
  ],

  
  testMatch: [
    '**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}',
    '**/*.{test,spec}.{ts,tsx,js,jsx}',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  moduleNameMapper: {
    
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    
    '^@/(.*)$': '<rootDir>/$1',
  },
};
