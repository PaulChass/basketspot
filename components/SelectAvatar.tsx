import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, Image, Button, StyleSheet, Platform } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { predefinedAvatars } from '@/utils/avatars'; // Import your predefined avatars
import { use } from 'i18next';


interface SelectAvatarProps {
  avatar: string | null;
  onAvatarSelect: (selectedAvatar: string) => void;
}


const SelectAvatar: React.FC<SelectAvatarProps> = ({ avatar,  onAvatarSelect }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [avatars, setAvatars] = useState<string[]>([]);

  const handleAvatarSelect = (selectedAvatar: string) => {
    onAvatarSelect(selectedAvatar);
    setIsModalVisible(false);
  };

  useEffect(() => {
    const avatars = predefinedAvatars; // Load your predefined avatars from a file or API
    setAvatars(avatars);
    }
    , []);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        {avatar ? (
          Platform.OS === 'web' ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <SvgUri uri={avatar} width={80} height={80} style={styles.avatarOption} />
          )
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Button title="Select Avatar" onPress={() => setIsModalVisible(true)} />
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <FlatList
          data={avatars}
          keyExtractor={(item, index) => index.toString()}
          numColumns={4}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
              {Platform.OS === 'web' ? (
                <Image source={{ uri: item }} style={styles.avatarOption} />
              ) : (
                <SvgUri uri={item} width={80} height={80} style={styles.avatarOption} />
              )}
            </TouchableOpacity>
          )}
        />
        <Button title="Close" onPress={() => setIsModalVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
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

export default SelectAvatar;