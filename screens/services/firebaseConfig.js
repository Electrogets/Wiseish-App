// firebaseConfig.js
import firebase from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "wiseish-noti",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "1:27507198611:android:8a62c72c183124c865db66",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase