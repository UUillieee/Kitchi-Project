import { View, StyleSheet, Text, Alert, Image } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

// Import the Kitchi logo image asset
const businessLogo = require('../../assets/images/logo.png');

/**
 * Explore component - Main profile/dashboard screen for the Kitchi app
 * Displays the app logo, welcome message, navigation buttons, and sign out functionality
 */
export default function Explore() {
  
  /**
   * Handles user sign out functionality
   * - Calls Supabase auth signOut method
   * - Shows error alert if sign out fails
   * - Redirects to auth screen (/) on successful sign out
   */
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Failed', error.message);
    } else {
      router.replace('/'); // Navigate back to Auth screen
    }
  }

  return (
    <View style={styles.container}>
      {/* Main content area with logo and navigation buttons */}
      <View style={styles.content}>
        {/* Display Kitchi logo at the top of the screen */}
        <Image 
          source={businessLogo} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        
        {/* Welcome title text */}
        <Text style={styles.title}>Welcome to your Kitchi Profile</Text>
        
        {/* Navigation button to camera screen */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Access Camera" 
            type="outline" 
            onPress={() => router.push('/camera')} 
          />
        </View>
        
        {/* Navigation button to pantry screen */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Access Pantry" 
            type="outline" 
            onPress={() => router.push('/pantry')} 
          />
        </View>
        
        {/* Navigation button to update personal details (routes to root) */}
        <View style={styles.buttonContainer}>
          <Button 
            title="Update Personal Details" 
            type="outline" 
            onPress={() => router.push('/')} 
          />
        </View>
      </View>

      {/* Sign out button positioned at the bottom of the screen */}
      <View style={styles.signOutContainer}>
        <Button 
          title="Sign Out" 
          onPress={handleSignOut}
          buttonStyle={styles.signOutButton}
          titleStyle={styles.signOutText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container - full height with space-between layout
  container: {
    flex: 1,
    justifyContent: 'space-between', // Positions content at top and sign out at bottom
    alignItems: 'center',
    padding: 20,
  },
  // Content wrapper for main elements (logo, title, buttons)
  content: {
    width: '100%',
    alignItems: 'center',
  },
  // Logo styling - square image with margins
  logo: {
    width: 200,
    height: 200,
    marginTop: 80,
    marginBottom: 20,
  },
  // Welcome title styling
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  // Container for each navigation button with consistent spacing
  buttonContainer: {
    marginTop: 15,
    width: '80%',
  },
  // Container for sign out button at bottom
  signOutContainer: {
    width: '80%',
    marginBottom: 40,
  },
  // Sign out button custom styling - blue background
  signOutButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  // Sign out button text styling - white and bold
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});