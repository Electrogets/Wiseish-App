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
  ActivityIndicator,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import SuccessPopup from './SuccessPopup';
import { useSelector } from 'react-redux';
import CustomerCountDisplay from './CustomerCountDisplay';
import NotificationPage from './NotificationPage';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Register = ({ refreshCustomerCount }) => {
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
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

  const [warningMessages, setWarningMessages] = useState({
    name: '',
    phone_number: '',
    email: '',
    visit_type: '',
    description: '',
  });
  const [overlayLoader, setOverlayLoader] = useState(false);
  const [refresh, setRefresh] = useState(false);
  // Use Effect to subscribe to appearance changes
  useEffect(() => {
    const appearanceChangeHandler = ({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    };

    const subscription = Appearance.addChangeListener(appearanceChangeHandler);

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  const isValidPhoneNumber = phoneNumber => {
    // Use a regular expression to check if the phone number is valid
    const phoneRegex = /^\+91\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const isValidEmail = email => {
    // Use a regular expression to check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidName = name => {
    // Use a regular expression to check if the name contains only alphabets and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
  };

  const handleOverlay = () => {
    setOverlayLoader(true);
  };

  const resetFormAndNavigate = () => {
    // Reset form fields to their initial state
    setName('');
    setPhoneNumber('');
    setEmail('');
    setVisit_type('');
    setDescription('');

    // Trigger a refresh
    setRefresh(prevRefresh => !prevRefresh);
    // refreshCustomerCount();

    // Navigate to the Register screen
    // navigation.navigate('Register');
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      if (!name || !isValidPhoneNumber(phone_number) || !email || !visit_type || !description || !isValidEmail(email) || !isValidName(name)) {
        if (!isValidPhoneNumber(phone_number)) {
          // Set warning message for phone number
          setWarningMessages(prevState => ({
            ...prevState,
            phone_number: 'Please enter a valid 10-digit phone number.',
          }));
        }

        if (!isValidEmail(email)) {
          // Set warning message for email
          setWarningMessages(prevState => ({
            ...prevState,
            email: 'Please enter a valid email address.',
          }));
        }

        if (!isValidName(name)) {
          // Set warning message for name
          setWarningMessages(prevState => ({
            ...prevState,
            name: 'Name should contain only alphabets and spaces.',
          }));
        }

        Alert.alert('Alert', 'Please fill in the required field.');
        setLoading(false);
        return;
      }

      const requestData = {
        name: name.replace(/^A-za-z\s]/g, ''),
        email,
        phone_number,
        visit_type: visit_type === '' ? null : visit_type, // Send null if visitType is an empty string
        description,
      };

      const registrationResponse = await axios.post(
        'https://wiseish.in/api/customer/register/',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${masterToken}`,
          },
        },
      );

      if (registrationResponse.status === 201) {
        setSuccessPopupVisible(true);

        // Reset the form and navigate after a delay
        setTimeout(() => {
          setSuccessPopupVisible(false);
          resetFormAndNavigate();
        }, 2000);
      } else {
        console.log(
          'Unexpected response during registration:',
          registrationResponse,
        );
        setErrorPopupMessage('Registration failed. Please try again.');
        setErrorPopupVisible(true);
      }
    } catch (error) {
      console.error('Registration failed', error);

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
      flex: 1,
      padding: 15,
      paddingTop: 10,
      backgroundColor: 'white',
    },
    darkContainer: {
      backgroundColor: '#333',
    },
    mainHeading: {
      fontSize: 24,
      textAlign: 'center',
      fontWeight: '600',
      color: '#000',
      marginTop: 30,
      marginBottom: 30,
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
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.0)',
      color: isDarkMode ? ['#232526', '#414345'] : ['#6ACDDE', '#BB32DC'],
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerImage: {
      width: wp('100%'),
      height: hp('5%'),
      position: 'relative',
      resizeMode: 'contain',
      left: wp("-31%"),
      // top: hp('0%'),

    },

  });

  useEffect(() => {
    if (overlayLoader) {
      // Simulate an asynchronous action that takes time to complete
      const timeout = setTimeout(() => {
        setOverlayLoader(false);
      }, 2000);

      // Clean up the timeout to prevent memory leaks
      return () => clearTimeout(timeout);
    }
  }, [overlayLoader]);

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {overlayLoader && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#BB32DC" />
        </View>
      )}
      <Image
        style={styles.headerImage}
        // resizeMode="cover"
        source={require('./assets/wiseishLogo.png')}
      />
      <NotificationPage isDarkMode={isDarkMode} />

      <CustomerCountDisplay
        isDarkMode={isDarkMode}
        handleOverlay={() => setOverlayLoader(true)}
      />
      {/* <NotificationPage isDarkMode={isDarkMode} /> */}

      <View>
        <Text style={[styles.mainHeading, isDarkMode && styles.darkMainHeading]}>
          Customer Registration
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
            maxLength={13}
            onChangeText={text => {
              if (text.startsWith('+91')) {
                setPhoneNumber(text.substring(0, 13));
              } else {
                setPhoneNumber(
                  '+91' + text.replace(/[^\d]/g, '').slice(0, 10),
                );
              }
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
            <Text style={styles.warningText}>
              {warningMessages.visit_type}
            </Text>
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
              style={[
                styles.buttonText,
                isDarkMode && styles.darkButtonText,
              ]}>
              Checkin
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <SuccessPopup
        isVisible={successPopupVisible}
        onClose={() => {
          setSuccessPopupVisible(false);
          resetFormAndNavigate();
        }}
        isDarkMode={isDarkMode}
      />
    </ScrollView>
  );
};

export default Register;
