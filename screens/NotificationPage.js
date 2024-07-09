import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Modal,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import moment from 'moment';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const { width, height } = Dimensions.get('window'); // Get the window dimensions

const NotificationPage = ({ isDarkMode }) => {
    const [notifications, setNotifications] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [expandedNotificationId, setExpandedNotificationId] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const masterToken = useSelector(state => state?.tokenReducer?.accessToken);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchNotifications();

        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 60000);

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

            const updatedNotifications = response.data.reverse().map(notification => ({
                ...notification,
                seen: notification.status === 'Notification seen' ? true : false,
            }));

            setNotifications(updatedNotifications);
            const unreadCount = updatedNotifications.filter(notification => !notification.seen).length;
            setUnreadNotificationCount(unreadCount);
            setFetchError(null);
        } catch (error) {
            setFetchError(error.message || 'Error fetching notifications');
            console.error('Error fetching notifications:', error);
            // If token expired or unauthorized, handle token refresh here
            if (error.response && error.response.status === 401) {
                // Example logic for token refresh
                dispatch({ type: 'LOGOUT' }); // Clear token from Redux state
                Alert.alert('Session Expired', 'Please log in again.');
                // Navigate to login screen or handle re-authentication
            }
        }
    };

    const toggleNotificationExpand = async notificationId => {
        if (expandedNotificationId === notificationId) {
            // If the clicked notification is already expanded, collapse it
            setExpandedNotificationId(null);
        } else {
            // Otherwise, expand the new notification and mark it as read if it's unseen
            setExpandedNotificationId(notificationId);
            const notification = notifications.find(notification => notification.id === notificationId);
            if (notification && !notification.seen) {
                await markNotificationAsSeen(notificationId); // Mark the notification as seen via the API
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, seen: true }
                            : notification,
                    ),
                );
                setUnreadNotificationCount(prevCount => Math.max(0, prevCount - 1));
            }
        }
    };

    const markNotificationAsSeen = async (notificationId) => {
        try {
            const response = await axios.post(`https://wiseish.in/api/reminders/${notificationId}/seen/`, {}, {
                headers: {
                    Authorization: `Bearer ${masterToken}`,
                },
            });
            console.log('Notification marked as seen:', response.data);
        } catch (error) {
            console.error('Error marking notification as seen:', error);
            throw error; // Propagate error for handling in fetchNotifications
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
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
                {unreadNotificationCount > 0 && !isExpanded && (
                    <View style={styles.notificationCount}>
                        <Text style={[styles.notificationCountText, isDarkMode ? styles.darkNotificationCountText : null]}>
                            {unreadNotificationCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
            <Modal
                transparent={true}
                visible={isExpanded}
                onRequestClose={toggleExpand}
                animationType="slide"
            >
                <View
                    style={[
                        styles.expandedContainer,
                        isDarkMode && styles.darkExpandedContainer,
                    ]}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        style={styles.scrollContainer}
                    >
                        {fetchError ? (
                            <Text style={styles.errorText}>{fetchError}</Text>
                        ) : (
                            notifications.map(notification => (
                                <TouchableOpacity
                                    key={notification.id}
                                    onPress={() => toggleNotificationExpand(notification.id)}
                                    style={[
                                        styles.notificationItem,
                                        notification.seen ? styles.readNotification : styles.unreadNotification,
                                        isDarkMode && styles.darkNotificationItem,
                                    ]}
                                >
                                    <View style={styles.notificationContent}>
                                        <Text
                                            style={[
                                                styles.notificationText,
                                                isDarkMode && styles.darkNotificationText,
                                            ]}
                                        >
                                            Customer Name: {notification.customer.name}
                                        </Text>
                                        {expandedNotificationId === notification.id && (
                                            <>
                                                <Text
                                                    style={[
                                                        styles.notificationText,
                                                        isDarkMode && styles.darkNotificationText,
                                                    ]}
                                                >
                                                    Phone Number: {notification.customer.phone_number}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.notificationText,
                                                        isDarkMode && styles.darkNotificationText,
                                                    ]}
                                                >
                                                    Description: {notification.customer.description}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.notificationText,
                                                        isDarkMode && styles.darkNotificationText,
                                                    ]}
                                                >
                                                    Reminder Date: {moment(notification.reminder_datetime).format('Do MMMM YYYY')}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.notificationText,
                                                        isDarkMode && styles.darkNotificationText,
                                                    ]}
                                                >
                                                    Reminder Time: {moment(notification.reminder_datetime).format('h:mm a')}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                    <Icon
                                        name={expandedNotificationId === notification.id ? 'angle-up' : 'angle-down'}
                                        size={20}
                                        color={isDarkMode ? '#fff' : '#000'}
                                        style={styles.arrowIcon}
                                    />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                    <TouchableOpacity onPress={toggleExpand} style={styles.closeButton}>
                        <Icon name="times" size={20} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        borderRadius: 5,
        position: 'relative',
        flexDirection: 'row',
    },
    darkContainer: {
        backgroundColor: '#333',
    },
    icon: {
        marginTop: height * (-0.09),
        left: width - 70,
        marginBottom: height * 0.02,
    },
    notificationCount: {
        position: 'absolute',
        top: height * (-0.08),
        left: width - 57,
        backgroundColor: 'red',
        borderRadius: 15,
        // minWidth: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationCountText: {
        color: 'white',
        fontSize: width * 0.032,
        paddingHorizontal: width * 0.01,
    },
    darkNotificationCountText: {
        color: 'white',
    },
    expandedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        width: windowWidth,
        height: windowHeight,
    },
    darkExpandedContainer: {
        backgroundColor: 'rgba(34, 34, 34, 1)',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.01,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding: width * 0.03,
        width: windowWidth - 40,
    },
    darkNotificationItem: {
        borderBottomColor: '#555',
    },
    unreadNotification: {
        backgroundColor: 'black',
    },
    readNotification: {
        backgroundColor: 'grey',
    },
    notificationContent: {
        flex: 1,
    },
    arrowIcon: {
        marginLeft: width * 0.3,
    },
    notificationText: {
        fontSize: width * 0.04,
        color: '#000',
    },
    darkNotificationText: {
        color: '#fff',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: height * 0.03,
    },
    closeButton: {
        position: 'absolute',
        top: height * 0.001,
        left: width * 0.02,
        padding: width * 0.03,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default NotificationPage;
