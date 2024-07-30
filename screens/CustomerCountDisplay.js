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
  Image
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { baseUrl } from './utils';
import { format } from 'date-fns';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window'); // Get the window dimensions

const CustomerCountDisplay = ({ handleOverlay, trigger }) => {
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
  }, [trigger]);





  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
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
            reminder_id: reminder ? reminder.id : null,
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
    setEditedFeedback(prevState => ({ ...prevState, [itemId]: newFeedback.trim() }));
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

      // Update feedback description if it has been edited
      if (editedFeedback[itemId]) {
        const response1 = await axios.put(
          `${baseUrl}/customers/${itemId}/update/`,
          { description: feedbackDescription },
          { headers: { Authorization: `Bearer ${masterToken}` } }
        );
        updateDescription = true;
        editedItem.description = response1.data.description;
      }

      // Check if the reminder exists for the customer
      const existingReminder = item.reminder_id;

      // Create or update reminder if a new date has been selected
      if (selectedItemDateTime[itemId]) {
        if (existingReminder) {
          // Update the existing reminder
          const response2 = await axios.put(
            `${baseUrl}/reminders/${existingReminder}/`,
            {
              reminder_datetime: formattedDate,
            },
            { headers: { Authorization: `Bearer ${masterToken}` } }
          );
          updateReminder = true;
          editedItem.reminder_datetime = response2.data.reminder_datetime;
        } else {
          // Create a new reminder
          const response2 = await axios.post(
            `${baseUrl}/reminders/`,
            {
              customer_id: itemId,
              reminder_datetime: formattedDate,
            },
            { headers: { Authorization: `Bearer ${masterToken}` } }
          );
          updateReminder = true;
          editedItem.reminder_id = response2.data.id;
          editedItem.reminder_datetime = response2.data.reminder_datetime;
        }
      }

      // Update the clicked card data if any changes were made
      if (updateDescription || updateReminder) {
        const updatedData = [...clickedCardData];
        updatedData[editedItemIndex] = editedItem;
        setClickedCardData(updatedData);
        // console.log('Details saved successfully');
        setShowSuccessMessage(true);
        setShowNoUpdatesMessage(false);

        const timeout = setTimeout(() => {
          setShowSuccessMessage(false);
          setShowNoUpdatesMessage(false);
        }, 3000);
        setMessageTimeout(timeout);
      } else {
        // console.log('No updates made');
        setShowNoUpdatesMessage(true);
        setShowSuccessMessage(false);
        const timeout = setTimeout(() => {
          setShowNoUpdatesMessage(false);
        }, 3000);
        setMessageTimeout(timeout);
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

  const renderDateTimePicker = () => (
    <DateTimePickerModal
      isVisible={isDateTimePickerVisible}
      mode="datetime"
      date={selectedItemDateTime[selectedItemId] || new Date()}
      minimumDate={new Date()}
      onConfirm={handleDateConfirm}
      onCancel={hideDateTimePicker}
    />
  );

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
            <ActivityIndicator size="large" color="#BB32DC" />
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
                          value={editedFeedback[item.id] !== undefined ? editedFeedback[item.id] : item.description}
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
                            <LinearGradient colors={isDarkMode ? ['#232526', '#414345'] : ['#6ACDDE', '#BB32DC']} style={styles.gradient}>
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
            <View style={[styles.buttonContainer, styles.btnContainer]}>
              <TouchableOpacity style={styles.button} onPress={handleModalClose}>
                <LinearGradient colors={isDarkMode ? ['#232526', '#414345'] : ['#6ACDDE', '#BB32DC']} style={styles.gradient}>
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

    <View style={styles.cardContainer}>
      {/* <View style={styles.gradient2 > */}
      <LinearGradient
        colors={isDarkMode ? ['#232526', '#414345'] : ['#6ACDDE', '#BB32DC', '#FFFFFF']}
        style={styles.gradient2}>


        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
          onPress={() => handleCardClick('visitors')}
        >
          <Text style={[styles.cardText, { color: isDarkMode ? '#fff' : '#333' }]}>
            Visitors
          </Text>
          {/* <Icon name="eye" size={hp('5%')} color="#fff" /> */}
          <Text
            style={[styles.countText, { color: isDarkMode ? '#fff' : '#333' }]}
          >
            {visitorCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
          ]}
          onPress={() => handleCardClick('shoppers')}
        >

          <Text style={[styles.cardText, { color: isDarkMode ? '#fff' : '#333' }]}>
            Shoppers
          </Text>
          {/* <Icon name="shopping-cart" size={hp('5%')} color="#fff" /> */}
          <Text
            style={[styles.countText, { color: isDarkMode ? '#fff' : '#333' }]}
          >
            {shopperCount}
          </Text>
        </TouchableOpacity>
        {renderDateTimePicker()}
        {isCardClicked !== null && renderDataList()}
      </LinearGradient>
    </View >
    // </View >

  );
};





















