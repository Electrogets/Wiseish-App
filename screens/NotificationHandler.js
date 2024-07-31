import PushNotification from 'react-native-push-notification';

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
    });
};
