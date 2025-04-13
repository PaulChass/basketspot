import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, FlatList, TextInput, Image, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useTranslation } from 'react-i18next'; 
import { increment, updateDoc, onSnapshot } from 'firebase/firestore'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import { SvgUri } from 'react-native-svg';




export default function TerrainDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation(); 
  const [playername, setPlayerName] = useState('');
  const [courtName, setCourtName] = useState<string | null>(null);
  
  interface Player {
    id: string;
    name: string;
    status: string;
    avatar?: string; 
  }

  interface PlayerDoc {
    name: string;
    status: string;
    avatar?: string; 
  }

  const [players, setPlayers] = useState<Player[]>([]);
  
  const fetchPlayers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, `terrains/${id}/players`));
      const fetchedPlayers: Player[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as PlayerDoc;
        fetchedPlayers.push({ id: doc.id, ...data });
      });
      
      setPlayers(fetchedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Watch the players collection for changes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, `terrains/${id}/players`), (snapshot) => {
      const updatedPlayers = snapshot.docs.map((doc) => {
        const data = doc.data() as PlayerDoc;
        return { id: doc.id, ...data };
      });
      setPlayers(updatedPlayers);
    });
    return () => unsubscribe();
  }
, [id]);

  const handleAddNow = async () => {
    try {
      console.log('Adding player:', playername);
      const newPlayer = {
        name: playername === '' ? 'Anon' : playername,
        status: 'present',
      };
  
      const docRef = await addDoc(collection(db, `terrains/${id}/players`), newPlayer);
      setPlayers([...players, { id: docRef.id, ...newPlayer }]);
      setPlayerName(''); // Clear input field after adding player
      
      if (typeof id !== 'string') {
        throw new Error('Invalid terrain ID');
      }
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
      if (typeof id !== 'string') {
        throw new Error('Invalid terrain ID');
      }
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


  const removePlayer = async (playerId: string) => {
    try {
      console.log('Removing player:', playerId);
      await deleteDoc(doc(db, `terrains/${id}/players`, playerId));
      setPlayers(players.filter((player) => player.id !== playerId));
      if (typeof id === 'string') {
        await updateDoc(doc(db, 'terrains', id), {
          playersCount: increment(-1), // Decrement the player count
        });
      } else {
        console.error('Invalid terrain ID');
      }
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  const updateCourtAsWanted = async () => {
    console.log('Updating court as wanted:', id);
    try {
      if (typeof id !== 'string') {
        throw new Error('Invalid terrain ID');
      }
      const terrainRef = doc(db, 'terrains', id);
      await updateDoc(terrainRef, {
        wanted: new Date(Date.now() + 60 * 60 * 1000).toISOString() // Set the wanted time to 60 minutes from now
      });
      console.log('Court updated as wanted:', id);
    } catch (error) {
      console.error('Error updating court as wanted:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{courtName || t('courtName')}</ThemedText>
      <View style={styles.wantedButtonContainer}>
        <Button title={t('playersWanted')} onPress={updateCourtAsWanted} />
      </View>
      <ThemedText style={styles.subtitle}>{t('playersList')}</ThemedText>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          
          <View style={styles.playerRow}>
                          {item.avatar &&
                          (Platform.OS === 'web' ? ( 
                            <Image source={{ uri: item.avatar }} style={styles.avatarOption} />
                          ) : (
                            <SvgUri uri={item.avatar} width={80} height={80} style={styles.avatarOption} />
                          ))
                          }
            <ThemedText style={styles.player}>
              {item.name} {item.status !== 'present' && `(${item.status})`}

            </ThemedText>

            {/* Add a trash icon to remove the player */}            
            <FontAwesome
              name="trash"
              size={20}
              color="grey"
              onPress={() => removePlayer(item.id)} // Call the removePlayer function
              style={styles.trashIcon}
            />
          </View>
        )}
        ListEmptyComponent={<ThemedText>{t('noPlayers')}</ThemedText>}  
      />

     <ThemedText style={styles.subtitle}>{t('AddOtherPlayers')}</ThemedText>
      <TextInput
        placeholder={t('playerNamePlaceholder')}
        placeholderTextColor={'grey'}
        value={playername}
        onChangeText={setPlayerName}
        style={styles.input}
      />
      
      <View style={styles.buttonContainer}>
        <Button title={t('addPlayer')} onPress={ handleAddNow} />
      </View>
     
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  buttonContainer: { marginVertical: 2 },
  wantedButtonContainer: { marginVertical: 2, width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, marginBottom: 8 },
  playerRow: {width:'100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: 'grey',minHeight: 50}, 
  player: { fontSize: 16, position: 'absolute', left: 100 }, // Position the player name
  input: { color: 'grey' },
  avatarOption: { width: 40, height: 40, borderRadius: 20, marginRight: 8 }, // Define avatarOption style
  trashIcon: { position: 'absolute', right: 4 }, // Position the trash icon
  
});