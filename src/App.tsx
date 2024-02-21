import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
  useWindowDimensions,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Slider from '@react-native-community/slider';
import {useCameraPermission} from 'react-native-vision-camera';

import CroppedImage from './components/CroppedImage';
import CustomButton from './components/CustomButton';

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
      if (!imageUri) return;
      setValue(0);
      if (type === 'first') {
        setSelectedImages([{ uri: imageUri }, selectedImages[1]])
        return;
      }
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
          <CustomButton
            onPress={onRequestCameraPermission}
            title="Give Permissions"
          />
        ) : (
          <View>
            <CustomButton onPress={onSelectPhoto} title="Select Photo's" />
            <CustomButton
              onPress={() => onMakePhoto('first')}
              title="Make First Photo"
            />
            <CustomButton
              onPress={() => onMakePhoto('second')}
              title="Make Second Photo"
            />
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
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
});

export default App;
