import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import BackgroundGeolocation from 'react-native-background-geolocation';

export function useGeolocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

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

  const watchLocation = async (onLocationChange: (location: Location.LocationObject) => void) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      // Initialize Background Geolocation
      BackgroundGeolocation.ready(
        {
          desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
          distanceFilter: 10, // Minimum distance (in meters) to trigger location updates
          stopOnTerminate: false, // Continue tracking even if the app is terminated
          startOnBoot: true, // Start tracking when the device boots
          logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
          enableHeadless: true, // Allow background tracking
        },
        (state) => {
          if (!state.enabled) {
            BackgroundGeolocation.start(); // Start tracking
          }
        }
      );
  
      // Listen for location updates
      const locationSubscription = BackgroundGeolocation.onLocation((location) => {
        console.log('[BackgroundGeolocation Location]', location);
        const { latitude, longitude } = location.coords;
  
        // Update state and trigger callback
        setLocation({ coords: { latitude, longitude } } as Location.LocationObject);
        onLocationChange({ coords: { latitude, longitude } } as Location.LocationObject);
      });
  
      // Handle provider changes (e.g., GPS disabled)
      const providerChangeSubscription = BackgroundGeolocation.onProviderChange((event) => {
        if (!event.enabled) {
          console.error('[Provider Change] Location services disabled:', event);
        }
      });
  
      // Return a cleanup function to stop tracking
      return () => {
        locationSubscription.remove();
        providerChangeSubscription.remove();
        BackgroundGeolocation.stop();
      };
    } else {
      console.log('Location permission denied');
      return null;
    }
  };


  // Calculate distance between two points
  const calculateDistance = (loc1: { latitude: number; longitude: number }, loc2: [number, number]) => {
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