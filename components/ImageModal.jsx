import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'

const ImageModal = ({ visible, imageUri, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType= 'slide'
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Image */}
        <Image
          source={imageUri}
          style={styles.image}
          contentFit='contain'
        />
      </View>
    </Modal>
  )
}

export default ImageModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeButton: {
    position: 'absolute',
    top: hp(3),
    right: hp(2),
    zIndex: 10,
    padding: 10,
    borderRadius: 50,
  },
  
  closeText: {
    marginTop: 50,
    fontSize: hp(2),
    color: 'white',
    fontWeight: 'bold',
  },
  
  image: {
    width: wp(100),
    height: '100%',
  }
})
