import { View, StyleSheet, Text, Alert, Image } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

//Kitchi logo
const businessLogo = require('../../assets/images/logo.png'); 

export default function Explore() {
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Failed', error.message);
    } else {
      router.replace('/'); // back to Auth screen
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo at the top */}
        <Image source={businessLogo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Welcome to your Kitchi Profile</Text>

        <View style={styles.buttonContainer}>
          <Button 
            title="Access Camera" 
            type="outline" 
            onPress={() => router.push('/camera')} 
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Access Pantry" 
            type="outline" 
            onPress={() => router.push('/pantry')} 
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Update Personal Details" 
            type="outline" 
            onPress={() => router.push('/')} 
          />
        </View>
      </View>

      {/* Sign Out at bottom */}
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
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginTop: 80, 
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 15,
    width: '80%',
  },
  signOutContainer: {
    width: '80%',
    marginBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
