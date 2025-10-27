//Import necessary React hooks and Expo libraries
import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device"; //Used to detect if the app is running on a real device
import * as Notifications from "expo-notifications"; //Used for push notification handling
import Constants from "expo-constants"; //Used to access Expo project configuration (e.g., project ID)
import { Platform } from "react-native"; //Used to detect the platform (iOS/Android)

//Define a TypeScript interface for the state that holds the notification and push token
export interface PushNotificationState {
  notification?: Notifications.Notification; //Stores the last received notification
  expoPushToken?: Notifications.ExpoPushToken; //Stores the Expo push token for this device
}

//Custom React hook that manages push notifications
export const usePushNotifications = (): PushNotificationState => {

  //Set up how notifications should behave when received while the app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false, //Disable sound on incoming notification
      shouldSetBadge: false,  //Disable badge update on app icon
      shouldShowAlert: true,  //Allow visual alerts to show
    }),
  });

  //State to hold the Expo push token (used for sending push notifications)
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  //State to hold the most recent notification received
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  //References to notification listener subscriptions so they can be cleaned up later
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  //Function that requests permission and registers the device for push notifications
  async function registerForPushNotificationsAsync() {
    let token;

    //Only physical devices can receive push notifications (not emulators/simulators)
    if (Device.isDevice) {
      //Check existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      //If permission not already granted, request it from the user
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If still not granted, alert the user and stop registration
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      //Get the Expo push token associated with this project
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId, //Required for EAS projects
      });

      //Android-specific notification settings
      if (Platform.OS === 'android') {
        //Create a default notification channel with high importance
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C', //Custom LED color for notifications
        });
      }

      //Return the generated push token
      return token;
    } else {
      //Push notifications don’t work on simulators
      console.log("Error: Must use physical device for Push Notifications");
    }
  }

  //React effect that runs once when the component mounts
  useEffect(() => {
    // Register the device and save the push token
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    //Listener: triggered when a notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification); //Save the received notification to state
    });

    //Listener: triggered when a user interacts with a notification (e.g., taps it)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response); // Log notification interaction details
    });

    //Cleanup function that removes listeners when the component unmounts
    return () => {
  if (notificationListener.current) {
    Notifications.removeNotificationSubscription(notificationListener.current);
    }
  if (responseListener.current) {
    Notifications.removeNotificationSubscription(responseListener.current);
    }
  };
  }, []);

  //Return the current push token and last notification for use in components
  return {
    expoPushToken,
    notification,
  };
};
