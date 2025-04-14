import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from 'react-native-geolocation-service';

const BackgroundFetchHeadlessTask = async (event) => {
  console.log('[BackgroundFetch HeadlessTask] Event:', event);

  Geolocation.getCurrentPosition(
    (position) => {
      console.log('[BackgroundFetch HeadlessTask] Location:', position);
      // Example: Send location to Firestore
    },
    (error) => {
      console.error('[BackgroundFetch HeadlessTask] Location error:', error.message);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );

  BackgroundFetch.finish(event.taskId);
};

BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);