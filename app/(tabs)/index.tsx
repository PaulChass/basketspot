import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';



export default function TerrainListScreen() {
  const { t } = useTranslation(); // Hook pour traductions
  const [terrains, setTerrains] = useState([]); // État pour stocker les terrains depuis Firestore
  const [terrainName, setTerrainName] = useState(''); // État pour le nom du terrain
  const router = useRouter();
  const [updated, setUpdated] = useState(false); // État pour suivre les mises à jour
  const [location, setLocation] = useState(null); // État pour stocker la localisation

 

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(location);
      }
    };
  
    fetchLocation();
  }, []);
  // fonction pour demander la permission de localisation
  useEffect(() => {
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log(t('location_permission_denied'));
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (location) => {
          setLocation(location);
        }
      );
    })();
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  



  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'terrains'), (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const terrain = { id: doc.id, ...doc.data() };
        console.log('Terrain:', terrain);
  
        // Calculer la distance si la localisation est disponible
        if (terrain.location && location?.coords) {
          const distance = calculateDistance(location.coords, terrain.location);
          terrain.distance = distance;
        } else {
          terrain.distance = null;
        }
  
        // Ajouter le terrain à l'état
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
 
 
  console.log(terrains);

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


  
  // Fonction pour calculer la distance entre deux points
   const calculateDistance = (loc1, loc2) => {
     const lat1 = loc1.latitude;
    const lon1 = loc1.longitude;
    const lat2 = loc2[0];
    const lon2 = loc2[1];
   const R = 6371; // Rayon de la Terre en km
   const dLat = (lat2 - lat1) * (Math.PI / 180);
   const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
       Math.cos(lat2 * (Math.PI / 180)) *
   Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   const distance = R * c; // Distance en km
   const roundedDistance = Math.round(distance * 100) / 100; // Arrondi à deux décimales
     return roundedDistance;
 };

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
                  <Text style={styles.details}>
                    {item.playersCount > 1 && t('playersPresent_plural', { count: item.playersCount })}
                    {item.playersCount <= 1 && t('playersPresent', { count: item.playersCount })}
                  </Text>
                  </View>
                <View style={styles.row}>
                   <Text style={styles.details}>
                    {item.distance}
                    { item.distance &&  ' km' }
                  </Text> 
                </View>
                {/* <View style={styles.row}>
                 <Text style={styles.details}>
                    {t('distance', { distance: item.distance })}
                  </Text> 
                </View> */}
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
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  details: { fontSize: 14, color: '#555', marginLeft: 4 },
  link: { color: '#007AFF', fontWeight: 'bold' },
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