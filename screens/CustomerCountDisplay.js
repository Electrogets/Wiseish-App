import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Appearance,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { baseUrl } from './utils';
import { format } from 'date-fns';

const { width } = Dimensions.get('window'); // Get the window width

const CustomerCountDisplay = ({ handleOverlay }) => {
  const [isCardClicked, setIsCardClicked] = useState(null);
  const [clickedCardData, setClickedCardData] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [shopperCount, setShopperCount] = useState(0);
  const masterToken = useSelector(state => state?.tokenReducer?.accessToken);
  const [selectedItemDateTime, setSelectedItemDateTime] = useState({});
  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showNoUpdatesMessage, setShowNoUpdatesMessage] = useState(false);
  const [messageTimeout, setMessageTimeout] = useState(null);

  const fetchVisitorAndShopperCounts = async () => {
    handleOverlay();
    try {
      const visitorsResponse = await axios.get(`${baseUrl}/customers/visitors/`, {
        headers: { Authorization: `Bearer ${masterToken}` },
      });
      const shoppersResponse = await axios.get(`${baseUrl}/customers/shoppers/`, {
        headers: { Authorization: `Bearer ${masterToken}` },
      });
      setVisitorCount(visitorsResponse.data.length);
      setShopperCount(shoppersResponse.data.length);
    } catch (error) {
      console.error('Error fetching customer counts:', error);
      setVisitorCount(0);
      setShopperCount(0);
    } finally {
      setLoading(false);
      handleOverlay();
    }
  };

  useEffect(() => {
    fetchVisitorAndShopperCounts();
    // const interval = setInterval(fetchVisitorAndShopperCounts, 5000); // Fetch every 5 seconds
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Cleanup timeout when component unmounts or messages change
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);



  const fetchReminderData = async itemId => {
    try {
      const response = await axios.get(`${baseUrl}/salesperson/notifications/`, {
        headers: { Authorization: `Bearer ${masterToken}` },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn('Reminder not found for item:', itemId);
        return null;
      } else {
        console.error('Error fetching reminder data:', error);
        throw error;
      }
    }
  };

  const handleCardClick = async cardType => {
    let apiUrl = '';
    setLoading(true);

    if (cardType === 'visitors') {
      apiUrl = `${baseUrl}/customers/visitors/`;
    } else if (cardType === 'shoppers') {
      apiUrl = `${baseUrl}/customers/shoppers/`;
    } else {
      console.error('Invalid card type');
      return;
    }


    try {
      const [mainDataResponse, reminderData] = await Promise.all([
        axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${masterToken}` },
        }),
        fetchReminderData(),
      ]);

      if (Array.isArray(mainDataResponse.data)) {
        const dataWithReminders = mainDataResponse.data.map(item => {
          const reminder = reminderData.find(
            reminderItem => reminderItem.customer.id === item.id
          );
          return {
            ...item,
            reminder_datetime: reminder ? reminder.reminder_datetime : null,
          };
        });
        setClickedCardData(dataWithReminders);
      } else {
        console.error('Invalid API response format');
        setClickedCardData([]);
      }

      setIsCardClicked(cardType);
    } catch (error) {
      console.error(`Error fetching ${cardType} data`, error);
      setClickedCardData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateConfirm = date => {
    setSelectedItemDateTime(prevState => ({
      ...prevState,
      [selectedItemId]: date,
    }));
    setDateTimePickerVisibility(false);
  };

  const showDateTimePicker = itemId => {
    setSelectedItemId(itemId);
    setDateTimePickerVisibility(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisibility(false);
  };

  const handleFeedbackEdit = (itemId, newFeedback) => {
    if (!newFeedback.trim()) {
      const updatedEditedFeedback = { ...editedFeedback };
      delete updatedEditedFeedback[itemId];
      setEditedFeedback(updatedEditedFeedback);
    } else {
      setEditedFeedback(prevState => ({ ...prevState, [itemId]: newFeedback }));
    }
  };
  const handleSaveAllDetails = async (itemId, item) => {
    const editedItemIndex = clickedCardData.findIndex(dataItem => dataItem.id === itemId);
    if (editedItemIndex === -1) {
      console.error('Item not found for editing');
      return;
    }

    const editedItem = clickedCardData[editedItemIndex];
    const feedbackDescription = editedFeedback[itemId] || '';
    const formattedDate = selectedItemDateTime[itemId]
      ? format(selectedItemDateTime[itemId], "yyyy-MM-dd'T'HH:mm:ss")
      : null;

    setLoading(true);

    try {
      let updateDescription = false;
      let updateReminder = false;

      // Check if feedback description is updated
      if (editedFeedback[itemId]) {
        const response1 = await axios.put(
          `${baseUrl}/customers/${itemId}/update/`,
          { description: feedbackDescription },
          { headers: { Authorization: `Bearer ${masterToken}` } }
        );
        updateDescription = true;
        editedItem.description = response1.data.description; // Assuming response structure has 'description' field
      }

      // Check if reminder date-time is updated
      if (selectedItemDateTime[itemId]) {
        let reminderApiUrl = `${baseUrl}/reminders/`;

        // Check if the reminder already exists (using item.id to get reminder id)
        if (item.reminder_id) {
          reminderApiUrl = `${baseUrl}/reminders/${item.reminder_id}/`;
        }

        const method = item.reminder_id ? axios.put : axios.post;

        const response2 = await method(
          reminderApiUrl,
          {
            customer_id: itemId,
            reminder_datetime: formattedDate,
          },
          { headers: { Authorization: `Bearer ${masterToken}` } }
        );
        updateReminder = true;
        editedItem.reminder_id = response2.data.id; // Assuming response structure has 'reminder_datetime' field
      }

      // Update the state only if either of the updates was successful
      if (updateDescription || updateReminder) {
        const updatedData = [...clickedCardData];
        updatedData[editedItemIndex] = editedItem;
        setClickedCardData(updatedData);
        console.log('Details saved successfully');
        setShowSuccessMessage(true); // Show success message
        setShowNoUpdatesMessage(false);
        // Set timeout to hide success message after 3 seconds
        const timeout = setTimeout(() => {
          setShowSuccessMessage(false);
          setShowNoUpdatesMessage(false);

        }, 3000);
        setMessageTimeout(timeout);
      } else {
        console.log('No updates made');
        setShowNoUpdatesMessage(true);
        setShowSuccessMessage(false);
        const timeout = setTimeout(() => {
          setShowNoUpdatesMessage(false);
        }, 3000);
        setMessageTimeout(timeout); // Save timeout ID to state

      }
    } catch (error) {
      if (error.response) {
        console.error('Error saving details:', error.response.data);
      } else {
        console.error('Error saving details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleModalClose = () => {
    setIsCardClicked(null);
    setClickedCardData([]);
    setEditedFeedback({});
    handleOverlay();
  };

  const onRefresh = async () => {
    setLoading(true);
    setEditedFeedback({});
    setSelectedItemDateTime({});
    await fetchVisitorAndShopperCounts();
    setLoading(false);
  };

  const renderDateTimePicker = () => {
    return (
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        date={selectedItemDateTime[selectedItemId] || new Date()}
        minimumDate={new Date()}
        onConfirm={handleDateConfirm}
        onCancel={hideDateTimePicker}
      />
    );
  };

  const renderDataList = () => {
    const reversedData = [...clickedCardData].reverse();
    const listHeaderText =
      isCardClicked === 'visitors'
        ? 'Visitors'
        : isCardClicked === 'shoppers'
          ? 'Shoppers'
          : '';

    return (
      <Modal visible={isCardClicked !== null} animationType="slide" transparent={false}>
        <View style={[styles.expandedContainer, isDarkMode && styles.darkBackground]}>
          <Text style={[styles.listHeader, isDarkMode && styles.darkText]}>
            {!loading && `${listHeaderText}`}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContentContainer}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
              {reversedData.map(item => {
                if (!item || !item.id) {
                  return null;
                }

                const formattedReminderDateTime = item.reminder_datetime
                  ? format(new Date(item.reminder_datetime), 'Pp')
                  : '';
                const newSelectedDateTime = selectedItemDateTime[item.id]
                  ? selectedItemDateTime[item.id].toLocaleString()
                  : '';

                return (
                  <View key={item.id} style={[styles.listItem, isDarkMode && styles.darkListItem]}>
                    <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                      ID: {item.id}
                    </Text>
                    <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                      Name: {item.name}
                    </Text>
                    <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                      Email: {item.email}
                    </Text>
                    <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                      Phone Number: {item.phone_number}
                    </Text>
                    <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                      Sales Person: {item.salesperson_name}
                    </Text>
                    {item.visit_type === 'shoppers' ? (
                      <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                        Feedback: {item.description}
                      </Text>
                    ) : (
                      <>
                        <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                          Feedback:
                        </Text>
                        <TextInput
                          style={[styles.feedbackInput, isDarkMode && styles.darkInput]}
                          placeholder="Enter feedback"
                          value={editedFeedback[item.id] || item.description}
                          onChangeText={text => handleFeedbackEdit(item.id, text)}
                          multiline
                        />
                      </>
                    )}
                    {item.visit_type === 'visitors' && (
                      <>
                        <View style={styles.dateTimeContainer}>
                          <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
                            Reminder:
                            {newSelectedDateTime || formattedReminderDateTime}

                          </Text>
                          <TouchableOpacity onPress={() => showDateTimePicker(item.id)}>
                            <Icon
                              name="clock-o"
                              size={30}
                              color={isDarkMode ? '#4CAF50' : 'green'}
                              style={styles.clockIcon}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleSaveAllDetails(item.id, item)}>
                            <LinearGradient colors={['#6ACDDE', '#BB32DC']} style={styles.gradient}>
                              <Text style={styles.buttonText}>Update</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}

            </ScrollView>
          )}
          {!loading && reversedData.length === 0 && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>No data available</Text>
            </View>
          )}

          {!loading &&
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleModalClose}>
                <LinearGradient colors={['#6ACDDE', '#BB32DC']} style={styles.gradient}>
                  <Text style={styles.buttonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        </View>
        {showSuccessMessage && (
          <View style={[styles.messageContainer, styles.successMessage]}>
            <Text style={styles.messageText}>Details Updated successfully!</Text>
          </View>
        )}
        {showNoUpdatesMessage && (
          <View style={[styles.messageContainer, styles.noUpdateMessage]}>
            <Text style={styles.messageText}>No updates Made</Text>
          </View>
        )}
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleCardClick('registeredCustomers')}>
        <View style={[styles.card, styles.registeredCustomersCard]}>
          <Text style={styles.cardTitle}>Total Customers</Text>
          <Text style={styles.cardValue}>{visitorCount + shopperCount}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleCardClick('visitors')}>
        <View style={[styles.card, styles.visitorsCard]}>
          <Text style={styles.cardTitle}>Visitors</Text>
          <Text style={styles.cardValue}>{visitorCount}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleCardClick('shoppers')}>
        <View style={[styles.card, styles.shoppersCard]}>
          <Text style={styles.cardTitle}>Shoppers</Text>
          <Text style={styles.cardValue}>{shopperCount}</Text>
        </View>
      </TouchableOpacity>
      {renderDateTimePicker()}
      {isCardClicked !== null && renderDataList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 0,
    padding: 5,
    marginTop: 5,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
    gap: 0,
    margin: 0,
    width: 'auto',
    marginBottom: 20,
    backgroundColor: '#f9f9f9', // Light mode background color
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black', // Text color for light mode
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50', // Text color for light mode
  },
  expandedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listItem: {
    width: width - 40, // Adjust the width to be the screen width minus padding
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 20,
  },
  listItemText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black', // Text color for light mode
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginLeft: 10,
    top: -5,
  },
  buttonContainer: {
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 10,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradient: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  darkBackground: {
    backgroundColor: '#333', // Dark mode background color
  },
  darkText: {
    color: '#fff', // Dark mode text color
  },
  darkListItem: {
    borderColor: '#ccc', // Dark mode border color for list items
  },
  darkInput: {
    color: '#fff', // Dark mode text color for input
  },
  messageContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    position: 'absolute',
    top: 0,
    zIndex: 999,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  successMessage: {
    backgroundColor: 'green',
  },
  noUpdateMessage: {
    backgroundColor: 'red',
  },
});

export default CustomerCountDisplay;
