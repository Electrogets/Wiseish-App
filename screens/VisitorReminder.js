import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Appearance,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import SuccessPopup from './SuccessPopup';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSelector } from 'react-redux';

const VisitorReminder = ({ navigation, route }) => {
  const masterToken = useSelector(state => state?.tokenReducer?.accessToken);
  const [name, setName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [visit_type, setVisit_type] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [errorPopupVisible, setErrorPopupVisible] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState('');
  const authToken = route.params?.authToken || '';
  const refreshToken = route.params?.refreshToken || '';
  const [isDarkMode, setIsDarkMode] = useState(
    Appearance.getColorScheme() === 'dark',
  );
  const [refresh, setRefresh] = useState(false);
  const [showDateTimeInput, setShowDateTimeInput] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [id, setId] = useState(route.params?.id || null);// State to store ID

  const resetFormAndNavigate = () => {
    setName('');
    setPhoneNumber('');
    setEmail('');
    setVisit_type('');
    setDescription('');
    setRefresh(prevRefresh => !prevRefresh);
    setId(null); // Reset the ID
  };

  useEffect(() => {
    const appearanceChangeHandler = ({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    };

    const subscription = Appearance.addChangeListener(appearanceChangeHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDateConfirm = date => {
    setSelectedDate(date);
    setSelectedDateTime(date);
    hideDatePicker();
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const [warningMessages, setWarningMessages] = useState({
    name: '',
    phone_number: '',
    email: '',
    visit_type: '',
    description: '',
  });

  const isValidPhoneNumber = phoneNumber => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      if (
        !name ||
        !isValidPhoneNumber(phone_number) ||
        !email ||
        !visit_type ||
        !selectedDateTime ||
        !description
      ) {
        if (!isValidPhoneNumber(phone_number)) {
          setWarningMessages(prevState => ({
            ...prevState,
            phone_number: 'Please enter a valid 10-digit phone number.',
          }));
        }

        Alert.alert('Alert', 'Please fill in the required field.');
        setLoading(false);
        return;
      }

      const requestData = {
        name: name.replace(/[^A-Za-z\s]/g, ''),
        email,
        phone_number,
        visit_type: visit_type === '' ? null : visit_type,
        description,
        reminder_datetime: selectedDateTime.toISOString(),
      };

      console.log('Request Data:', requestData);
      console.log('AuthToken:', masterToken);

      const registrationResponse = await axios.put(
        `https://wiseish.in/api/customers/${id}/update/`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${masterToken}`,
          },
        },
      );

      if (registrationResponse.status === 200 || registrationResponse.status === 201) {
        console.log('Update successful');
        setSuccessPopupVisible(true);

        setTimeout(() => {
          setSuccessPopupVisible(false);
          resetFormAndNavigate();
          setShowDateTimeInput(false);
          setSelectedDateTime(null);
        }, 2000);
      } else {
        console.log(
          'Unexpected response during registration:',
          registrationResponse,
        );
        setErrorPopupMessage('Update failed. Please try again.');
        setErrorPopupVisible(true);
      }
    } catch (error) {
      console.error('Update failed', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.response) {
        console.log('Error Response:', error.response.data);

        const { error: responseError } = error.response.data || {};
        if (responseError) {
          const firstErrorKey = Object.keys(responseError)[0];
          errorMessage = responseError[firstErrorKey];
        }
      }

      setWarningMessages({
        name: error.response?.data?.error?.name || '',
        phone_number: error.response?.data?.error?.phone_number || '',
        email: error.response?.data?.error?.email || '',
        visit_type: error.response?.data?.error?.visit_type || '',
        description: error.response?.data?.error?.feedback || '',
      });

      setErrorPopupMessage(errorMessage);
      setErrorPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      padding: 20,
      paddingTop: 0,
      backgroundColor: 'white',
      height: '100%',
      width: '100%',
    },
    darkContainer: {
      backgroundColor: '#333',
    },
    mainHeading: {
      fontSize: 24,
      textAlign: 'center',
      fontWeight: '600',
      color: '#000',
      marginTop: 0,
      marginBottom: 50,
    },
    darkMainHeading: {
      color: '#fff',
    },
    inputGroup: {
      marginBottom: 20,
    },
    placeholder: {
      textAlign: 'left',
      fontSize: 15,
      color: '#000',
      fontWeight: '600',
      marginBottom: 5,
    },
    darkText: {
      color: '#fff',
    },
    textInput: {
      fontSize: 18,
      color: 'black',
      borderBottomWidth: 2,
      borderColor: '#727272',
      paddingLeft: 0,
    },
    darkTextInput: {
      color: '#fff',
      borderColor: '#999',
    },
    visit: {
      borderColor: '#727272',
      paddingLeft: -10,
    },
    buttonContainer: {
      width: '50%',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 30,
      marginBottom: 30,
    },
    button: {
      borderRadius: 30,
      overflow: 'hidden',
    },
    darkButtonText: {
      color: '#fff',
    },
    gradient: {
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: isDarkMode ? '#fff' : 'white',
      fontWeight: 'bold',
    },
    darkButtonText: {
      color: 'white',
    },
    warningText: {
      color: 'red',
      fontWeight: '450',
    },
    pickerContainer: {
      position: 'relative',
      overflow: 'hidden',
    },
    datetimeIcon: {
      position: 'absolute',
      marginTop: 10,
    },
    dateborder: {
      borderColor: '#727272',
      borderBottomWidth: 2,
    },
    icon: {
      marginBottom: 15,
      marginTop: 15,
    },
  });

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View>
        <Text
          style={[styles.mainHeading, isDarkMode && styles.darkMainHeading]}>
          Visitor Reminder
        </Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.placeholder, isDarkMode && styles.darkText]}>
            Name
          </Text>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
            placeholder="Type name"
            placeholderTextColor={isDarkMode ? '#999' : '#727272'}
            value={name}
            onChangeText={text => {
              setName(text);
              setWarningMessages(prevState => ({
                ...prevState,
                name: '',
              }));
            }}
          />
          {warningMessages.name ? (
            <Text style={styles.warningText}>{warningMessages.name}</Text>
          ) : null}
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.placeholder, isDarkMode && styles.darkText]}>
            Mobile
          </Text>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
            placeholder="Type mobile number"
            placeholderTextColor={isDarkMode ? '#999' : '#727272'}
            value={phone_number}
            onChangeText={text => {
              setPhoneNumber(text);
              setWarningMessages(prevState => ({
                ...prevState,
                phone_number: '',
              }));
            }}
            keyboardType="numeric"
          />
          {warningMessages.phone_number ? (
            <Text style={styles.warningText}>
              {warningMessages.phone_number}
            </Text>
          ) : null}
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.placeholder, isDarkMode && styles.darkText]}>
            Email
          </Text>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
            placeholder="Type email id"
            placeholderTextColor={isDarkMode ? '#999' : '#727272'}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setWarningMessages(prevState => ({
                ...prevState,
                email: '',
              }));
            }}
            keyboardType="email-address"
          />
          {warningMessages.email ? (
            <Text style={styles.warningText}>{warningMessages.email}</Text>
          ) : null}
        </View>

        <View style={[styles.inputGroup, styles.dateborder]}>
          <Text style={[styles.placeholder, isDarkMode && styles.darkText]}>
            Date and Time
          </Text>
          <TouchableOpacity onPress={showDatePicker}>
            <Icon
              style={styles.icon}
              name="calendar"
              size={25}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          {selectedDateTime && (
            <Text style={[styles.placeholder, isDarkMode && styles.darkText]}>
              {selectedDateTime.toLocaleString()}
            </Text>
          )}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            date={selectedDate}
            minimumDate={new Date()}
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          />
        </View>

        <View style={[styles.inputGroup, styles.visit]}>
          <Text style={[styles.placeholder, isDarkMode && styles.darkText]}>
            Select visit type
          </Text>
          <View
            style={[
              styles.textInput,
              isDarkMode && styles.darkTextInput,
              styles.pickerContainer,
            ]}>
            <Picker
              selectedValue={visit_type}
              onValueChange={itemValue => {
                setVisit_type(itemValue);
                setWarningMessages(prevState => ({
                  ...prevState,
                  visit_type: '',
                }));
              }}
              style={{ color: isDarkMode ? '#fff' : 'black' }}
              prompt="Select type">
              <Picker.Item
                label="Select type"
                value=""
                color={isDarkMode ? '#999' : '#727272'}
              />
              <Picker.Item label="Visitors" value="visitors" />
              <Picker.Item label="Shoppers" value="shoppers" />
            </Picker>
          </View>
          {warningMessages.visit_type ? (
            <Text style={styles.warningText}>{warningMessages.visit_type}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.placeholder, isDarkMode && styles.darkText]}>
            Feedback
          </Text>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
            placeholder="Type feedback"
            placeholderTextColor={isDarkMode ? '#999' : '#727272'}
            value={description}
            onChangeText={text => {
              setDescription(text);
              setWarningMessages(prevState => ({
                ...prevState,
                description: '',
              }));
            }}
            multiline
          />
          {warningMessages.feedback ? (
            <Text style={styles.warningText}>{warningMessages.feedback}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <LinearGradient
            colors={
              isDarkMode ? ['#454545', '#000000'] : ['#6ACDDE', '#BB32DC']
            }
            style={styles.gradient}>
            <Text
              style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
              Checkin
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View>
        <SuccessPopup
          isVisible={successPopupVisible}
          onClose={() => {
            setSuccessPopupVisible(false);
            resetFormAndNavigate();
          }}
          isDarkMode={isDarkMode}
        />
      </View>
    </ScrollView>
  );
};

export default React.memo(VisitorReminder);
