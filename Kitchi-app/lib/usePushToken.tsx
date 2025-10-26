import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import * as Application from 'expo-application'
import { Platform, Alert } from 'react-native'
import { useEffect } from 'react'
import { supabase } from './supabase'

async function registerForPushNotificationsAsync() {
  //request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Permission required', 'Enable notifications in Settings to receive expiry alerts.')
    return null
  }

  //create android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  //get the Expo token
  const token = (await Notifications.getExpoPushTokenAsync()).data
  return token
}

export function usePushToken(sessionUserId?: string | null) {
  useEffect(() => {
    if (!sessionUserId) return

    ;(async () => {
      const token = await registerForPushNotificationsAsync()
      if (!token) return

      //A stable per-install id for device_id:
      //Application.androidId is null on iOS; Application.getIosIdForVendorAsync works on iOS.
      const deviceId =
        Platform.OS === 'android'
          ? (Application.androidId ?? token) // fallback to token
          : (await Application.getIosIdForVendorAsync()) ?? token

      const platform = Platform.OS
      const appVersion = Application.nativeApplicationVersion ?? undefined

      //Upsert into Supabase tied to this user
      const { error } = await supabase.from('user_devices').upsert(
        {
          user_id: sessionUserId,
          device_id: deviceId,
          expo_token: token,
          platform,
          app_version: appVersion,
          last_active: new Date().toISOString(),
        },
        { onConflict: 'user_id,device_id' }
      )
      if (error) {
        console.warn('Failed to upsert push token', error)
      }
    })()
  }, [sessionUserId])
}
