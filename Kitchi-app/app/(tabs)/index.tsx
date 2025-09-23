//index.tsx

import { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

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
   * - Gets the current session on component mount
   * - Sets up listener for authentication state changes (login/logout)
   * - Updates session state whenever auth state changes
   */
  useEffect(() => {
    // Get the current session when component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (sign in, sign out, token refresh, etc.)
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  /**
   * Conditional rendering based on authentication state
   * If user is authenticated (has valid session), show Account component
   * The key prop ensures component re-renders when user changes
   */
  if (session && session.user) {
    return <Account key={session.user.id} session={session} />;
  }

  /**
   * Default render for unauthenticated users
   * Shows the app logo at top and authentication form below
   */
  return (
    <View style={styles.container}>
      {/* Logo display section - positioned at top center */}
      <View style={styles.logoContainer}>
        <Image source={businessLogo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Authentication content section - Auth component for login/signup */}
      <View style={styles.content}>
        <Auth />
        {/* Dashboard component commented out - likely for future use */}
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
    alignItems: 'center',   // Center horizontally
    marginTop: 80,          // Push down from status bar
    marginBottom: 0,        // No bottom margin to allow content below
  },
  // Logo styling - square dimensions for business logo
  logo: {
    width: 200,             // Fixed width for consistent display
    height: 200,            // Square aspect ratio
  },
  // Content area - takes remaining space and centers Auth component
  content: {
    flex: 1,
    justifyContent: 'center', // Center Auth component vertically in remaining space
  },
});