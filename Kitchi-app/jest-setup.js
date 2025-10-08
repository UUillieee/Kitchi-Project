import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';


// --------------------
// React Native Core Mocks
// --------------------
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock(
  'react-native/Libraries/Components/ProgressBarAndroid/ProgressBarAndroid',
  () => 'ProgressBarAndroid'
);

jest.mock(
  'react-native/Libraries/Components/SafeAreaView/SafeAreaView',
  () => 'SafeAreaView'
);

jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({})),
  get: jest.fn(() => ({})),
}));

jest.mock('react-native/Libraries/AppState/AppState', () => ({
  addEventListener: jest.fn((event, handler) => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
  currentState: 'active',
}));

// --------------------
// Expo Mocks
// --------------------
jest.mock('expo-dev-menu', () => ({}));
jest.mock('expo-dev-menu-interface', () => ({}));
jest.mock('expo-constants', () => ({
  expoConfig: { name: 'test', slug: 'test' },
}));
jest.mock('expo-asset', () => ({
  Asset: { fromModule: jest.fn(() => ({ uri: 'test' })) },
}));

// --------------------
// React Native Reanimated
// --------------------
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
global.__reanimatedWorkletInit = () => {}; // no-op

// --------------------
// AsyncStorage
// --------------------
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// --------------------
// Expo Router
// --------------------
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// --------------------
// Supabase Client
// --------------------
jest.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      upsert: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

// --------------------
// UI Library Mocks (@rneui/themed)
// --------------------
jest.mock('@rneui/themed', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    Button: (props) =>
      React.createElement(
        RN.TouchableOpacity,
        {
          onPress: props.onPress,
          disabled: props.disabled,
          accessibilityLabel: props.title,
          testID: props.testID,
        },
        React.createElement(RN.Text, {}, props.title)
      ),
    Input: (props) =>
      React.createElement(RN.TextInput, {
        value: props.value,
        onChangeText: props.onChangeText,
        editable: !props.disabled,
        accessibilityLabel: props.label,
        placeholder: props.placeholder,
        secureTextEntry: props.secureTextEntry,
        testID: props.testID,
      }),
    CheckBox: 'CheckBox',
    Avatar: 'Avatar',
    Card: 'Card',
    ListItem: 'ListItem',
  };
});

// --------------------
// Vector Icons
// --------------------
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Ionicons: 'Ionicons',
}));

jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// --------------------
// Silence console warnings/errors for RN deprecated stuff
// --------------------
jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
  if (
    message?.includes('ProgressBarAndroid') ||
    message?.includes('SafeAreaView') ||
    message?.includes('Clipboard')
  ) {
    return;
  }
  console.warn(message, ...args);
});

jest.spyOn(console, 'error').mockImplementation(() => {});
