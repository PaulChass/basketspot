import { StyleSheet, Button, View, TextInput, Switch } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import i18n from 'i18next';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import Storage from '@/utils/storage'; // Import storage utility
export default function TabTwoScreen() {
  const { t } = useTranslation(); // Initialize translations
  const [isPresenceDetectionAllowed, setIsPresenceDetectionAllowed] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await Storage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };

    loadUsername();
  }, []);

  
const handleUsernameChange = async (text) => {
  setUsername(text);
  try {
    await Storage.setItem('username', text);
    console.log('Username saved:', text);
  } catch (error) {
    console.error('Error saving username:', error);
  }
};

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const togglePresenceDetection = (value) => {
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
});