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
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const { width } = Dimensions.get('window'); // Get the window width

const CustomerCountDisplay = ({ refreshInterval = 5000 }) => {
  const [isCardClicked, setIsCardClicked] = useState(null);
  const [clickedCardData, setClickedCardData] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [shopperCount, setShopperCount] = useState(0);
  const [editedFeedback, setEditedFeedback] = useState({});
  const masterToken = useSelector(state => state?.tokenReducer?.accessToken);
  const [selectedItemDateTime, setSelectedItemDateTime] = useState({});
  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    fetchVisitorAndShopperCounts();
    const interval = setInterval(fetchVisitorAndShopperCounts, refreshInterval);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });

    return () => subscription.remove();
  }, []);

  const fetchVisitorAndShopperCounts = async () => {
    try {
      const visitorsResponse = await axios.get('http://13.200.89.3:8000/customers/visitors/', {
        headers: { Authorization: `Bearer ${masterToken}` },
      });
      const shoppersResponse = await axios.get('http://13.200.89.3:8000/customers/shoppers/', {
        headers: { Authorization: `Bearer ${masterToken}` },
      });
      setVisitorCount(visitorsResponse.data.length);
      setShopperCount(shoppersResponse.data.length);
    } catch (error) {
      console.error('Error fetching customer counts:', error);
      setVisitorCount(0);
      setShopperCount(0);
    }
  };

  const handleCardClick = async cardType => {
    let apiUrl = '';

    if (cardType === 'visitors') {
      apiUrl = 'http://13.200.89.3:8000/customers/visitors/';
    } else if (cardType === 'shoppers') {
      apiUrl = 'http://13.200.89.3:8000/customers/shoppers/';
    } else {
      console.error('Invalid card type');
      return;
    }

    try {
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${masterToken}` },
      });
      if (Array.isArray(response.data)) {
        setClickedCardData(response.data);
      } else {
        console.error('Invalid API response format');
        setClickedCardData([]);
      }

      setIsCardClicked(cardType);
    } catch (error) {
      console.error(`Error fetching ${cardType} data`, error);
      setClickedCardData([]);
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

  const handleSaveAllDetails = async itemId => {
    const editedItemIndex = clickedCardData.findIndex(item => item.id === itemId);
    if (editedItemIndex === -1) {
      console.error('Item not found for editing');
      return;
    }

    const editedItem = clickedCardData[editedItemIndex];

    try {
      const response = await axios.put(
        `http://13.200.89.3:8000/customers/${itemId}/update/`, // Update the endpoint to match your backend
        {
          description: editedFeedback[itemId] || '', // Assuming description is the feedback field
          // notification_date: selectedItemDateTime[itemId] || null,
          // notification_time: selectedItemDateTime[itemId] ? selectedItemDateTime[itemId].toLocaleTimeString() : null,
        },
        {
          headers: { Authorization: `Bearer ${masterToken}` },
        },
      );

      if (
        response.data &&
        response.data.description
        // &&
        // response.data.notification_date &&
        // response.data.notification_time
      ) {
        const updatedItem = {
          ...editedItem,
          description: response.data.description,
          // notification_date: response.data.notification_date,
          // notification_time: response.data.notification_time,
        };

        const updatedData = [...clickedCardData];
        updatedData[editedItemIndex] = updatedItem;
        setClickedCardData(updatedData);

        console.log('All details saved successfully');
      } else {
        console.error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error saving all details:', error);
    }
  };

  const handleModalClose = () => {
    setIsCardClicked(null);
    setClickedCardData([]);
    setEditedFeedback({});
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
    const listHeaderText = isCardClicked === 'visitors' ? 'Visitors' : isCardClicked === 'shoppers' ? 'Shoppers' : '';
    return (
      <Modal visible={isCardClicked !== null} animationType="slide" transparent={false}>
        <View style={[styles.expandedContainer, isDarkMode && styles.darkBackground]}>
          <Text style={[styles.listHeader, isDarkMode && styles.darkText]}>{listHeaderText}</Text>
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            {reversedData.map(item => {
              if (!item || !item.id) {
                return null;
              }
              // console.log("item", item);

              return (
                <View key={item.id} style={[styles.listItem, isDarkMode && styles.darkListItem]}>
                  <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Name: {item.id}</Text>
                  <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Name: {item.name}</Text>
                  <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Email: {item.email}</Text>
                  <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Phone Number: {item.phone_number}</Text>
                  <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Sales Person: {item.salesperson_name}</Text>
                  {item.visit_type === 'shoppers' ? (
                    <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Feedback: {item.description}</Text>
                  ) : (
                    <>
                      <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Feedback:</Text>
                      <TextInput
                        style={[styles.feedbackInput, isDarkMode && styles.darkInput]}
                        placeholder="Enter feedback"
                        value={editedFeedback[item.id] || item.description}
                        onChangeText={text => handleFeedbackEdit(item.id, text)}
                      />
                    </>
                  )}
                  {item.visit_type === 'visitors' && (
                    <>
                      <View style={styles.dateTimeContainer}>
                        <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>Reminder :
                          {selectedItemDateTime[item.id]
                            ? selectedItemDateTime[item.id].toLocaleString()
                            : ''}
                        </Text>
                        <TouchableOpacity onPress={() => showDateTimePicker(item.id)}>
                          <Icon name="clock-o" size={30} color={isDarkMode ? '#4CAF50' : 'green'} style={styles.clockIcon} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => handleSaveAllDetails(item.id)}>
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleModalClose}>
              <LinearGradient colors={['#6ACDDE', '#BB32DC']} style={styles.gradient}>
                <Text style={styles.buttonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
      {renderDataList()}
      {renderDateTimePicker()}
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
    width: "auto",
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
});

export default CustomerCountDisplay;
