import { StyleSheet, Text, View, SafeAreaView, Button, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';

export default function CameraScreen() {
  const cameraRef = useRef<Camera | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<null | boolean>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<null | boolean>(null);
  const [photo, setPhoto] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === 'granted');
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })();
  }, []);

  // show loading while we haven't checked permissions yet
  if (hasCameraPermission === null) {
    return <Text>Requesting permissions...</Text>;
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>;
  }

  const takePic = async () => {
    if (!cameraRef.current) return;
    const options = { quality: 1, base64: false, exif: false };
    const newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  const sharePic = () => {
    shareAsync(photo.uri).then(() => setPhoto(null));
  };

  const savePhoto = () => {
    MediaLibrary.saveToLibraryAsync(photo.uri).then(() => setPhoto(null));
  };

  // Show preview if a photo was taken
  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <View style={styles.buttonContainer}>
          <Button title="Share" onPress={sharePic} />
          {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : null}
          <Button title="Discard" onPress={() => setPhoto(null)} />
        </View>
      </SafeAreaView>
    );
  }

  // Otherwise show the camera
  return (
    <Camera style={styles.container} ref={cameraRef} >
      <View style={styles.buttonContainer}>
        <Button title="Take Photo" onPress={takePic} />
      </View>
      <StatusBar style="auto" />
    </Camera>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1,
  },
});
