import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from 'react-native-geolocation-service';
import { useEffect } from 'react';
import * as Location from 'expo-location';


export function useBackgroundGeolocation() {
  useEffect(() => {
    console.log('BackgroundGeolocation Hook Initialized');
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Fetch every 15 minutes
        stopOnTerminate: false, // Continue even when the app is terminated
        startOnBoot: true, // Start on device boot
        enableHeadless: true, // Allow headless mode
      },
      async (taskId) => {
        console.log('[BackgroundFetch] Task executed:', taskId);
         const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });
              console.log('Location:', location);
        // Fetch the user's location
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('[BackgroundFetch] Location:', position);
            updateUserLocationInFirestore(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          (error) => {
            console.error('[BackgroundFetch] Location error:', error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

        // Finish the background task
        BackgroundFetch.finish(taskId);
      },
      (error) => {
        console.error('[BackgroundFetch] Failed to configure:', error);
      }
    );

    // Check the status of BackgroundFetch
    BackgroundFetch.status((status) => {
      switch (status) {
        case BackgroundFetch.STATUS_RESTRICTED:
          console.log('[BackgroundFetch] Restricted');
          break;
        case BackgroundFetch.STATUS_DENIED:
          console.log('[BackgroundFetch] Denied');
          break;
        case BackgroundFetch.STATUS_AVAILABLE:
          console.log('[BackgroundFetch] Available');
          break;
      }
    });

    // Start BackgroundFetch
    BackgroundFetch.start()
      .then(() => {
        console.log('[BackgroundFetch] Started successfully!');
        
    })
        
      .catch((error) => {
        console.error('[BackgroundFetch] Failed to start:', error);
      });

    return () => {
      BackgroundFetch.stop();
    };
  }, []);

  const updateUserLocationInFirestore = async (latitude: number, longitude: number) => {
   console.log('Updating user location in Firestore:', { latitude, longitude });
  };

  return null; // Return state or functions if needed
}