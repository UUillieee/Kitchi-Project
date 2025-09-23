import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';

/**
 * Account component - User profile management screen
 * Allows authenticated users to view and update their profile information
 * @param session - The current user's authentication session from Supabase
 */
export default function Account({ session }: { session: Session }) {
  // Loading state to show spinner during API operations
  const [loading, setLoading] = useState(true);
  // User profile data states - editable fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  /**
   * Effect hook to load user profile data when component mounts or session changes
   * Automatically fetches profile information when a valid session is available
   */
  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  /**
   * Fetches the current user's profile data from the database
   * - Validates session exists and contains user data
   * - Queries profiles table using the authenticated user's ID
   * - Populates form fields with retrieved data
   * - Handles both database errors and missing profile cases (406 status)
   */
  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      // Query the profiles table for current user's data
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, full_name, email`)
        .eq('id', session?.user.id)
        .single();

      // Handle errors (but ignore 406 which means no profile found)
      if (error && status !== 406) {
        throw error;
      }

      // Populate form fields if profile data exists
      if (data) {
        setUsername(data.username);
        setFullName(data.full_name);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Updates the user's profile information in the database
   * - Validates session exists and contains user data
   * - Performs upsert operation (insert or update) on profiles table
   * - Updates username, full_name, and updated_at timestamp
   * - Shows success message and navigates to explore screen
   * @param username - The new username to save
   * @param fullName - The new full name to save
   */
  async function updateProfile({
    username,
    fullName,
  }: {
    username: string;
    fullName: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      // Prepare update object with user ID and new data
      const updates = {
        id: session?.user.id,
        username,
        full_name: fullName,
        updated_at: new Date(),
      };

      // Perform upsert operation (creates new record or updates existing)
      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      
      // Show success message and navigate to main app
      Alert.alert('Profile Updated', 'Your profile information has been saved.');
      router.replace('/(tabs)/explore');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Email field - read-only, displays current user's email */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input 
          label="Email" 
          value={session?.user?.email || ''} 
          disabled 
        />
      </View>
      
      {/* Username field - editable, bound to username state */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username || ''}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      
      {/* Full Name field - editable, bound to fullName state */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Full Name"
          value={fullName || ''}
          onChangeText={(text) => setFullName(text)}
        />
      </View>

      {/* Update profile button - calls updateProfile with current form values */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, fullName })}
          disabled={loading}
        />
      </View>

      {/* Sign out button - immediately signs user out via Supabase auth */}
      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container with top margin and padding
  container: {
    marginTop: 40,
    padding: 12,
  },
  // Common spacing for form elements
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  // Additional top margin for specific elements
  mt20: {
    marginTop: 20,
  },
});