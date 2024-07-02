// PermissionManager.js
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestLocationPermission = async () => {
  try {
    const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

    if (result === RESULTS.GRANTED) {
      return true; // Permission granted
    } else {
      return false; // Permission denied
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};
