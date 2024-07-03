import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SuccessPopup = ({ isVisible, onClose, isDarkMode }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkModeBackground]}>
      <Modal
        transparent={true}
        animationType="slide"
        visible={isVisible}
        onRequestClose={() => onClose()}>
        <View style={[styles.successPopup, isDarkMode && styles.darkModePopup]}>
          <Icon
            name="check"
            size={40}
            color={isDarkMode ? 'lightgreen' : 'green'}
          />
        </View>
        <Text
          style={[styles.successText, { color: isDarkMode ? '#fff' : 'black' }]}>
          Successfully registered!
        </Text>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection:"row-reverse",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successPopup: {
    position: 'absolute',
    top: '40.3%',
    width: '100%',
    padding: 10,
    paddingLeft: 23,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  darkModePopup: {
    backgroundColor: '#333',
  },
  successText: {
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft: '18%',
    paddingTop: 15,
    top: '40%',
  },
});

export default SuccessPopup;
