import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, FlatList, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import translations
import { increment, updateDoc, onSnapshot } from 'firebase/firestore'; // Import increment function
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for icons

export default function TerrainDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation(); // Hook for translations
  const [playername, setPlayerName] = useState('');
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState('');
  const [players, setPlayers] = useState([]);
  const [courtName, setCourtName] = useState(''); // State for court name

  // Fetch players from Firestore
  const fetchPlayers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, `terrains/${id}/players`));
      const fetchedPlayers = [];
      querySnapshot.forEach((doc) => {
        fetchedPlayers.push({ id: doc.id, ...doc.data() });
      });
      setPlayers(fetchedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Watch the players collection for changes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, `terrains/${id}/players`), (snapshot) => {
      const updatedPlayers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(updatedPlayers);
    });
    return () => unsubscribe();
  }
, [id]);

  const handleAddNow = async () => {
    try {
      const newPlayer = {
        name: playername === '' ? 'anon' : playername,
        status: 'present',
      };
  
      const docRef = await addDoc(collection(db, `terrains/${id}/players`), newPlayer);

      setPlayers([...players, { id: docRef.id, ...newPlayer }]);
      setPlayerName('');

      const terrainRef = doc(db, 'terrains', id);
      await updateDoc(terrainRef, {
        playersCount: increment(1), // Incrémente le nombre de joueurs
      });
      
     
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  // Fetch court name from Firestore
  const fetchCourtName = async () => {
    try {
      const docRef = doc(db, 'terrains', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCourtName(docSnap.data().name); // Update court name
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching court name:', error);
    }
  };

  useEffect(() => {
    fetchCourtName(); 
    fetchPlayers(); 
  }, []);

  const handleAddAtTime = async (atTime) => {
    try {
      const newPlayer = {
        name: playername === '' ? 'anon' : playername,
        status: atTime,
      };
      const docRef = await addDoc(collection(db, `terrains/${id}/players`), newPlayer);
      
      setPlayers([...players, { id: docRef.id, ...newPlayer }]);
      setPlayerName('');

      const terrainRef = doc(db, 'terrains', id);
      await updateDoc(terrainRef, {
        playersCount: increment(1), // Incrémente le nombre de joueurs
      });
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const removePlayer = async (playerId) => {
    try {
      await deleteDoc(doc(db, `terrains/${id}/players`, playerId));
      setPlayers(players.filter((player) => player.id !== playerId));
      await updateDoc(doc(db, 'terrains', id), {
        playersCount: increment(-1), // Decrement the player count
      });
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{courtName || t('courtName')}</ThemedText>
      <ThemedText style={styles.subtitle}>{t('playersList')}</ThemedText>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <ThemedText style={styles.player}>
              {item.name} {item.status !== 'present' && `(${item.status})`}
            </ThemedText>
            <FontAwesome
              name="trash"
              size={20}
              color="grey"
              onPress={() => removePlayer(item.id)} // Call the removePlayer function
              style={styles.trashIcon}
            />
          </View>
        )}
      />
      <ThemedText style={styles.subtitle}>{t('playerNamePlaceholder')}</ThemedText>
      <TextInput
        placeholder={t('playerNamePlaceholder')}
        placeholderTextColor={'grey'}
        value={playername}
        onChangeText={setPlayerName}
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button title={t('addNow')} onPress={handleAddNow} />
      </View>
      <View style={styles.buttonContainer}>
        {Platform.OS === 'web' && (
          <>
            <TextInput
              placeholder={t('addAtTime')}
              value={time}
              onChangeText={(text) => setTime(text)}
              style={styles.input}
            />
            <Button title={`${t('addAtTime')} ${time}`} onPress={() => handleAddAtTime(time)} />
          </>
        )}
        {Platform.OS !== 'web' && (
          <>
            <Button title={t('addAtTime')} onPress={() => setVisible(true)} />
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  buttonContainer: { marginVertical: 2 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, marginBottom: 8 },
  player: { fontSize: 16, marginBottom: 4 },
  trashIcon: { position: 'absolute', right: 0 },
});