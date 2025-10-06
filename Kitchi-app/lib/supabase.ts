// Polyfills required for Supabase in React Native
// These make `URL`, `crypto`, and `fetch` APIs available globally
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// AsyncStorage is used to persist user sessions (e.g., logged-in state)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase client creation
import { createClient } from '@supabase/supabase-js';

// Supabase project URL - unique identifier for your Supabase instance
const supabaseUrl = "https://zxrhffopuknrbqqvqrtq.supabase.co";

// Supabase anonymous key - public key for client-side authentication
// Do NOT expose service role keys in your client code
// This key allows read access to public tables and user registration/login
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cmhmZm9wdWtucmJxcXZxcnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDg1NTIsImV4cCI6MjA3MTcyNDU1Mn0.h4c8At87SBNbAIz8Fet6YfH6Td0bteLo3S-F4VdOmkg";

/**
 * Creates and configures the Supabase client for the React Native application
 * This client handles all database operations, authentication, and real-time subscriptions
 * 
 * Configuration options:
 * - storage: Uses AsyncStorage for persisting auth tokens across app sessions
 * - autoRefreshToken: Automatically refreshes expired auth tokens
 * - persistSession: Maintains user login state between app restarts
 * - detectSessionInUrl: Disabled for React Native (used for web OAuth redirects)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage to persist authentication tokens locally on device
    storage: AsyncStorage,
    
    // Automatically refresh expired JWT tokens to maintain user sessions
    autoRefreshToken: true,
    
    // Keep user logged in between app launches by saving session data
    persistSession: true,
    
    // Disable URL-based session detection (not needed for React Native apps)
    detectSessionInUrl: false,
  },
  global: {
    // Optional: custom header for tracking requests from Expo client
    headers: { 'x-client-info': 'expo' },
  },
});
