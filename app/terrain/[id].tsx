import React, { useState } from 'react';
import { View, Button, StyleSheet, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import DatePicker from 'react-native-date-picker'
import { TextInput } from 'react-native-gesture-handler';
import { TimePickerModal } from 'react-native-paper-dates'
import { ThemedView } from '@/components/ThemedView';
import { Platform } from 'react-native';




export default function TerrainDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [playername, setPlayerName] = useState('');
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState('');

  // Sample player data 
  const [players, setPlayers] = useState([
    { id: '1', name: 'Lucas', status: 'maintenant' },
    { id: '2', name: 'Fio', status: 'à 18:00' },
  ]);

  const getPlayers = async () => {
    await fetch('https://api.example.com/players')
      .then((response) => response.json())
      .then((json) => setPlayers(json))
      .catch((error) => console.error(error));
  }

  const handleAddNow = () => {
    setPlayers([...players, { id: Date.now().toString(), name: playername === '' ? 'anon' : playername, status: 'maintenant' }]);
  };

  const handleAddAtTime = (atTime) => {
    setPlayers([...players, { id: Date.now().toString(), name: playername === '' ? 'anon' : playername, status: atTime }]);
  }

  const removePlayer = (id) => {
    setPlayers(players.filter(player => player.id !== id));
  }

  const getNameFromId = (id) => {
    const names = {
      '1': 'Terrain République',
      '2': 'Parc Monceau',
    };
    return names[id] || 'Terrain inconnu';
  }



  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}> {getNameFromId(id)}</ThemedText>
      <ThemedText style={styles.subtitle}>Joueurs présents / à venir :</ThemedText>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText style={styles.player}>
              {item.name} ({item.status})
            </ThemedText>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>

              <Button title="X" onPress={() => removePlayer(item.id)} color="grey" />
            </View>
          </View>
        )}
      />
      <ThemedText
        style={styles.subtitle}>Nom du joueur :</ThemedText>
      <TextInput
        placeholder="Nom du joueur"
        placeholderTextColor={'grey'}
        value={playername}
        onChangeText={setPlayerName}

        style={{ borderWidth: 1, borderColor: '#ccc', color: 'grey', padding: 8, marginBottom: 16 }}
      />

      <View style={styles.buttonContainer}>
        <Button title="Est là" onPress={handleAddNow} />
      </View>
      <View style={styles.buttonContainer}>
        {Platform.OS === 'web' && (
          <>
            <TextInput
              placeholder="Entrez une heure (HH:MM)"
              value={time}
              onChangeText={(text) => setTime(text)}
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 8 }}
            />
            <Button title={`Viens à ${time}`} onPress={() => handleAddAtTime(time)} />



          </>
        )}
        {Platform.OS !== 'web' && (
          <>
            <Button title="Viens à" onPress={() => setVisible(true)} />

            <TimePickerModal
              visible={visible}
              onDismiss={() => setVisible(false)}
              onConfirm={async ({ hours, minutes }) => {
                setTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`)
                setVisible(false)
                handleAddAtTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`)
              }}
              hours={12} // initial
              minutes={0}
            />
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
});