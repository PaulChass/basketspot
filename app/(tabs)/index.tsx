import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, TextInput, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc , getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useTranslation } from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useGeolocation } from '@/hooks/useGeolocation';
import _, { set } from 'lodash';
import Storage from '@/utils/storage';  
import SelectAvatar from '@/components/SelectAvatar';


export default function TerrainListScreen() {
  const { t } = useTranslation();
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [terrainName, setTerrainName] = useState('');
  const router = useRouter();
  const { location, calculateDistance } = useGeolocation();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null); 
  const [usernameInput, setUsernameInput] = useState('');
  const borderColorAnimation = useRef(new Animated.Value(0)).current;
 


  
  interface Terrain {
    id: string;
    name: string;
    location: [number ,number ] | null;
    distance: number | null;
    wanted: string;
    playersCount: number;
  }

  interface Player {
    id: string;
    name: string;
    status: string;
    avatar?: string;
  }

 
   // Retrieve username from AsyncStorage when the component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUsername = await Storage.getItem('username');
        const storedAvatar = await Storage.getItem('avatar');
        const storedUserId = await Storage.getItem('userId');
        if (storedUsername) {
          setUsername(storedUsername);
        }
        if (storedAvatar) {
          setAvatar(storedAvatar);
        }
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser;
  }, []);

  

  const handleUsernameChange = async (text: string) => {
    setUsername(text);
    try {
      await Storage.setItem('username', text);
      console.log('Username saved:', text);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  const handleAvatarSelect = async (selectedAvatar: string) => {
    setAvatar(selectedAvatar);
    await Storage.setItem('avatar', selectedAvatar);
  };

  useEffect(() => {
    // Fetch terrains from Firestore
    const unsubscribe = onSnapshot(collection(db, 'terrains'), (snapshot) => {
      const fetchedTerrains = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ||null,
          location: data.location ||null,
        };
      });
      setTerrains(fetchedTerrains as Terrain[]);
    });
    return () => unsubscribe();
  }, []);

  const locationIsInRange = async (distance: number, terrain: Terrain) => {    
    if (distance === null) {
      return;
    }
    if (distance <= 2) {
      const randomDelay = Math.floor(Math.random() * 4000) + 1000; 
      await new Promise((resolve) => setTimeout(resolve, randomDelay));
      const terrainRef = doc(db, 'terrains', terrain.id);
      const playersSnapshot = await getDocs(collection(db, `terrains/${terrain.id}/players`));
      const fetchedPlayers = playersSnapshot.docs.map(doc => ({ ...doc.data() }));
      const playerExists = fetchedPlayers.some(player => player.id === userId); 
      if (!playerExists && username !== '') {
        await addDoc(collection(db, `terrains/${terrain.id}/players`), {
          id: userId,
          name: username,
          status: 'present',
          avatar: avatar,
        } as Player);
        const playersCount = fetchedPlayers.length;
        await updateDoc(terrainRef, {
          playersCount: playersCount + 1,
        });
      }
    
    } else {
      const terrainRef = doc(db, 'terrains', terrain.id);
      const randomDelay = Math.floor(Math.random() * 4000) + 1000; 
      await new Promise((resolve) => setTimeout(resolve, randomDelay));
      const playersSnapshot = await getDocs(collection(db, `terrains/${terrain.id}/players`));
      const fetchedPlayers = playersSnapshot.docs.map(doc => ({ id:doc.id ,...doc.data()  }as Player));
      const playerExists = fetchedPlayers.some(player => player.name === username); // Replace with  user ID
      if (playerExists) {
        await updateDoc(terrainRef, {
          playersCount: Math.max(0, fetchedPlayers.length - 1),
        });
        const playerDoc = fetchedPlayers.find(player => player.name === username); // Replace with user ID
        if (playerDoc) {
          await deleteDoc(doc(db, `terrains/${terrain.id}/players`, playerDoc.id)); // Delete the player document
        }
        console.log('User removed from the terrain players list:', terrain.name);
      }

    }
  }



  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'terrains'), (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const terrain: Terrain = { id: doc.id, ...doc.data() } as Terrain;

        if (terrain.location && location?.coords) {
          const distance = calculateDistance(location.coords, terrain.location);
          terrain.distance = distance;
          locationIsInRange(distance, terrain); 
        } else {
          terrain.distance = null;
        }

        setTerrains((prevTerrains) => {
          const updatedTerrains = [...prevTerrains];
          const index = updatedTerrains.findIndex((t) => t.id === terrain.id);
          if (index !== -1) {
            updatedTerrains[index] = terrain;
          } else {
            updatedTerrains.push(terrain);
          }
          return updatedTerrains.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        });
      });
    });

    return () => unsubscribe();
  }, [location]);
 
 

  const handleCreateTerrain = async () => {
    if (!terrainName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le terrain.');
      return;
    }

    try {
      const newTerrain = {
        name: terrainName,
        position: [location?.coords.latitude, location?.coords.longitude],
        players: 0,
        location: {
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,
        },
      };
      await addDoc(collection(db, 'terrains'), newTerrain);
      setTerrainName(''); // Réinitialise le champ de saisie
      Alert.alert('Succès', 'Le terrain a été créé avec succès !');
    } catch (error) {
      console.error('Error creating terrain:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du terrain.');
    }
  };

  const isFuture = (dateString: string, currentDate: Date) => {
    const date = new Date(dateString);
    return date > currentDate;
  };


  useEffect(() => {
    // Start the border color animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderColorAnimation, {
          toValue: 1,
          duration: 1000, // 1 second to transition to red
          useNativeDriver: false,
        }),
        Animated.timing(borderColorAnimation, {
          toValue: 0,
          duration: 1000, // 1 second to transition back to white
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [borderColorAnimation]);

  // Interpolate the border color from white to red
  const interpolatedBorderColor = borderColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', 'red'], // From white to red
  });

 if(username === '') {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={t('usernamePlaceholder')}
        placeholderTextColor={'grey'}
        value={usernameInput}
        onChangeText={setUsernameInput}
        style={styles.input}
      />
      <SelectAvatar
          avatar={avatar}
          onAvatarSelect={handleAvatarSelect}
        />
        <View style={{ margin: 10 }}>
          </View>
       
      <Button title={t('save')} onPress={() => handleUsernameChange(usernameInput)}  />
    </View>
  );
}


 if ( terrains.length === 0) {
  return (
    <View style={styles.container}>
      <Text>{t('loading')}</Text>
    </View>
  );
}

