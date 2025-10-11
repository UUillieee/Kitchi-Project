import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, AppState } from 'react-native'; // import AppState
import Auth from '../../components/Auth';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('../../lib/supabase');
jest.mock('expo-router');


describe('Auth Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render sign in form by default', () => {
      const { getByText, getByPlaceholderText } = render(<Auth />);

      expect(getByText('Sign In to Kitchi')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
      expect(getByPlaceholderText('email@address.com')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('should toggle to sign up form when toggle link is pressed', () => {
      const { getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));

      expect(getByText('Create your Kitchi Account')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
      expect(getByText('Already have an account? Sign In')).toBeTruthy();
    });

    it('should show additional fields in sign up mode', () => {
      const { getByText, getByPlaceholderText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));

      expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
      expect(getByPlaceholderText('Choose a username')).toBeTruthy();
    });

    it('should toggle back to sign in from sign up', () => {
      const { getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.press(getByText('Already have an account? Sign In'));

      expect(getByText('Sign In to Kitchi')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });
  });

  describe('Sign In Functionality', () => {
    it('should call signInWithPassword with correct credentials', async () => {
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
      });
    });

    it('should navigate to explore tab on successful sign in', async () => {
      (supabase.auth as any).signInWithPassword = jest.fn().mockResolvedValue({ error: null });

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/(tabs)/explore');
      });
    });

    it('should show error alert when sign in fails', async () => {
      const errorMessage = 'Invalid credentials';
      (supabase.auth as any).signInWithPassword = jest
        .fn()
        .mockResolvedValue({ error: { message: errorMessage } });

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Sign In Failed', errorMessage);
      });
    });
  });

  describe('Sign Up Functionality', () => {
    beforeEach(() => {
      (supabase.auth as any).signUp = jest.fn().mockResolvedValue({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });
    });

    it('should validate required fields before sign up', async () => {
      const { getByText, getByPlaceholderText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Missing details',
          'Please enter an email and password.'
        );
      });
    });

    it('should call signUp with trimmed email and password', async () => {
      const signUpMock = jest.fn().mockResolvedValue({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });
      (supabase.auth as any).signUp = signUpMock;

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.changeText(getByPlaceholderText('email@address.com'), '  test@example.com  ');
      fireEvent.changeText(getByPlaceholderText('Password'), '  password123  ');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(signUpMock).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should create profile with user-provided username', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Choose a username'), 'myusername');
      fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'Test User');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(upsertMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'new-user-id',
            username: 'myusername',
            full_name: 'Test User',
            email: 'test@example.com',
          }),
          { onConflict: 'id' }
        );
      });
    });

    it('should generate username from email if none provided', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'john.doe@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(upsertMock).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'johndoe',
          }),
          { onConflict: 'id' }
        );
      });
    });

    it('should handle username conflict with retry', async () => {
      const upsertMock = jest
        .fn()
        .mockResolvedValueOnce({ error: { code: '23505' } })
        .mockResolvedValueOnce({ error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Choose a username'), 'duplicate');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(upsertMock).toHaveBeenCalledTimes(2);
        expect(upsertMock.mock.calls[1][0].username).toMatch(/^duplicate_\d+$/);
      });
    });

    it('should show success alert and navigate after successful sign up', async () => {
      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Your account has been created successfully!'
        );
        expect(router.replace).toHaveBeenCalledWith('/(tabs)/explore');
      });
    });

    it('should show error alert when sign up fails', async () => {
      const errorMessage = 'Email already exists';
      (supabase.auth as any).signUp = jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage },
      });

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'existing@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Sign Up Failed', errorMessage);
      });
    });

    it('should ensure minimum username length of 3 characters', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: upsertMock,
      });

      const { getByPlaceholderText, getByText } = render(<Auth />);

      fireEvent.press(getByText('New to Kitchi? Sign Up!'));
      fireEvent.changeText(getByPlaceholderText('email@address.com'), 'a@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Sign Up'));

      await waitFor(() => {
        expect(upsertMock).toHaveBeenCalledWith(
          expect.objectContaining({
            username: expect.stringMatching(/^a\d+$/),
          }),
          { onConflict: 'id' }
        );
      });
    });
  });

  describe('Input State Management', () => {
    it('should update email state when input changes', () => {
      const { getByPlaceholderText } = render(<Auth />);
      
      const emailInput = getByPlaceholderText('email@address.com');
      fireEvent.changeText(emailInput, 'newemail@test.com');
      
      expect(emailInput.props.value).toBe('newemail@test.com');
    });

    it('should update password state when input changes', () => {
      const { getByPlaceholderText } = render(<Auth />);
      
      const passwordInput = getByPlaceholderText('Password');
      fireEvent.changeText(passwordInput, 'newpassword');
      
      expect(passwordInput.props.value).toBe('newpassword');
    });
  });
});
