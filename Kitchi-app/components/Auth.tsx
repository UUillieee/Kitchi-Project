import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { router } from 'expo-router';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Extra fields for sign up
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

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

  async function signUpWithDetails() {
    if (!email?.trim() || !password?.trim()) {
      Alert.alert('Missing details', 'Please enter an email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1) Create auth user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signUp({ email: email.trim(), password: password.trim() });

      if (authError) throw authError;
      if (!user) throw new Error('User could not be created.');

      // 2) Build a safe username (required + unique)
      const baseFromEmail =
        email?.trim()?.split('@')?.[0]?.replace(/[^a-zA-Z0-9_]/g, '')?.slice(0, 20) || 'user';
      let safeUsername = (username?.trim() || baseFromEmail || 'user') || 'user';
      if (safeUsername.length < 3) safeUsername = `${safeUsername}${Math.floor(Math.random() * 1000)}`;

      // Helper to attempt an upsert
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

      // Try once, retry with suffix if duplicate username
      let dbError = await upsertProfile(safeUsername);
      if (dbError && (dbError as any).code === '23505') {
        const retryUsername = `${safeUsername}_${Math.floor(Math.random() * 10000)}`;
        dbError = await upsertProfile(retryUsername);
        if (!dbError) safeUsername = retryUsername;
      }

      if (dbError) throw dbError;

      Alert.alert('Success', 'Your account has been created successfully!');
      router.replace('/(tabs)/explore');
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'signin' ? 'Sign In to Kitchi' : 'Create your Kitchi Account'}
      </Text>

      {/* Email */}
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="email@address.com"
        leftIcon={{ type: 'font-awesome', name: 'envelope' }}
      />

      {/* Password */}
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
      />

      {/* Extra fields in Sign Up */}
      {mode === 'signup' && (
        <>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
          />
        </>
      )}

      <Button
        title={mode === 'signin' ? 'Sign In' : 'Sign Up'}
        disabled={loading}
        onPress={mode === 'signin' ? signInWithEmail : signUpWithDetails}
        containerStyle={styles.button}
      />

      <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={styles.toggleText}>
          {mode === 'signin' ? 'New to Kitchi? Sign Up!' : 'Already have an account? Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
  },
  toggleText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
  },
});
