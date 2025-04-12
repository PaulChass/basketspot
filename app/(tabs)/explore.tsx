import { StyleSheet, Button, View, TextInput, Switch, Image, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import i18n from 'i18next';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Storage from '@/utils/storage';
import * as ImagePicker from 'expo-image-picker'; 
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { predefinedAvatars } from '@/utils/avatars'; // Import your predefined avatars


export default function TabTwoScreen() {
  const { t } = useTranslation();
  const [isPresenceDetectionAllowed, setIsPresenceDetectionAllowed] = useState(true);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const storage = getStorage();
  const db = getFirestore();

 

  // Charger le nom d'utilisateur et l'avatar depuis AsyncStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUsername = await Storage.getItem('username');
        const storedAvatar = await Storage.getItem('avatar');
        // If you want to load the avatar from Firebase Storage, you can do that here as well.
        // const avatarRef = ref(storage, `avatars/${storedAvatar}`);
        // const url = await getDownloadURL(avatarRef);        
        if (storedUsername) setUsername(storedUsername);
        if (storedAvatar) setAvatar(storedAvatar);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  // Sauvegarder le nom d'utilisateur dans AsyncStorage
  const handleUsernameChange = async (text: string) => {
    setUsername(text);
    try {
      await Storage.setItem('username', text);
      // Save the username to Firestore
      const userDocRef = doc(db, 'users', 'userId'); // Replace 'userId' with the actual user ID
      await setDoc(userDocRef, { username: text }, { merge: true });
      console.log('Username saved:', text);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  
  const handleAvatarSelect = async (selectedAvatar: string) => {
    setAvatar(selectedAvatar);
    setIsModalVisible(false);
  
    // Save the avatar URL to AsyncStorage
    await Storage.setItem('avatar', selectedAvatar);

  
    console.log('Avatar selected and saved:', selectedAvatar);
  };
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const togglePresenceDetection = (value: boolean) => {
    setIsPresenceDetectionAllowed(value);
    console.log(t('presenceDetectionAllowed'), value);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('explore')}</ThemedText>
      </ThemedView>
      <Button title="FR" onPress={() => changeLanguage('fr')} />
      <Button title="EN" onPress={() => changeLanguage('en')} />
      <Button title="ES" onPress={() => changeLanguage('es')} />
      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <ThemedText>{t('allowPresenceDetection')}</ThemedText>
          <Switch
            value={isPresenceDetectionAllowed}
            onValueChange={togglePresenceDetection}
          />
        </View>
        <ThemedView style={styles.settingItem}>
          <ThemedText>{t('username')}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t('enterUsername')}
            value={username}
            onChangeText={handleUsernameChange}
          />
        </ThemedView>
        <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Button title="Select Avatar" onPress={() => setIsModalVisible(true)} />
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <FlatList
          data={predefinedAvatars}
          keyExtractor={(item, index) => index.toString()}
          numColumns={8}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
              <Image source={{ uri: item }} style={styles.avatarOption} />
            </TouchableOpacity>
          )}
        />
        <Button title="Close" onPress={() => setIsModalVisible(false)} />
      </Modal>
    </View>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginLeft: 16,
    color: 'grey',
  },
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
  },
});