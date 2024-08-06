import PushNotification from 'react-native-push-notification';
import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const createChannel = () => {
    PushNotification.createChannel(
        {
            channelId: 'local-channel',
            channelName: 'Local Notifications',
            channelDescription: 'A channel to categorize local notifications',
            soundName: 'default',
            importance: 4,
            vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
    );
};

export const showNotification = (title, message) => {
    PushNotification.localNotification({
        channelId: 'local-channel',
        title: title,
        message: message,
        playSound: true,
        soundName: 'default',
        importance: 'high',
        vibrate: true,
        onlyAlertOnce: false,
        repeatTime: 1,
    });
};

// Function to update notification
export const updateNotification = (id, title, message) => {
    PushNotification.localNotification({
        channelId: 'local-channel',
        title: title,
        message: message,
        playSound: true,
        soundName: 'default',
        importance: 'high',
        vibrate: true,
        // onlyAlertOnce: false,
        // repeatTime: 1,
    });
};




export const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return result === RESULTS.GRANTED;
    } else if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.NOTIFICATIONS);
        return result === RESULTS.GRANTED;
    }
    return false;
};

export const checkNotificationPermission = async () => {
    if (Platform.OS === 'android') {
        const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return result === RESULTS.GRANTED;
    } else if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.NOTIFICATIONS);
        return result === RESULTS.GRANTED;
    }
    return false;
};



// const NOTIFICATION_STORAGE_KEY = 'shownNotificationIds';

// export const showUnreadNotificationOnce = async (notifications) => {
//     try {
//         const shownNotificationIds = JSON.parse(await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY)) || [];
//         const newUnreadNotifications = notifications.filter(notification => !notification.seen);

//         if (newUnreadNotifications.length > 0) {
//             const latestNotification = newUnreadNotifications[0];

//             if (!shownNotificationIds.includes(latestNotification.id)) {
//                 showNotification(
//                     'New Reminder',
//                     `${latestNotification.customer.name}: ${latestNotification.customer.description}`
//                 );

//                 // Add the notification ID to the list of shown notifications
//                 shownNotificationIds.push(latestNotification.id);
//                 await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(shownNotificationIds));
//             }
//         }
//     } catch (error) {
//         console.error('Error showing unread notification:', error);
//     }
// };
