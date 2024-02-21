import {Pressable, Text, View, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
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
});

interface CustomButtonProps {
  onPress: () => void;
  title: string;
}

const CustomButton = ({onPress, title}: CustomButtonProps) => (
  <View style={styles.buttonContainer}>
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  </View>
);

export default CustomButton;
