import { StyleSheet, Text, View, SafeAreaView, Button, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean>(false);
  const [photo, setPhoto] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })();
  }, []);

  if (!permission) {
    // permission state not loaded yet
    return <Text>Requesting permissions...</Text>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Permission for camera not granted.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </SafeAreaView>
    );
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

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <Button title="Take Photo" onPress={takePic} />
        </View>
      </CameraView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1,
  },
});
//let myCamera: typeof CameraView; // Error if Camera is a value (e.g., a React component)