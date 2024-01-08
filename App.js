import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Platform } from 'react-native'
import { useState, useRef } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { captureRef } from 'react-native-view-shot'

import domtoimage from 'dom-to-image'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'

import CircleButton from './components/CircleButton'
import IconButton from './components/IconButton'
import EmojiPicker from './components/EmojiPicker'
import EmojiList from './components/EmojiList'
import EmojiSticker from './components/EmojiSticker'
import ImageViewer from './ImageViewer'
import Button from './Button'

const placeholder = require('./assets/images/background-image.png')

export default function App() {
  const [status, requestPermission] = MediaLibrary.usePermissions()
  const [selectedImage, setSelectedImage] = useState(null)
  const [showAppOptions, setShowAppOptions] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pickedEmoji, setPickedEmoji] = useState(null)

  if (status === null) {
    requestPermission()
  }

  const imageRef = useRef()

  const onReset = () => {
    setShowAppOptions(false)
  }

  const onAddSticker = () => {
    setIsModalVisible(true)
  }

  const onModalClose = () => {
    setIsModalVisible(false)
  }

  const onSaveImageAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1
        })

        await MediaLibrary.saveToLibraryAsync(localUri)
        if (localUri) {
          alert('Image saved successfully')
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440
        })

        let link = document.createElement('a')
        link.download = 'sticker-smash.jpeg'
        link.href = dataUrl
        link.click()
      } catch (e) {
        console.log(e)
      }
    }
  }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
      setShowAppOptions(true)
    } else {
      console.log('You cancelled image picker.')
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer
            placeholderImageSource={placeholder}
            selectedImage={selectedImage}
          />
          {pickedEmoji ? (
            <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
          ) : null}
        </View>
      </View>

      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList
          onSelect={setPickedEmoji}
          onCloseModal={onModalClose}
        ></EmojiList>
      </EmojiPicker>

      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionRow}>
            <IconButton
              icon="refresh"
              label="reset"
              onPress={onReset}
            ></IconButton>
            <CircleButton onPress={onAddSticker}></CircleButton>
            <IconButton
              icon="save-alt"
              label="Save"
              onPress={onSaveImageAsync}
            ></IconButton>
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button
            theme="primary"
            label="Choose a photo"
            onPress={pickImageAsync}
          />
          <Button
            label="Use this photo"
            onPress={() => setShowAppOptions(true)}
          />
        </View>
      )}

      <StatusBar style="light" />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center'
  },
  imageContainer: {
    flex: 1,
    paddingTop: 50
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center'
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row'
  }
})
