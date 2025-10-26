// auth.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, AppState } from 'react-native';
import Auth from '../../components/Auth';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

// Mocks
jest.mock('../../lib/supabase');
jest.mock('expo-router');

// Mock AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

describe('Auth Component - Extended Critical Tests (6 total)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock supabase.auth.getSession to return no session by default
    (supabase.auth as any).getSession = jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Mock startAutoRefresh and stopAutoRefresh
    (supabase.auth as any).startAutoRefresh = jest.fn();
    (supabase.auth as any).stopAutoRefresh = jest.fn();
  });

  // ✅ 1. Component Rendering (default sign-in form)
  it('renders the sign-in form by default', () => {
    const { getByText, getByPlaceholderText } = render(<Auth />);

    expect(getByText('Sign In to Kitchi')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByPlaceholderText('email@address.com')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  // ✅ 2. Sign In Success
  it('signs in and navigates when valid credentials are provided', async () => {
    const signInMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.auth as any).signInWithPassword = signInMock;

    const { getByPlaceholderText, getByText } = render(<Auth />);

    fireEvent.changeText(getByPlaceholderText('email@address.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/explore');
    });
  });

  // ✅ 3. Input State Management
  it('updates email and password states on input change', () => {
    const { getByPlaceholderText } = render(<Auth />);

    const emailInput = getByPlaceholderText('email@address.com');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'newemail@test.com');
    fireEvent.changeText(passwordInput, 'newpassword');

    expect(emailInput.props.value).toBe('newemail@test.com');
    expect(passwordInput.props.value).toBe('newpassword');
  });

  // ✅ 4. Toggle to Sign Up screen
  it('toggles to the sign-up form when link is pressed', () => {
    const { getByText } = render(<Auth />);

    fireEvent.press(getByText('New to Kitchi? Sign Up!'));

    expect(getByText('Create your Kitchi Account')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Already have an account? Sign In')).toBeTruthy();
  });

  // ✅ 5. Password input is secure (secureTextEntry)
  it('ensures password input is secured', () => {
    const { getByPlaceholderText } = render(<Auth />);
    const passwordInput = getByPlaceholderText('Password');

    // secureTextEntry is how RN masks passwords
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});