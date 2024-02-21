import {View, Image} from 'react-native';

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

export default CroppedImage;
