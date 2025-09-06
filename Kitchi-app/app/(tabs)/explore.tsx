import { View, StyleSheet, Text, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

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
      <Text style={styles.title}>Welcome to your Kitchi Profile</Text>

      <View style={styles.buttonContainer}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
