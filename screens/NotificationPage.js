import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import moment from 'moment';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const NotificationPage = ({ isDarkMode, authToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const masterToken = useSelector(state => state?.tokenReducer?.accessToken);

  const markNotificationAsRead = notificationId => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
    setUnreadNotificationCount(prevCount => Math.max(0, prevCount - 1));
  };

  useEffect(() => {
    console.log('Registration success changed:', registrationSuccess);
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 1000);

    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    requestUserPermission();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('New Notification', remoteMessage.notification.body);
      fetchNotifications();
    });

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [registrationSuccess]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        'http://13.200.89.3:8000/salesperson/notifications/',
        {
          headers: {
            Authorization: `Bearer ${masterToken}`,
          },
        },
      );
      const now = moment();
      const filteredNotifications = response.data.filter(notification => {
        const reminderDateTime = moment(notification.reminder_datetime);
        return reminderDateTime.isSame(now, 'minute');
      });

      setNotifications(filteredNotifications);
      setUnreadNotificationCount(
        filteredNotifications.filter(notification => !notification.read).length,
      );

      if (filteredNotifications.length === 0) {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      markAllNotificationsAsRead();
    }
  };

  const handleSuccessfulRegistration = () => {
    setRegistrationSuccess(true);
    console.log('Registration success:', registrationSuccess);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true,
      })),
    );
    setUnreadNotificationCount(0);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TouchableOpacity
        onPress={() => {
          toggleExpand();
          handleSuccessfulRegistration();
        }}>
        <Icon
          name="bell"
          size={25}
          color={isDarkMode ? '#fff' : '#000'}
          style={styles.icon}
        />
        {unreadNotificationCount > 0 && (
          <View style={styles.notificationCount}>
            <Text style={styles.notificationCountText}>
              {unreadNotificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {isExpanded && (
        <View style={[styles.expandedContainer, isDarkMode && styles.darkExpandedContainer]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollContainer}>
            {notifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => markNotificationAsRead(notification.id)}
                style={[
                  styles.notificationItem,
                  notification.read && styles.readNotification,
                  isDarkMode && styles.darkNotificationItem, // Apply dark mode styles
                ]}>
                <Text style={[styles.notificationText, isDarkMode && styles.darkNotificationText]}>
                  ID: {notification.id}
                </Text>
                <Text style={[styles.notificationText, isDarkMode && styles.darkNotificationText]}>
                  Name: {notification.name}
                </Text>
                <Text style={[styles.notificationText, isDarkMode && styles.darkNotificationText]}>
                  Email: {notification.email}
                </Text>
                <Text style={[styles.notificationText, isDarkMode && styles.darkNotificationText]}>
                  Number: {notification.number}
                </Text>
                <Text style={[styles.notificationText, isDarkMode && styles.darkNotificationText]}>
                  Reminder Date:{' '}
                  {moment(notification.reminder_datetime).format('Do MMMM YYYY')}
                </Text>
                <Text style={[styles.notificationText, isDarkMode && styles.darkNotificationText]}>
                  Reminder Time:{' '}
                  {moment(notification.reminder_datetime).format('h:mm a')}
                </Text>
                <Text style={[styles.notificationText, isDarkMode && styles.darkNotificationText]}>
                  Salesperson Name: {notification.salesperson_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={toggleExpand} style={styles.closeButton}>
            <Icon name="times" size={20} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginLeft: 280,
    flexDirection: 'row',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  icon: {},
  notificationCount: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCountText: {
    color: '#fff',
    fontSize: 12,
  },
  expandedContainer: {
    position: 'absolute',
    top: 0,
    left: -290,
    width: windowWidth,
    height: windowHeight,
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 0,
    zIndex: 1000,
  },
  darkExpandedContainer: {
    backgroundColor: '#222',
  },
  notificationItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    marginLeft: 10,
  },
  darkNotificationItem: {
    borderBottomColor: '#555',
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000',
  },
  darkNotificationText: {
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    left: 15,
    padding: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  readNotification: {
    backgroundColor: '#f0f0f0',
  },
});

export default NotificationPage;
