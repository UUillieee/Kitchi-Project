import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, Image, TextInput } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import * as Application from 'expo-application';
import { Platform } from 'react-native';


// Import the Kitchi logo image asset
const businessLogo = require('../../assets/images/logo.png');

export default function Explore() {
        
  const [ingredient, setIngredient] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  //get device id to remove device from push notification list on sign out
  async function getDeviceId() {
  if (Platform.OS === 'android') return Application.androidId ?? 'unknown';
  try {
    const iosId = await Application.getIosIdForVendorAsync();
    return iosId ?? 'unknown';
  } catch {
    return 'unknown';
  }
  }
  
  /**
   * Handles user sign out functionality
   * - Calls Supabase auth signOut method
   * - Shows error alert if sign out fails
   * - Redirects to auth screen (/) on successful sign out
   */

  async function handleSignOut() {
  // capture user + device first (session will be cleared after signOut)
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const deviceId = await getDeviceId();

    try {
      if (userId) {
        //remove this device’s token so the server can’t send notifications to it
        console.log("Deregistering device for push notifications:", deviceId);
        const { error: delErr } = await supabase
          .from('user_devices')
          .delete()
          .eq('user_id', userId)
          .eq('device_id', deviceId);

        if (delErr) console.warn('Failed to deregister device token:', delErr);
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Sign Out Failed', error.message);
      } else {
        router.replace('/');
      }
    }
    catch (e: any) {
      Alert.alert('Sign Out Failed', e?.message ?? String(e));
    }
  }

  async function handleManualSubmit() {
    if (!ingredient || !expiryDate) {
      Alert.alert('Missing Fields', 'Please fill in both fields.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Not Logged In', 'Please sign in first.');
        return;
      }

      // Fetch the full_name from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Insert into pantry_items with full_name
      const { error } = await supabase
        .from('pantry_items')
        .insert([
          {
            user_id: user.id,
            food_name: ingredient,
            expiry_date: expiryDate,
            full_name: profileData?.full_name,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Ingredient added to your pantry!');
      setIngredient('');
      setExpiryDate('');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', String(error));
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={businessLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome to your Kitchi Profile</Text>

        <View style={styles.buttonContainer}>
          <Button 
            title="Access Camera for Photo of Food" 
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

        {/* Manual Entry Section (stacked vertically) */}
        <View style={styles.manualEntryContainer}>
          <Text style={styles.label}>Manually enter ingredient</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Apples"
            value={ingredient}
            onChangeText={setIngredient}
          />

          <Text style={[styles.label, { marginTop: 15 }]}>Enter expiry date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={expiryDate}
            onChangeText={setExpiryDate}
          />

          <Button
            title="Submit Ingredient"
            onPress={handleManualSubmit}
            buttonStyle={styles.submitButton}
            titleStyle={{ fontWeight: 'bold' }}
          />
        </View>
      </View>

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
  manualEntryContainer: {
    width: '80%',
    marginTop: 30,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    borderRadius: 8,
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