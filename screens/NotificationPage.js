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

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const NotificationPage = ({ isDarkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
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
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        'https://wiseish.in/api/salesperson/notifications/',
        {
          headers: {
            Authorization: `Bearer ${masterToken}`,
          },
        },
      );
      // console.log('API response:', response.data);
      const now = moment();

      const filteredNotifications = response.data.filter(notification => {
        const reminderDateTime = moment(notification.reminder_datetime);
        return reminderDateTime.isSame(now, 'minute');
      });

      // console.log('Filtered notifications:', filteredNotifications); // Log the filtered notifications

      setNotifications(filteredNotifications);
      setUnreadNotificationCount(
        filteredNotifications.filter(notification => !notification.read).length,
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      markAllNotificationsAsRead();
    }
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
      <TouchableOpacity onPress={toggleExpand}>
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
        <View
          style={[
            styles.expandedContainer,
            isDarkMode && styles.darkExpandedContainer,
          ]}>
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
                  isDarkMode && styles.darkNotificationItem,
                  !notification.read && styles.unreadNotification,
                ]}>
                <Text
                  style={[
                    styles.notificationText,
                    isDarkMode && styles.darkNotificationText,
                  ]}>
                  Customer Name: {notification.customer.name}
                </Text>
                <Text
                  style={[
                    styles.notificationText,
                    isDarkMode && styles.darkNotificationText,
                  ]}>
                  Phone Number: {notification.customer.phone_number}
                </Text>
                <Text
                  style={[
                    styles.notificationText,
                    isDarkMode && styles.darkNotificationText,
                  ]}>
                  Description: {notification.customer.description}
                </Text>
                <Text
                  style={[
                    styles.notificationText,
                    isDarkMode && styles.darkNotificationText,
                  ]}>
                  Reminder Date:{' '}
                  {moment(notification.reminder_datetime).format('Do MMMM YYYY')}
                </Text>
                <Text
                  style={[
                    styles.notificationText,
                    isDarkMode && styles.darkNotificationText,
                  ]}>
                  Reminder Time:{' '}
                  {moment(notification.reminder_datetime).format('h:mm a')}
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
  icon: {
    marginTop: 20,
    left: 50,
  },
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
  unreadNotification: {
    backgroundColor: '#f8d7da',
  },
  readNotification: {
    backgroundColor: '#f0f0f0',
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
});

export default NotificationPage;
