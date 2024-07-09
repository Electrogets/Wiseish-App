import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useSelector } from 'react-redux';
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
    const masterToken = useSelector(state => state?.tokenReducer?.accessToken);

    const toggleNotificationExpand = notificationId => {
        if (expandedNotificationId === notificationId) {
            // If the clicked notification is already expanded, collapse it
            setExpandedNotificationId(null);
        } else {
            // Otherwise, expand the new notification and mark it as read
            setExpandedNotificationId(notificationId);
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification,
                ),
            );
            if (!notifications.find(notification => notification.id === notificationId)?.read) {
                setUnreadNotificationCount(prevCount => Math.max(0, prevCount - 1));
            }
        }
    };

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

            // Reverse the notifications array to display new data on top
            setNotifications(response.data.reverse());
            setUnreadNotificationCount(
                response.data.filter(notification => !notification.read).length,
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
                        {notifications.map(notification => (
                            <TouchableOpacity
                                key={notification.id}
                                onPress={() => toggleNotificationExpand(notification.id)}
                                style={[
                                    styles.notificationItem,
                                    notification.read && styles.readNotification,
                                    isDarkMode && styles.darkNotificationItem,
                                    !notification.read && styles.unreadNotification,
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
                        ))}
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
        marginTop: height * 0,
        left: width - 75,
        marginBottom: height * 0.02,
    },
    notificationCount: {
        position: 'absolute',
        top: height * 0.01,
        left: width - 65,
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
});

export default NotificationPage;
