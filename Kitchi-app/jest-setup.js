import { jest } from '@jest/globals';
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// --- AsyncStorage ---
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// --- Reanimated mock ---
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
global.__reanimatedWorkletInit = () => {}; // worklet init no-op

// --- React Native Safe Area Context ---
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// --- Native Modules ---
jest.mock('expo-modules-core', () => ({
  NativeModule: jest.fn(),
  EventEmitter: jest.fn(),
  requireNativeModule: jest.fn(() => ({})),
}));


// --- Expo Router ---
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
}));

// --- Expo Constants ---
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'test',
    slug: 'test',
  },
}));

// --- Expo Asset ---
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({ uri: 'test' })),
  },
}));

// --- Expo Vector Icons ---
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Ionicons: 'Ionicons',
}));