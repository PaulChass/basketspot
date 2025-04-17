import { StyleSheet, Button, View, TextInput, Switch } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import i18n from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SelectAvatar from '@/components/SelectAvatar';
import { useProfile } from '@/hooks/useProfile';

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const { username, avatar, updateUsername, updateAvatar } = useProfile();
  const [isPresenceDetectionAllowed, setIsPresenceDetectionAllowed] = useState(true);

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
            onChangeText={updateUsername}
          />
        </ThemedView>
        <View style={styles.container}>
          <SelectAvatar avatar={avatar} onAvatarSelect={updateAvatar} />
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
});