import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  BarcodeScanningResult,
  CameraType,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false); // Track scan status
  const [barcode, setBarcode] = useState<string | null>(null); // Store the scanned barcode value

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function handleBarcodeScan(result: BarcodeScanningResult) {
    setBarcode(result.data); // Set the scanned barcode data
    setScanned(true); // Stop the camera
  }

  return (
    <ThemedView style={styles.container}>
      {scanned ? (
        <ThemedView style={styles.resultContainer}>
          <ThemedText style={styles.resultText}>
            Scanned Value: {barcode}
          </ThemedText>
          <Button
            title="Scan Again"
            onPress={() => {
              setScanned(false); // Reset scan status
              setBarcode(null); // Clear scanned data
            }}
          />
        </ThemedView>
      ) : (
        <CameraView
          style={styles.camera}
          facing={facing}
          enableTorch={false}
          onBarcodeScanned={handleBarcodeScan}
        >
          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </ThemedView>
        </CameraView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  resultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