return (
  <View style={styles.container}>
    <ThemedText style={styles.title}>{t('availableCourts')}</ThemedText>
    <FlatList
      data={terrains}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Animated.View
          style={[
            styles.terrainItem,
            isFuture(item.wanted, new Date()) 
             && { borderColor: interpolatedBorderColor, borderWidth: 4 },
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push(`/terrain/${item.id}`)}
          >
        
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}
              {isFuture(item.wanted, new Date()) && (
                 '-' +
                 t('playersWanted')
              )}
              </Text>
              <View style={styles.row}>
                <FontAwesome name="users" size={16} color="#555" />
                <Text style={styles.details}>
                  {item.playersCount > 1 && t('playersPresent_plural', { count: item.playersCount })}
                  {item.playersCount <= 1 && t('playersPresent', { count: item.playersCount })}
                </Text>
              </View>
              <View style={styles.row}>
                <FontAwesome name="map-marker" size={16} color="#555" />
                <Text style={styles.details}>
                  {item.distance}
                  {item.distance && ' km'}
                </Text>
              </View>
            </View>
            <Text style={styles.link}>{t('view')}</Text>
          </View>
          </TouchableOpacity>
        </Animated.View>

)}
    />
    <View style={{ margin: 40 }}>
      <TextInput
        placeholder={t('courtNamePlaceholder')}
        placeholderTextColor={'grey'}
        value={terrainName}
        onChangeText={setTerrainName}
        style={styles.input}
      />
      <Button title={t('addCourt')} onPress={handleCreateTerrain} />
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 32 },
  terrainItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  terrainItemWanted: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderColor: 'rgba(180, 0, 0, 1)',
    borderWidth: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center',width: '100%' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  details: { fontSize: 14, color: '#555', marginLeft: 4 },
  link: { color: '#007AFF', fontWeight: 'bold', position: 'absolute', right: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
    color: 'grey',
  },
});