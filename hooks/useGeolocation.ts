import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useGeolocation() {
  const [location, setLocation] = useState(null);

  // Fetch current location
  const fetchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
    } else {
      console.log('Location permission denied');
    }
  };

  const watchLocation = async (onLocationChange) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      return await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (location) => {
          setLocation(location);
          onLocationChange(location);
        }
      );
    }
    return null;
  };


  // Calculate distance between two points
  const calculateDistance = (loc1, loc2) => {
    const lat1 = loc1.latitude;
    const lon1 = loc1.longitude;
    const lat2 = loc2[0];
    const lon2 = loc2[1];
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
  };

  return { location, fetchLocation, calculateDistance, watchLocation };
}