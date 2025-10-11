module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  testEnvironment: 'jsdom',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo-dev-menu$': '<rootDir>/app/__mocks__/emptyModule.js',
    '^expo-dev-menu-interface$': '<rootDir>/app/__mocks__/emptyModule.js',
    '^react-native/Libraries/TurboModule/TurboModuleRegistry$':
      '<rootDir>/app/__mocks__/emptyModule.js',
    '^react-native/Libraries/Components/ProgressBarAndroid/ProgressBarAndroid$':
      '<rootDir>/app/__mocks__/emptyModule.js',
    '^react-native/Libraries/Components/SafeAreaView/SafeAreaView$':
      '<rootDir>/app/__mocks__/emptyModule.js',
    '^react-native/Libraries/Components/Clipboard/Clipboard$':
      '<rootDir>/app/__mocks__/emptyModule.js',
  },

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(react-native|expo($|-.*)|react-native-responsive-screen|@react-native|expo|@expo|expo-router|@unimodules|unimodules|sentry-expo|native-base|react-navigation|@react-navigation|@expo-google-fonts|react-native-vector-icons|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|@react-native-community|@react-native-async-storage|expo-modules-core|@react-native-picker)/)',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],

  moduleNameMapper: {
  '^react-native/Libraries/TurboModule/TurboModuleRegistry$': '<rootDir>/app/__mocks__/TurboModuleRegistry.js',
  '^expo-dev-menu$': '<rootDir>/app/__mocks__/emptyModule.js',
  '^expo-dev-menu-interface$': '<rootDir>/app/__mocks__/emptyModule.js',
},

};