//     <View style={styles.container}>
//       <TouchableOpacity
//       // onPress={() => handleCardClick('registeredCustomers')}
//       >
//         <View style={[styles.card, styles.registeredCustomersCard]}>
//           <Text style={styles.cardTitle}>Customers</Text>
//           <Text style={styles.cardValuer}>{visitorCount + shopperCount}</Text>
//         </View>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => handleCardClick('visitors')}>
//         <View style={[styles.card, styles.visitorsCard]}>
//           <Text style={styles.cardTitle}>Visitors</Text>
//           <Text style={styles.cardValue}>{visitorCount}</Text>
//         </View>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => handleCardClick('shoppers')}>
//         <View style={[styles.card, styles.shoppersCard]}>
//           <Text style={styles.cardTitle}>Shoppers</Text>
//           <Text style={styles.cardValue}>{shopperCount}</Text>
//         </View>
//       </TouchableOpacity>
//       {renderDateTimePicker()}
//       {isCardClicked !== null && renderDataList()}
//     </View>
//   );
// };

const styles = StyleSheet.create({

  cardTitle: {
    fontSize: width * 0.036,
    fontWeight: 'bold',
    marginBottom: height * 0.011,
    color: 'black', // Text color for light mode
  },
  cardValue: {
    fontSize: width * 0.046,
    fontWeight: 'bold',
    color: '#4CAF50', // Text color for light mode
  },
  cardValuer: {
    fontSize: width * 0.046,
    fontWeight: 'bold',
    color: 'red', // Text color for light mode
  },

  expandedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.021,
  },
  listHeader: {
    fontSize: width * 0.056,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
  },
  listItem: {
    width: width - 40, // Adjust the width to be the screen width minus padding
    marginBottom: wp('10%'),
    borderWidth: wp('0.5%'),
    borderColor: 'black',
    borderRadius: 5,
    padding: 20,
  },
  listItemText: {
    fontSize: wp('4.5%'),
    marginBottom: 10,
    color: 'black', // Text color for light mode
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  clockIcon: {
    marginLeft: width * 0.030,
    marginTop: height * -0.0099,
  },

  buttonContainer: {

    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: height * 0.01,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradient: {
    padding: width * 0.025,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',

  },
  gradient2: {
    width: wp("92%"),
    flexDirection: 'row',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: width * 0.02,
    marginBottom: height * 0.02,
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
    paddingVertical: height * 0.0100,
    position: 'absolute',
    top: 0,
    zIndex: 999,
  },
  messageText: {
    color: 'white',
    fontSize: width * 0.04,
  },
  successMessage: {
    backgroundColor: 'green',
  },
  noUpdateMessage: {
    backgroundColor: 'red',
  },
  headerImage: {
    width: "6%",
    height: "auto",
    left: wp("60%"),
    top: wp("-20%"),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('100%'),
  },
  card: {
    flex: 1,
    margin: wp('3%'),
    padding: wp('5%'),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 24,
    marginTop: 10,
  },
});

export default CustomerCountDisplay;