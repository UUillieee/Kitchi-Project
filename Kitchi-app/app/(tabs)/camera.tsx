//Import required React Native and Expo components
import { StyleSheet, Text, View, SafeAreaView, Button, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera'; //camera component + hook for permissions
import { shareAsync } from 'expo-sharing'; //share images with other apps
import * as MediaLibrary from 'expo-media-library'; //save photos to device storage
import { useEffect, useRef, useState } from 'react';

//main camera screen component
export default function CameraScreen() {
  //reference to CameraView component so can call methods like takePictureAsync
  const cameraRef = useRef<CameraView | null>(null);

  //camera permission state + function to request permission
  const [permission, requestPermission] = useCameraPermissions();

  //media library permission state
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean>(false);

  //state to store the captured photo, null if no photo taken yet
  const [photo, setPhoto] = useState<any>(null);

  //request Media Library permission on mount (to save photos later)
  useEffect(() => {
    (async () => {
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })();
  }, []);

  //Permission state is not loaded yet
  if (!permission) {
    return <Text>Requesting permissions...</Text>;
  }

  //user denied camera permissions
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Permission for camera not granted.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </SafeAreaView>
    );
  }

  //function to take a picture using the camera
  const takePic = async () => {
    if (!cameraRef.current) return; //ensure ref is valid
    const options = { quality: 1, base64: false, exif: false };
    const newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto); //save photo to state
  };

  //function to share the photo
  const sharePic = () => {
    shareAsync(photo.uri).then(() => setPhoto(null)); // After sharing, reset photo state
  };

  //function to save photo to media library
  const savePhoto = () => {
    MediaLibrary.saveToLibraryAsync(photo.uri).then(() => setPhoto(null)); // After saving, reset photo state
  };

  //if a photo has been taken, show preview screen
  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Show the photo that was taken */}
        <Image style={styles.preview} source={{ uri: photo.uri }} /> 
        {/* Show buttons for actions: Share / Use / Discard */}
        <View style={styles.buttonContainer}>
          <Button title="Share" onPress={sharePic} />
          {hasMediaLibraryPermission ? <Button title="Use" onPress={savePhoto} /> : null}
          <Button title="Discard" onPress={() => setPhoto(null)} />
        </View>
      </SafeAreaView>
    );
  }

  //default camera screen (before taking photo)
  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} ref={cameraRef}>
        {/* Overlay button inside camera preview */}
        <View style={styles.buttonOverlay}>
          <Button title="Take Photo" onPress={takePic} />
        </View>
      </CameraView>
      <StatusBar style="auto" />
    </View>
  );
}

//styles
const styles = StyleSheet.create({
  container: {
    flex: 1, //fill screen
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1, //camera takes whole screen
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end', //content goes to bottom of camera preview
  },
  buttonContainer: {
  flexDirection: 'row',       // Arrange children in a row
  justifyContent: 'space-around', // Space buttons evenly
  alignItems: 'center',
  padding: 10,
  width: '100%',              // Span full width
  position: 'absolute',       // Stick to bottom
  bottom: 83,                 // Offset from screen bottom
  backgroundColor: 'rgba(255,255,255,0.8)', // Light background for visibility
 },
  preview: {
    alignSelf: 'stretch',
    flex: 1, //preview photo fills screen
  },
  buttonOverlay: {
    position: 'absolute', 
    bottom: 100, 
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)', 
    borderRadius: 10,
    padding: 10,
  }
});

