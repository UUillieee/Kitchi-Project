import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { router } from 'expo-router';

/**
 * AppState listener to manage Supabase auth token refresh
 * - Starts auto-refresh when app becomes active to keep auth tokens valid
 * - Stops auto-refresh when app goes to background to save resources
 
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
*/

/**
 * Auth component - Handles user authentication (sign in and sign up)
 * Provides a dual-mode form that switches between sign in and sign up flows
 */
export default function Auth() {
  // State to toggle between 'signin' and 'signup' modes
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  // Loading state to disable form during API calls
  const [loading, setLoading] = useState(false);

  // Shared authentication fields for both sign in and sign up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Additional fields required only for sign up
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  /**
   * Handles user sign in with email and password
   * - Calls Supabase auth signInWithPassword method
   * - Shows error alert if authentication fails
   * - Navigates to explore tab on successful sign in
   */
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      router.replace('/(tabs)/explore');
    }
    setLoading(false);
  }

  /**
   * Handles user sign up with full account creation
   * - Validates required fields (email and password)
   * - Creates new auth user with Supabase
   * - Generates safe username from email if none provided
   * - Creates user profile in profiles table with username uniqueness handling
   * - Handles duplicate username conflicts with automatic retry
   * - Shows success message and navigates to explore tab
   */
  async function signUpWithDetails() {
    // Validate required fields
    if (!email?.trim() || !password?.trim()) {
      Alert.alert('Missing details', 'Please enter an email and password.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create authentication user in Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signUp({ email: email.trim(), password: password.trim() });

      if (authError) throw authError;
      if (!user) throw new Error('User could not be created.');

      // Step 2: Generate a safe username for the profile
      // Extract base username from email (before @ symbol)
      const baseFromEmail =
        email?.trim()?.split('@')?.[0]?.replace(/[^a-zA-Z0-9_]/g, '')?.slice(0, 20) || 'user';
      let safeUsername = (username?.trim() || baseFromEmail || 'user') || 'user';
      // Ensure minimum length of 3 characters
      if (safeUsername.length < 3) safeUsername = `${safeUsername}${Math.floor(Math.random() * 1000)}`;

      /**
       * Helper function to attempt profile creation/update in database
       * Uses upsert to handle both new profiles and updates
       * @param uname - Username to attempt to save
       * @returns Database error if operation fails, null if successful
       */
      const upsertProfile = async (uname: string) => {
        const { error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              username: uname,
              full_name: fullName?.trim() || null,
              email: email.trim(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        return error;
      };

      // Step 3: Attempt to create profile, handle username conflicts
      let dbError = await upsertProfile(safeUsername);
      // If username already exists (unique constraint violation), retry with suffix
      if (dbError && (dbError as any).code === '23505') {
        const retryUsername = `${safeUsername}_${Math.floor(Math.random() * 10000)}`;
        dbError = await upsertProfile(retryUsername);
        if (!dbError) safeUsername = retryUsername;
      }

      if (dbError) throw dbError;

      // Step 4: Show success and navigate to main app
      Alert.alert('Success', 'Your account has been created successfully!');
      router.replace('/(tabs)/explore');
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  // ⚠️ CRITICAL FIX: Move useEffect hooks BEFORE the return statement
  // Check if user is already signed in when Auth screen mounts
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/(tabs)/explore'); // Redirect if logged in
        }
      } catch (error) {
        // Silently handle errors in test environment
        console.error('Session check error:', error);
      }
    }
    checkSession();
  }, []);

  // AppState listener for auth token refresh
  useEffect(() => {
    // Guard against test environment where AppState might not be fully available
    if (!AppState?.addEventListener) {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Dynamic title based on current mode */}
      <Text style={styles.title}>
        {mode === 'signin' ? 'Sign In to Kitchi' : 'Create your Kitchi Account'}
      </Text>

      {/* Email input field - used in both modes */}
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="email@address.com"
        leftIcon={{ type: 'font-awesome', name: 'envelope' }}
        inputContainerStyle={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 55, // control height here
        width: '100%',
        }}
      />

      {/* Password input field - used in both modes */}
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
        inputContainerStyle={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 55, // control height here
        width: '100%',
        }}
      />

      {/* Additional fields shown only in sign up mode */}
      {mode === 'signup' && (
        <>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            inputContainerStyle={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 55, // control height here
            width: '100%',
            }}
          />
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            inputContainerStyle={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 55, // control height here
            width: '100%',
            }}
          />
        </>
      )}

      {/* Main action button - text and function change based on mode */}
      <Button
        title={mode === 'signin' ? 'Sign In' : 'Sign Up'}
        disabled={loading}
        onPress={mode === 'signin' ? signInWithEmail : signUpWithDetails}
        containerStyle={styles.button}
      />

      {/* Toggle link to switch between sign in and sign up modes */}
      <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={styles.toggleText}>
          {mode === 'signin' ? 'New to Kitchi? Sign Up!' : 'Already have an account? Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container with top margin and padding
  container: {
    marginTop: 50,
    padding: 12,
  },
  // Title styling - centered and prominent
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Button container styling with top margin
  button: {
    marginTop: 12,
  },
  // Toggle text styling - blue color and centered
  toggleText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
  },
});