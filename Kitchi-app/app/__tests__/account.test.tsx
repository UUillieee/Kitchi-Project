import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Account from '../../components/Account';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('../../lib/supabase');
jest.mock('expo-router');

describe('Account Component', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  };

  const mockSupabaseResponse = {
    data: {
      username: 'testuser',
      full_name: 'Test User',
      email: 'test@example.com',
    },
    error: null,
    status: 200,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default Supabase mock chain
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(mockSupabaseResponse),
        }),
      }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  describe('Profile Loading', () => {
    it('should call getProfile when component mounts with valid session', async () => {
      render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('profiles');
      });
    });

    it('should populate form fields with retrieved profile data', async () => {
      const { getByDisplayValue } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(getByDisplayValue('test@example.com')).toBeTruthy();
        expect(getByDisplayValue('testuser')).toBeTruthy();
        expect(getByDisplayValue('Test User')).toBeTruthy();
      });
    });

    it('should handle 406 status (no profile found) without showing error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
              status: 406,
            }),
          }),
        }),
      });

      render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled();
      });

      // Wait a bit to ensure no alert was called
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should display error alert when database error occurs', async () => {
      const errorMessage = 'Database connection failed';
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error(errorMessage),
              status: 500,
            }),
          }),
        }),
      });

      render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should throw error when session has no user', async () => {
      const invalidSession = { user: null };

      render(<Account session={invalidSession as any} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('No user on the session!');
      });
    });

    it('should query profiles table with correct user ID', async () => {
      const eqMock = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(mockSupabaseResponse),
      });
      
      const selectMock = jest.fn().mockReturnValue({
        eq: eqMock,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(selectMock).toHaveBeenCalledWith('username, full_name, email');
        expect(eqMock).toHaveBeenCalledWith('id', 'test-user-id');
      });
    });
  });

  describe('Profile Update', () => {
    it('should send correct data structure to Supabase on update', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockSupabaseResponse),
          }),
        }),
        upsert: upsertMock,
      });

      const { getByLabelText } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(getByLabelText('Update')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Update'));

      await waitFor(() => {
        expect(upsertMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-user-id',
            username: 'testuser',
            full_name: 'Test User',
            updated_at: expect.any(Date),
          })
        );
      });
    });

    it('should show success alert and navigate after successful update', async () => {
      const { getByLabelText } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(getByLabelText('Update')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Update'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Profile Updated',
          'Your profile information has been saved.'
        );
        expect(router.replace).toHaveBeenCalledWith('/(tabs)/explore');
      });
    });

    it('should display error alert when update fails', async () => {
      const errorMessage = 'Update failed';
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockSupabaseResponse),
          }),
        }),
        upsert: jest.fn().mockResolvedValue({ error: new Error(errorMessage) }),
      });

      const { getByLabelText } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(getByLabelText('Update')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Update'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(errorMessage);
      });
    });
  });

  describe('Input State Management', () => {
    it('should update username state when input changes', async () => {
      const { getByLabelText } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        const usernameInput = getByLabelText('Username');
        expect(usernameInput).toBeTruthy();
      });

      const usernameInput = getByLabelText('Username');
      fireEvent.changeText(usernameInput, 'newusername');
      
      expect(usernameInput.props.value).toBe('newusername');
    });

    it('should update fullName state when input changes', async () => {
      const { getByLabelText } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        const fullNameInput = getByLabelText('Full Name');
        expect(fullNameInput).toBeTruthy();
      });

      const fullNameInput = getByLabelText('Full Name');
      fireEvent.changeText(fullNameInput, 'New Name');
      
      expect(fullNameInput.props.value).toBe('New Name');
    });

    it('should keep email field disabled', async () => {
      const { getByLabelText } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        const emailInput = getByLabelText('Email');
        expect(emailInput.props.editable).toBe(false);
      });
    });
  });

  describe('Sign Out', () => {
    it('should call supabase.auth.signOut when Sign Out button is pressed', async () => {
      const signOutMock = jest.fn();
      (supabase.auth as any).signOut = signOutMock;

      const { getByLabelText } = render(<Account session={mockSession as any} />);

      await waitFor(() => {
        expect(getByLabelText('Sign Out')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Sign Out'));

      expect(signOutMock).toHaveBeenCalled();
    });
  });
});