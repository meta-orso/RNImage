import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  Linking,
  useWindowDimensions,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Slider from '@react-native-community/slider';
import {useCameraPermission} from 'react-native-vision-camera';

interface CroppedImageProps {
  cropHeight: number;
  cropWidth: number;
  uri: string;
  width: number;
  height: number;
}

const CroppedImage = ({
  cropHeight,
  cropWidth,
  uri,
  width,
  height,
}: CroppedImageProps) => (
  <View
    style={{
      overflow: 'hidden',
      height: cropHeight || 0,
      width: cropWidth || 0,
      backgroundColor: 'transparent',
    }}>
    <Image
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: width || 0,
        height: height || 0,
      }}
      source={{uri}}
      resizeMode="cover"
    />
  </View>
);

const App = () => {
  const initialPosition = 0;
  const defaultThumbWidth = 3;

  const {hasPermission, requestPermission} = useCameraPermission();
  const {height: screenHeight, width: screenWidth} = useWindowDimensions();

  const [value, setValue] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [cropWidth, setCropWidth] = useState(
    imageWidth * initialPosition + defaultThumbWidth / 2,
  );
  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string }>>([]);

  useEffect(() => {
    console.log(selectedImages);
    if (selectedImages.length > 0) {
      Image.getSize(selectedImages[0].uri, (width, height) => {
        setImageWidth(width > screenWidth ? 300 : width);
        setImageHeight(height > screenHeight ? 400 : height);
        setCropWidth(width * initialPosition + defaultThumbWidth / 2);
      });
    }
  }, [selectedImages]);

  const onSelectPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 2,
    });
    if (result.assets && result.assets?.length > 0) {
      const imageUris = result.assets.map((asset) => ({ uri: asset.uri }));
      setSelectedImages(imageUris);
    }
  };

  const onMakePhoto = async (type: 'first' | 'second') => {
    const result = await launchCamera({
      mediaType: 'photo',
    });

    if (result.assets && result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      if (!imageUri) return
      if (type === 'first') {
        setSelectedImages([{ uri: imageUri }, selectedImages[1]])
        return;
      }
      console.log('First?', selectedImages[0]);
      setSelectedImages([selectedImages[0], { uri: imageUri }]);
    }
  };

  const onSliderChange = (sliderValue: number) => {
    const newValue = (sliderValue * 100 * imageWidth) / 100;
    setValue(Math.floor(newValue));
    setCropWidth(newValue + defaultThumbWidth / 2);
  };

  const onRequestCameraPermission = useCallback(async () => {
    if (!hasPermission) {
      const permission = requestPermission();
      if (!permission) {
        await Linking.openSettings();
      }
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {!hasPermission ? (
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => onRequestCameraPermission()}
              style={styles.button}>
              <Text style={styles.text}>Give Permissions</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.button} onPress={() => onSelectPhoto()}>
                <Text style={styles.text}>Select Photo's</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => onMakePhoto('first')}>
                <Text style={styles.text}>Make First Photo</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => onMakePhoto('second')}>
                <Text style={styles.text}>Make Second Photo</Text>
              </Pressable>
            </View>
            {selectedImages.length > 0 && (
              <View style={styles.imagesContainer}>
                <ImageBackground
                  source={{uri: selectedImages[0]?.uri || ''}}
                  resizeMode="cover"
                  style={[
                    {
                      width: imageWidth,
                      height: imageHeight,
                    },
                    styles.backgroundImage,
                  ]}>
                  {value && selectedImages[1].uri ? (
                    <CroppedImage
                      uri={selectedImages[1].uri}
                      cropWidth={cropWidth}
                      cropHeight={imageHeight}
                      width={imageWidth}
                      height={imageHeight}
                    />
                  ) : null}
                </ImageBackground>
              </View>
            )}
            {selectedImages.length > 1 && (
              <Slider
                minimumValue={0}
                value={value}
                onValueChange={slideValue => onSliderChange(slideValue)}
                minimumTrackTintColor="#ccc"
                maximumTrackTintColor="blue"
                thumbTintColor="#04AA6D"
                style={styles.sliderContainer}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    height: 50,
    width: 150,
    backgroundColor: '#04AA6D',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  imagesContainer: {
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
  },
  backgroundImage: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  image: {
    height: 400,
    borderRadius: 10,
  },
  topImage: {
    position: 'absolute',
  },
  sliderContainer: {
    marginTop: 16,
    width: '100%',
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  overlayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'red', // Change the color as needed
  },
});

export default App;
