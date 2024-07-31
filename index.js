/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { createChannel } from './screens/NotificationHandler'; // Adjust the path as necessary

createChannel();

AppRegistry.registerComponent(appName, () => App);
