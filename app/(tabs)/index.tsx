import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'; // Import des icônes

const terrains = [
  { id: '1', name: 'Terrain République', distance: '7 min', players: 3 },
  { id: '2', name: 'Parc Monceau', distance: '10 min', players: 1 },
];

export default function TerrainListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ margin: 40 }}>
        <ThemedText style={styles.title}>Terrains disponibles</ThemedText>
      </View>
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
                {item.players > 1  && <MaterialIcons name="groups" size={16} color="#007AFF" />}
                {item.players === 1 && <FontAwesome name="user" size={16} color="#007AFF" />}
                  <Text style={styles.details}>{item.players} joueurs présents</Text>
                </View>
                <View style={styles.row}>
                  <MaterialIcons name="location-on" size={16} color="#007AFF" />
                  <Text style={styles.details}>À ... min{//item.distance
                  } de vous</Text>
                </View>
              </View>
              <Text style={styles.link}>Voir</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  terrainItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  details: { fontSize: 14, color: '#555', marginLeft: 4 },
  link: { color: '#007AFF', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});