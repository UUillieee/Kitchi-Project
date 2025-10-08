// index.tsx

import { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, Platform } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

import * as Notifications from 'expo-notifications';          // NEW
import * as Application from 'expo-application';              // NEW

import Auth from '../../components/Auth';
import Account from '../../components/Account';
import Dashboard from '../../components/Dashboard';

// Import the Kitchi business logo image asset
const businessLogo = require('../../assets/images/logo.png');

/**
 * Index component - Main entry point and authentication router for the app
 * Handles session management and determines which screen to display based on auth state
 * - Shows Account component for authenticated users
 * - Shows Auth component (login/signup) for unauthenticated users
 */
export default function Index() {
  // State to track the current user's authentication session
  const [session, setSession] = useState<Session | null>(null);

  /**
   * Effect hook to initialize and monitor authentication state
   */
  useEffect(() => {
    // Get the current session when component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (sign in, sign out, token refresh, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe(); // cleanup
    };
  }, []);

  /**
   * PUSH TOKEN UPSERT
   * When a user logs in (session.user.id exists), register for notifications,
   * get the Expo push token, and upsert it to public.user_devices.
   */
  useEffect(() => {
    const upsertPushToken = async () => {
      if (!session?.user?.id) return;

      // Ask for notification permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Notifications disabled', 'Enable notifications to receive expiry alerts.');
        return;
      }

      // Android channel (required for heads-up)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      // Get the Expo push token
      // (If your project requires it, you can pass { projectId: '<your-expo-project-id>' })
      const expoToken = (await Notifications.getExpoPushTokenAsync()).data;

      // Stable device id per install (best-effort)
      const deviceId =
        Platform.OS === 'android'
          ? (Application.androidId ?? expoToken)
          : (await Application.getIosIdForVendorAsync()) ?? expoToken;

      // Upsert into user_devices (RLS should allow user to manage their own rows)
      const { error } = await supabase.from('user_devices').upsert(
        {
          user_id: session.user.id,
          device_id: deviceId,
          expo_token: expoToken,
          platform: Platform.OS,
          app_version: Application.nativeApplicationVersion ?? undefined,
          last_active: new Date().toISOString(),
        },
        { onConflict: 'user_id,device_id' }
      );

      if (error) {
        console.warn('Failed to upsert push token', error);
      } else {
        console.log('Expo push token upserted 👍');
      }
    };

    upsertPushToken();
  }, [session?.user?.id]);

  // If user is authenticated, show Account
  if (session && session.user) {
    return <Account key={session.user.id} session={session} />;
  }

  // Default render for unauthenticated users
  return (
    <View style={styles.container}>
      {/* Logo display section - positioned at top center */}
      <View style={styles.logoContainer}>
        <Image source={businessLogo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Authentication content section - Auth component for login/signup */}
      <View style={styles.content}>
        <Auth />
        {/* <Dashboard /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container - full screen with padding
  container: {
    flex: 1,
    padding: 20,
  },
  // Logo container - centers logo horizontally with top spacing
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 0,
  },
  // Logo styling - square dimensions for business logo
  logo: {
    width: 200,
    height: 200,
  },
  // Content area - takes remaining space and centers Auth component
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
