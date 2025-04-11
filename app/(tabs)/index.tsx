import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc , getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useTranslation } from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useGeolocation } from '@/hooks/useGeolocation';
import _ from 'lodash';
import Storage from '@/utils/storage';  


export default function TerrainListScreen() {
  const { t } = useTranslation();
  const [terrains, setTerrains] = useState([]);
  const [terrainName, setTerrainName] = useState('');
  const router = useRouter();
  const { location, fetchLocation, watchLocation, calculateDistance } = useGeolocation();
  const [username, setUsername] = useState(''); // State for username
  const [usernameInput, setUsernameInput] = useState(''); // State for username input


   // Retrieve username from AsyncStorage when the component mounts
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

  useEffect(() => {
    fetchLocation(); 
    // Fetch terrains from Firestore
    const unsubscribe = onSnapshot(collection(db, 'terrains'), (snapshot) => {
      const fetchedTerrains = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTerrains(fetchedTerrains);
    });

    return () => unsubscribe();
  }, []);

  // Track user position and update Firestore
  useEffect(() => {
    let subscription;
    let debouncedTrackUserPosition;
     
    // Track user position and updates presences on terrains
    const trackUserPosition = async () => {
      subscription = await watchLocation(async (location) => {
        debouncedTrackUserPosition = _.debounce(async (location) => {
        terrains.forEach(async (terrain) => {
          if (!terrain.location) return; // Skip if no location
          const distance = calculateDistance(
            location.coords,
            terrain.location
          );

          if (distance <= 1) {
            // wait a random time between 1 and 5 seconds to avoid spamming the database
            const randomDelay = Math.floor(Math.random() * 4000) + 1000; // Random delay between 1 and 5 seconds
            await new Promise((resolve) => setTimeout(resolve, randomDelay));
            // Add user to the court's player list
            const terrainRef = doc(db, 'terrains', terrain.id);
            const playersSnapshot = await getDocs(collection(db, `terrains/${terrain.id}/players`));
            const fetchedPlayers = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const playerExists = fetchedPlayers.some(player => player.name === username); // Replace with actual user ID
            if (!playerExists) {
              // Add user to the players list
              await addDoc(collection(db, `terrains/${terrain.id}/players`), {
                name: username, // Replace with actual user name
                status: 'present',
              });

            
              // Get the players count
                const playersCount = fetchedPlayers.length;
              // update players count
              await updateDoc(terrainRef, {
                playersCount: playersCount + 1,
              });
            }
          } else {
            console.log('User is not within 5 km of the terrain:', terrain.name);
            // Remove user from the court's player list
            const terrainRef = doc(db, 'terrains', terrain.id);
            // wait a random time between 1 and 5 seconds to avoid spamming the database
            const randomDelay = Math.floor(Math.random() * 4000) + 1000; // Random delay between 1 and 5 seconds
            await new Promise((resolve) => setTimeout(resolve, randomDelay));
            const playersSnapshot = await getDocs(collection(db, `terrains/${terrain.id}/players`));
            const fetchedPlayers = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const playerExists = fetchedPlayers.some(player => player.name === username); // Replace with actual user ID
            if (playerExists) {
              // Remove user from the players count
              await updateDoc(terrainRef, {
                playersCount: Math.max(0, fetchedPlayers.length - 1),
              });
              // Remove user from the players list
              const playerDoc = fetchedPlayers.find(player => player.name === username); // Replace with actual user ID
              if (playerDoc) {
                await deleteDoc(doc(db, `terrains/${terrain.id}/players`, playerDoc.id));
              }
              console.log('User removed from the terrain players list:', terrain.name);
            }

          }
        }, 1000); // Debounce for 1 second
        });
      });
    };

    trackUserPosition();
    return ;
  }, [terrains]);
  

  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'terrains'), (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const terrain = { id: doc.id, ...doc.data() };

        // Calculate distance if location is available
        if (terrain.location && location?.coords) {
          const distance = calculateDistance(location.coords, terrain.location);
          terrain.distance = distance;
        } else {
          terrain.distance = null;
        }

        // Add terrain to state
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
      <Button title={t('saveUsername')} onPress={() => handleUsernameChange(usernameInput)} />
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
        <TouchableOpacity
          style={styles.terrainItem}
          onPress={() => router.push(`/terrain/${item.id}`)}
        >
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
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