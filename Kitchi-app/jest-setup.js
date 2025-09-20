import { jest } from '@jest/globals';
import React from 'react';
import '@testing-library/jest-native/extend-expect';
// Mock React Native modules

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'test',
    slug: 'test',
  },
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({ uri: 'test' })),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler/jestSetup');
  return {
    ...actual,
    FlatList: jest.fn().mockImplementation((props) => {
      const RN = require('react-native');
      return <RN.FlatList {...props} />;
    }),
  };
});

// Global mocks
global.__reanimatedWorkletInit = jest.fn();