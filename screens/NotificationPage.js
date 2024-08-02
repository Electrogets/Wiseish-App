import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Modal,
    Alert,
    Appearance,
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
import { showNotification, requestNotificationPermission, checkNotificationPermission } from './NotificationHandler'; // Adjust the path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';



const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [expandedNotificationId, setExpandedNotificationId] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const masterToken = useSelector(state => state?.tokenReducer?.accessToken);
    const dispatch = useDispatch();
    const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

    useEffect(() => {
        fetchNotifications();
        checkAndRequestNotificationPermission();

        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);


    const checkAndRequestNotificationPermission = async () => {
        const hasPermission = await checkNotificationPermission();
        if (!hasPermission) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                Alert.alert('Permission Denied', 'Please enable notifications from the app settings.');
            }
        }
    };



    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setIsDarkMode(colorScheme === 'dark');
        });

        return () => subscription.remove();
    }, []);



    const NOTIFICATION_STORAGE_KEY = 'shownNotificationIds';

    const showUnreadNotificationOnce = async (notifications) => {
        try {
            const shownNotificationIds = JSON.parse(await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY)) || [];
            const newUnreadNotifications = notifications.filter(notification => !notification.seen);

            if (newUnreadNotifications.length > 0) {
                const latestNotification = newUnreadNotifications[0];

                if (!shownNotificationIds.includes(latestNotification.id)) {
                    showNotification(
                        'New Reminder',
                        `${latestNotification.customer.name}: ${latestNotification.customer.description}`
                    );

                    // Add the notification ID to the list of shown notifications
                    shownNotificationIds.push(latestNotification.id);
                    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(shownNotificationIds));
                }
            }
        } catch (error) {
            console.error('Error showing unread notification:', error);
        }
    };


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
                seen: notification.salesperson_notification_seen,
            }));

            setNotifications(updatedNotifications);
            const unreadCount = updatedNotifications.filter(notification => !notification.seen).length;
            setUnreadNotificationCount(unreadCount);
            setFetchError(null);

            // Show a local notification for new unread notifications
            await showUnreadNotificationOnce(updatedNotifications);

            // Show a local notification for new unread notifications
            const newUnreadNotifications = updatedNotifications.filter(notification => !notification.seen);
            if (newUnreadNotifications.length > 0) {
                const latestNotification = newUnreadNotifications[0];
                showNotification(
                    'New Reminder',
                    `${latestNotification.customer.name}: ${latestNotification.customer.description}`
                );
            }

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

    const handleSeen = async (notificationId) => {
        try {
            const response = await axios.post(
                `https://wiseish.in/api/reminders/${notificationId}/seen/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${masterToken}`,
                    },
                }
            );
            if (response.status === 200) {
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === notificationId ? { ...notification, seen: true } : notification
                    )
                );
                setUnreadNotificationCount(prevCount => Math.max(0, prevCount - 1));
            }
        } catch (error) {
            console.error('Error marking notification as seen:', error);
            // Handle error
        }
    };

    const toggleNotificationExpand = async (notificationId) => {
        if (expandedNotificationId === notificationId) {
            // If the clicked notification is already expanded, collapse it
            setExpandedNotificationId(null);
        } else {
            // Otherwise, expand the new notification and mark it as read if it's unseen
            setExpandedNotificationId(notificationId);
            const notification = notifications.find(notification => notification.id === notificationId);
            if (notification && !notification.seen) {
                await handleSeen(notificationId); // Mark the notification as seen via the API
            }
        }
    };

    const toggleExpand = () => {
        if (isExpanded) {
            setExpandedNotificationId(null); // Reset the expanded notification ID when closing the modal
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
            <TouchableOpacity onPress={toggleExpand} style={styles.iconContainer}>
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
                    <View style={[styles.header, isDarkMode && styles.darkHeader]}>
                        <Text style={[styles.headerText, isDarkMode && styles.darkHeaderText]}>Notifications</Text>
                        <TouchableOpacity onPress={toggleExpand} style={styles.closeButton}>
                            <Icon name="times" size={20} color={isDarkMode ? '#fff' : '#fff'} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        style={styles.scrollContainer}
                    >
                        {fetchError ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="inbox" size={50} color={isDarkMode ? '#fff' : '#000'} />
                                <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>
                                    {fetchError}
                                </Text>
                            </View>
                        ) : notifications.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="inbox" size={50} color={isDarkMode ? '#fff' : '#000'} />
                                <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>
                                    No notifications available.
                                </Text>
                            </View>
                        ) : (
                            notifications.map(notification => (
                                <TouchableOpacity
                                    key={notification.id}
                                    onPress={() => toggleNotificationExpand(notification.id)}
                                    style={[
                                        styles.notificationItem,
                                        notification.seen ? (isDarkMode ? styles.darkReadNotification : styles.readNotification) : (isDarkMode ? styles.darkUnreadNotification : styles.unreadNotification),
                                    ]}
                                >
                                    <View style={styles.notificationContent}>
                                        <View style={styles.notificationDetail}>
                                            <Text
                                                style={[
                                                    styles.boldText,
                                                    isDarkMode ? styles.darkBoldText : null,
                                                    { fontSize: wp('4%') }, // Adjust font size here
                                                ]}
                                            >
                                                Customer Name:
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.notificationText,
                                                    isDarkMode ? styles.darkNotificationText : null,
                                                    { fontSize: wp('5%'), marginLeft: 12 }, // Adjust font size and margin here
                                                ]}
                                            >
                                                {notification.customer.name}
                                            </Text>
                                        </View>
                                        {expandedNotificationId === notification.id && (
                                            <>
                                                <View style={styles.notificationDetail}>
                                                    <Text
                                                        style={[
                                                            styles.boldText,
                                                            isDarkMode ? styles.darkBoldText : null,
                                                            { fontSize: wp('4%') }, // Adjust font size here
                                                        ]}
                                                    >
                                                        Phone Number:
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.notificationText,
                                                            isDarkMode ? styles.darkNotificationText : null,
                                                            { fontSize: wp('4%'), marginLeft: 12 }, // Adjust font size and margin here
                                                        ]}
                                                    >
                                                        {notification.customer.phone_number}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationDetail}>
                                                    <Text
                                                        style={[
                                                            styles.boldText,
                                                            isDarkMode ? styles.darkBoldText : null,
                                                            { fontSize: wp('4%') }, // Adjust font size here
                                                        ]}
                                                    >
                                                        Description:
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.notificationText,
                                                            isDarkMode ? styles.darkNotificationText : null,
                                                            { fontSize: wp('4%'), marginLeft: 12 }, // Adjust font size and margin here
                                                        ]}
                                                    >
                                                        {notification.customer.description}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationDetail}>
                                                    <Text
                                                        style={[
                                                            styles.boldText,
                                                            isDarkMode ? styles.darkBoldText : null,
                                                            { fontSize: wp('4%') }, // Adjust font size here
                                                        ]}
                                                    >
                                                        Reminder Date:
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.notificationText,
                                                            isDarkMode ? styles.darkNotificationText : null,
                                                            { fontSize: wp('4%'), marginLeft: 12 }, // Adjust font size and margin here
                                                        ]}
                                                    >
                                                        {moment(notification.reminder_datetime).format('Do MMMM YYYY')}
                                                    </Text>
                                                </View>
                                                <View style={styles.notificationDetail}>
                                                    <Text
                                                        style={[
                                                            styles.boldText,
                                                            isDarkMode ? styles.darkBoldText : null,
                                                            { fontSize: wp('4%') }, // Adjust font size here
                                                        ]}
                                                    >
                                                        Reminder Time:
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.notificationText,
                                                            isDarkMode ? styles.darkNotificationText : null,
                                                            { fontSize: wp('4%'), marginLeft: 12 }, // Adjust font size and margin here
                                                        ]}
                                                    >
                                                        {moment(notification.reminder_datetime).format('h:mm a')}
                                                    </Text>
                                                </View>
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
                </View>
            </Modal >
        </View >
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
    iconContainer: {
        position: 'absolute',
        top: hp('-6%'),
        left: wp('81%'),
        padding: 10,
    },
    icon: {
        marginBottom: windowHeight * 0.02,
    },
    notificationCount: {
        position: 'absolute',
        top: hp('2%'),
        left: wp('6%'),
        width: wp("5%"),
        backgroundColor: 'red',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationCountText: {
        color: 'white',
        fontSize: 12,
        padding: 4,
    },
    darkNotificationCountText: {
        color: '#fff',
    },
    expandedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: windowWidth,
        height: windowHeight,
    },
    darkExpandedContainer: {
        backgroundColor: 'rgba(34, 34, 34, 1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: windowWidth * 0.05,
        paddingVertical: windowHeight * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%',
        backgroundColor: '#f8f8f8',
    },
    darkHeader: {
        backgroundColor: '#444',
        borderBottomColor: '#555',
    },
    headerText: {
        fontSize: windowWidth * 0.05,
        color: '#000',

    },
    darkHeaderText: {
        color: '#fff',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: windowHeight * 0.02,
        padding: windowWidth * 0.04,
        width: windowWidth - 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    darkNotificationItem: {
        borderColor: '#555',
        backgroundColor: '#444',
    },
    unreadNotification: {
        backgroundColor: '#FFE4E1',
    },
    darkUnreadNotification: {
        backgroundColor: '#663399',
    },
    readNotification: {
        backgroundColor: '#E8E8E8',
    },
    darkReadNotification: {
        backgroundColor: '#444444',
    },
    notificationContent: {
        flex: 1,
    },
    arrowIcon: {
        marginLeft: windowWidth * 0.03,
    },
    notificationText: {
        fontSize: windowWidth * 0.04,
        color: '#000',
    },
    darkNotificationText: {
        color: '#fff',
    },
    boldText: {
        fontWeight: 'bold',
        color: 'grey',
    },
    darkBoldText: {
        fontWeight: 'bold',
        color: 'darkgrey',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: windowHeight * 0.03,
    },
    closeButton: {
        padding: windowWidth * 0.03,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: windowWidth * 0.04,
    },
    emptyText: {
        fontSize: windowWidth * 0.05,
        marginTop: windowHeight * 0.02,
        color: '#000',
    },
    darkEmptyText: {
        color: '#fff',
    },
});

export default NotificationPage;
