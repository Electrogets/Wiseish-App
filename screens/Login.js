import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Appearance,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
// import FontAwesome from '@react-native-vector-icons/fontawesome';
import { useAuth } from './auth/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import Geolocation from '@react-native-community/geolocation';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch } from 'react-redux';
import { actionCreators } from '../src/Store/masterToken/masterTokenAction';

const { width, height } = Dimensions.get('window'); // Get the window dimensions

const allowedLocations = [
  { latitude: 37.421998333333335, longitude: -122.084 }, //Android Emulator location Only for Testing
  { latitude: 28.5886991, longitude: 77.3141007 }, // WiseOwl Office Noida sector-01
  { latitude: 19.111757704803637, longitude: 72.85959122626757 }, //(MUMBAI) { LG ELECTRONICS INDIA PVT LTD (MUMBAI) CORPORATE AVENUE, 7TH FLOOR, C WING, WARD-K, CHAKALA, ANDHERI EAST, MUMBAI, 400093, MAHARASHTRA INDIA}
  { latitude: 19.266451625234836, longitude: 72.96586220843152 }, //(THANE) {LG ELECTRONICS INDIA PRIVATE LIMITED (THANE) TH FLOOR, OFFICE NO. A, MBC PARK-D BUILDING, KASARWADWALI,NEAR HYPER CITY MALL GHODBUNDER ROAD,THANE 400615 MAHARASHTRA India}
  { latitude: 16.705083496681514, longitude: 74.24324696604079 }, //(KOLHAPUR) {LG ELECTRONICS INDIA PRIVATE LIMITED (KOLHAPUR) 1ST FLOOR, 2 WING JUPITER COMPLEX, CS NO 38/B, TARABAI PARK, KOLHAPUR 416003 Maharashtra India}
  { latitude: 18.55240692419876, longitude: 73.79306446608521 }, //( PUNE) {LG ELECTRONICS INDIA PRIVATE LIMITED (PUNE) REGENT PLAZA, 4TH FLOOR, SR. NO. 5/1A/1, BANER PASHAN LINK ROAD, BANER PUNE 411045 Maharashtra India}
  { latitude: 19.872238128298505, longitude: 75.3629885142241 }, //(AURANGABAD) {LG ELECTRONICS INDIA PRIVATE LIMITED (AURANGABAD) OFFICE NUM 2&3, 5TH FLOOR, ABC EAST, MIDC CHIKALTHANA, NEAR PROZONE MALL, AURANGABAD 431007 Maharashtra India}
  { latitude: 17.490347078792176, longitude: 78.39283509489525 }, //( HYDERABAD) {LG ELECTRONICS INDIA PRIVATE LIMITED (HYDERABAD) #508 & 509, 5TH FLOOR, MANJEERA TRINITY CORPORATE, JNTU HITECH CITY ROAD, KUKATPALLY HYDERABAD 500072 Telangana India}
  { latitude: 17.98459128282932, longitude: 79.52270033296307 }, //(WARANGAL) {LG ELECTRONICS INDIA PRIVATE LIMITED (WARANGAL) 2ND FLOOR, FATHIMA COMPLEX, FATHIMA NAGAR, HYDERABAD TO WARANGAL MAIN ROAD, KAZIPET WARANGAL 506003 Telangana India}
  { latitude: 17.74164583894504, longitude: 83.24796026606509 }, //(VISAKHAPATNAM){LG ELECTRONICS INDIA PRIVATE LIMITED (VISAKHAPATNAM) DOOR NO. 58-14-50/1/1, PLOT NO.16, 1 & 2ND FLOOR, AISHWARYA TOWER JOURNALIST COLONY, MARRIPALEM VUDA LAYOUT, VISAKHAPATNAM 530009 Andhra Pradesh India}
  { latitude: 16.5175848809012, longitude: 80.67326073720041 }, //(VIJAYAWADA){LG ELECTRONICS INDIA PRIVATE LIMITED (VIJAYAWADA) D. NO. 48-18-8A, FIRST FLOOR, BACK SIDE OF RENAULT SHOWROOM, SRI RAMCHANDRA NAGAR VIJAYAWADA 520008 ANDHRA PRADESH INDIA}
  { latitude: 13.621364050577402, longitude: 79.41892008965483 }, //(TIRUPATI){LG ELECTRONICS INDIA PVT LTD (TIRUPATI) NO. 19-8-153, 4TH FLOOR, HATHIRAMJI COLONY, AIR BYE-PASS ROAD, TIRUPATI 517501 ANDHRA PRADESH INDIA}
  { latitude: 24.6078056, longitude: 73.6958886 },//Shop Name : Liberty Associates Pvt. Ltd.
  { latitude: 24.5858056, longitude: 73.6940278 },//Shop Name : Sound And Vision

  // office guys coordinates
  { latitude: 28.684387, longitude: 77.522865 }, //{Tushar}
  { latitude: 28.626338, longitude: 77.337486 }, //{shivam}
  { latitude: 28.575842, longitude: 77.323223 }, //{Sana}
  { latitude: 28.545607, longitude: 77.359821 }, //{rudrani and Gargi}
  { latitude: 28.636951, longitude: 77.103187 }, //{Harsimran}
  { latitude: 28.725734, longitude: 77.173649 }, //{chandan}
  { latitude: 28.656507, longitude: 77.166485 }, //{Ankush}
  { latitude: 28.691704, longitude: 77.286319 }, //{Varsha}
  { latitude: 28.602478, longitude: 77.37874 }, //{Manish}
  { latitude: 28.593867, longitude: 77.307009 }, //{Ghanendra}
  { latitude: 28.397180, longitude: 77.856357 }, //{ghanendra Home}
  { latitude: 28.055898, longitude: 77.974233 }, //{Ghanendra Home 2}
  { latitude: 28.585524, longitude: 77.072651 }, //{gaurav}
  { latitude: 28.711173, longitude: 77.046527 }, //{Govind}
  { latitude: 28.616179, longitude: 77.337819 }, //{Rukshar}

  // Add more allowed locations as needed
];

const Login = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [showInvalidPopup, setShowInvalidPopup] = useState(false);
  const [invalidPopupText, setInvalidPopupText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loaderText, setLoaderText] = useState('Fetching Location...');

  const [userLocation, setUserLocation] = useState(null);
  const [isLocationAllowed, setIsLocationAllowed] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');



  const checkLocationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('Location permission is not available on this device');
        break;
      case RESULTS.DENIED:
        console.log('Location permission is denied');
        await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        break;
      case RESULTS.GRANTED:
        console.log('Location permission is granted');
        // Proceed with getting the location
        break;
      case RESULTS.BLOCKED:
        console.log('Location permission is blocked');
        // Inform the user that they need to enable location permissions
        break;
    }
  };

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

  useEffect(() => {
    retrieveCredentials();
  }, []);

  const retrieveCredentials = async () => {
    try {
      const savedName = await AsyncStorage.getItem('rememberedName');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      const rememberMeValue = await AsyncStorage.getItem('rememberMe');

      if (rememberMeValue && savedName && savedPassword) {
        setName(savedName);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error retrieving credentials:', error);
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        setLoadingLocation(true); // Start loader
        // setLoaderText('Fetching Location...');
        const position = await getCurrentLocation();
        console.log('User Location:', position);
        setUserLocation(position);
        const allowedLocation = isUserInAllowedLocation(position);
        console.log('Is Location Allowed?', allowedLocation);
        setIsLocationAllowed(allowedLocation);
        if (allowedLocation) {
          setShowSuccessMessage(true);
        } else {
          setShowErrorMessage(true);
        }
        // setLoaderText('Location Fetch Successfully');
        // console.log(loaderText)
      } catch (error) {
        console.error('Error getting location:', error);
        setIsLocationAllowed(false);
        setShowErrorMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000); // Show the success message for 3 seconds
      }
      finally {
        setLoadingLocation(false);
        // setLoaderText('Error fetching location');
        setTimeout(() => {
          setShowSuccessMessage(false);
          setShowErrorMessage(false);
        }, 2000);
      }
    };

    getLocation();
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          console.log('Location successfully obtained:', position);
          resolve(position.coords);
        },
        error => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: false, //change the value to "false" for mobile devices and "true" for emulator
          timeout: 30000,
          maximumAge: 1000,
        },
      );
    });
  };

  const isUserInAllowedLocation = ({ latitude, longitude }) => {
    for (const allowedLoc of allowedLocations) {
      const distance = calculateHaversineDistance(
        latitude,
        longitude,
        allowedLoc.latitude,
        allowedLoc.longitude,
      );
      if (distance <= 500) {
        // Adjust the radius as needed
        return true;
      }
    }
    return false;
  };

  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    console.log('Distance:', distance);
    return distance * 1000; // Convert to meters
  };

  const deg2rad = deg => deg * (Math.PI / 180);




  const handleLogin = async () => {
    try {
      setLoading(true);

      setShowNameWarning(false);
      setShowPasswordWarning(false);
      setShowInvalidPopup(false);

      if (!isLocationAllowed) {
        alert(
          'You are not in an allowed location to log in. Clear your cache and try again.',
        );
        setLoading(false);
        return;
      }

      if (rememberMe) {
        await AsyncStorage.setItem('rememberedName', name);
        await AsyncStorage.setItem('rememberedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('rememberedName');
        await AsyncStorage.removeItem('rememberedPassword');
        await AsyncStorage.removeItem('rememberMe');
      }

      if (!name.trim() || !password.trim()) {
        if (!name.trim()) {
          setShowNameWarning(true);
        }
        if (!password.trim()) {
          setShowPasswordWarning(true);
        }
        return;
      }


      const response = await axios.post(
        'https://wiseish.in/api/salesperson/login/',
        {

          name,
          password,

        },


      );



      if (response.status === 200) {

        const userInfo = response.data;
        console.log('Login successful:', userInfo);
        setShowSuccessPopup(true);
        setLoading(true);
        dispatch(actionCreators.setMasterToken(userInfo?.tokens?.access));
        dispatch(actionCreators.setRefreshToken(userInfo?.tokens?.refresh));
        setTimeout(() => {
          setShowSuccessPopup(false);
          setLoading(false);

          setName('');
          setPassword('');

          navigation.navigate('Register');
        }, 1000);

      } else {
        console.log('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Axios error:', error.message);
      console.error('Login failed', error.response ? error.response.data : error);


      if (error.response && [400, 401, 404].includes(error.response.status)) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        // console.error('Response headers:', error.response.headers);
        const errorMessage = error.response.data.error || 'Invalid username or password.';
        setShowInvalidPopup(true);
        setInvalidPopupText(errorMessage);

        setTimeout(() => {
          setShowInvalidPopup(false);
        }, 3000);

      }
    } finally {
      setLoading(false);
    };
  }


  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const closeInvalidPopup = () => {
    setShowInvalidPopup(false);
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: 'white',

      // flex: 1,
      // justifyContent: 'center',
      // alignItems: 'center',
      backgroundColor: isDarkMode ? '#084552' : 'white',
      // height: hp('100%'),
      // width: wp('100%'),
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp('5%'),
    },

    MainHeading: {
      fontSize: width * 0.08,
      textAlign: 'center',
      fontWeight: '600',
      color: isDarkMode ? '#01f9fe' : '#000',
      marginTop: height * 0.01,
      marginBottom: height * 0.04,
    },
    textInput: {
      // fontSize: 16,
      // color: isDarkMode ? '#fff' : 'black',
      // borderBottomWidth: 2,
      // borderColor: isDarkMode ? '#727272' : '#727272',
      // margin: 0,
      // marginLeft: 15,
      // paddingLeft: 20,
      // flexDirection: 'column',
      // width: 310,
      // paddingBottom: 10,
      // left: -28,

      width: '90%',
      fontSize: hp('2%'),
      color: isDarkMode ? '#fff' : 'black',
      borderBottomWidth: 2,
      borderColor: isDarkMode ? '#727272' : '#727272',
      marginVertical: hp('1%'),
      paddingVertical: hp('0.5%'),
      paddingHorizontal: wp('3%'),
      flexDirection: 'column',
    },
    loginTypo: {
      fontWeight: '500',
      fontSize: width * 0.044,
      // textAlign: 'left',
      // left: '50%',
      color: isDarkMode ? '#fff' : '#000',
    },
    username: {
      marginLeft: width * 0.03,
      paddingTop: height * 0.04,
      fontWeight: '500',
      fontSize: width * 0.03,
      color: isDarkMode ? '#fff' : '#000',
      position: 'absolute',
    },
    password: {
      top: height * 0.04,
      marginLeft: width * 0.03,
      fontWeight: '500',
      fontSize: width * 0.03, // Adjust the font size as needed
      color: isDarkMode ? '#fff' : '#000',
      position: 'absolute',
    },
    icon: {
      position: 'relative',
      marginTop: height * 0.07,
      marginBottom: 0,
      alignItems: 'center',
      flexDirection: 'row',
      left: width * 0.01,
    },
    buttonContainer: {
      // borderRadius: 30,
      // overflow: 'hidden',
      // width: 200,
      // marginLeft: 'auto',
      // marginRight: 'auto',
      // marginTop: 30,
      width: '60%',
      borderRadius: wp('10%'),
      overflow: 'hidden',
      marginVertical: hp('4%'),
    },
    gradient: {
      // padding: 0,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      // backgroundColor: isDarkMode ? '#000' : 'transparent',
    },
    buttonText: {
      color: isDarkMode ? '#fff' : 'white',
      // textAlign: 'center',
      // fontSize: width * 0.02,
      // fontWeight: 'bold',
      // color: 'white',
      textAlign: 'center',
      fontSize: hp('2%'),
      fontWeight: 'bold',
      paddingVertical: hp('1.5%'),
    },
    checkboxContainer: {
      flexDirection: 'row',
      // marginBottom: height * 0.01,
      // marginTop: 30,
      // width: '50%',
      // marginLeft: 'auto',
      // marginRight: 'auto',
      // paddingLeft: 15,

      flexDirection: 'row',
      marginVertical: hp('1%'),
      width: '30%',
      alignItems: 'center',
    },
    checkbox: {
      // alignSelf: 'center',
      borderColor: isDarkMode ? '#fff' : '#000',
    },
    label: {
      // marginLeft: -55,
      color: isDarkMode ? '#fff' : '#000',
      // fontWeight: '600',

      marginLeft: wp('-20%'),
      fontSize: hp('1.8%'),
    },
    forgotwrap: {
      marginTop: 20,
      marginBottom: 20,
      paddingRight: 20,
      marginRight: -200,
    },
    textForgot: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 15,
    },
    successPopup: {
      position: 'absolute',
      top: '0%',
      left: wp('40%'),
      width: '60%',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      padding: width * 0.021,
      borderRadius: 10,
      elevation: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    successPopupText: {
      fontSize: width * 0.0385,
      fontWeight: 'bold',
      paddingLeft: 10,
      color: isDarkMode ? '#fff' : '#000',
    },
    invalidPopup: {
      position: 'absolute',
      top: '0%',
      left: wp('43%'),
      width: '60%',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      padding: width * 0.021,
      borderRadius: 10,
      elevation: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },


    invalidPopupText: {
      fontSize: width * 0.0385,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
    },

    invalidPopupText: {
      fontSize: width * 0.043,
      top: height * 0.007,
      right: wp('-2%'),
      fontWeight: 'bold',
      marginBottom: height * 0.009,
      color: isDarkMode ? '#fff' : '#000',
    },
    warningText: {
      fontSize: 13,
      textAlign: 'left',
      marginLeft: 11,
      color: isDarkMode ? 'red' : 'red',
    },
    eyeIconContainer: {
      position: 'absolute',
      right: 30,

      // position: 'absolute',
      // right: wp('3%'),
      // top: hp('2%'),
    },
    loader: {
      // position: 'absolute',
      // top: 0,
      // bottom: 0,
      // left: 0,
      // right: 0,
      // backgroundColor: 'rgba(0, 0, 0, 0.5)',
      // justifyContent: 'center',
      // alignItems: 'center',
      // zIndex: 999,
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    loaderText: {
      // marginTop: 10,
      // fontSize: 16,
      // fontWeight: 'bold',
      // color: '#ffffff',
      marginTop: hp('1%'),
      fontSize: hp('2%'),
      fontWeight: 'bold',
      color: '#ffffff',
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
      color: isDarkMode ? 'white' : '#000',
      fontSize: 16,
    },
    successMessage: {
      backgroundColor: isDarkMode ? 'green' : 'green',
    },
    errorMessage: {
      backgroundColor: isDarkMode ? 'red' : 'red',
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.MainHeading}>
          Sales Login   </Text>

        <View>
          <Text style={[styles.username, styles.loginTypo]}>Username </Text>
          <View style={styles.icon}>
            <Icon name="user" size={20} color={isDarkMode ? '#fff' : 'black'} />
            <TextInput
              style={styles.textInput}
              placeholder="Type username"
              placeholderTextColor={isDarkMode ? '#999' : 'rgba(0, 0, 0, 0.5)'}
              value={name}
              onChangeText={text => setName(text)}
            />
          </View>
          <View>
            {showNameWarning && (
              <Text style={styles.warningText}>Please enter your username</Text>
            )}
          </View>
        </View>

        <View>
          <Text style={[styles.password, styles.loginTypo]}>Password</Text>
          <View style={styles.icon}>
            <Icon name="lock" size={20} color={isDarkMode ? '#fff' : 'black'} />
            <TextInput
              style={styles.textInput}
              placeholder="Type password"
              placeholderTextColor={isDarkMode ? '#999' : 'rgba(0, 0, 0, 0.5)'}
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIconContainer}
              onPress={handlePasswordVisibility}>
              <View>
                <Icon
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={20}
                  color={isDarkMode ? '#fff' : 'black'}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View>
            {showPasswordWarning && (
              <Text style={styles.warningText}>Please enter your password</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin}>
          <LinearGradient
            colors={
              isDarkMode ? ['#454545', '#000000'] : ['#6ACDDE', '#BB32DC']
            }
            style={styles.gradient}>
            <Text style={styles.buttonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.checkboxContainer}>
          <BouncyCheckbox
            boxType={'square'}
            style={{
              borderRadius: 0,
            }}
            size={15}
            fillColor={isDarkMode ? '#000' : '#000'}
            unfillColor={isDarkMode ? '#000' : '#fff'}
            iconStyle={{
              // borderColor: isDarkMode ? '#000' : '#fff',
              borderRadius: 0,
              color: isDarkMode ? '#fff' : '#000',
            }}
            innerIconStyle={{
              borderWidth: 2,
              borderRadius: 0,
              color: isDarkMode
                ? rememberMe
                  ? '#000'
                  : '#fff'
                : rememberMe
                  ? '#fff'
                  : '#000',
            }}
            isChecked={rememberMe}
            onPress={isChecked => setRememberMe(isChecked)}
          />
          <Text style={styles.label}>Remember me</Text>
        </View>
      </View>

      {
        showSuccessPopup && (
          <View style={styles.successPopup}>
            <Icon name="check" size={20} color="lightgreen" />
            <Text style={styles.successPopupText}>Logged in Successfully!</Text>
          </View>
        )
      }

      {
        showInvalidPopup && (
          <View style={styles.invalidPopup}>
            <Icon name="close" size={30} color="red" />
            <Text style={styles.invalidPopupText}>{invalidPopupText}</Text>
          </View>
        )
      }
      {/* {showInvalidPopup && (
        <Animatable.View animation="fadeIn" style={styles.invalidPopup}>
          <Text style={styles.invalidPopupText}>{invalidPopupText}</Text>
          <TouchableOpacity onPress={closeInvalidPopup}>
            <Icon name="times" size={20} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </Animatable.View>
      )} */}

      {
        loadingLocation && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loaderText}>{loaderText}</Text>
          </View>
        )
      }
      {showSuccessMessage && (
        <View style={[styles.messageContainer, styles.successMessage]}>
          <Text style={styles.messageText}>Location fetched successfully!</Text>
        </View>
      )}

      {showErrorMessage && (
        <View style={[styles.messageContainer, styles.errorMessage]}>
          <Text style={styles.messageText}>Error fetching location. Please try again.</Text>
        </View >
      )
      }
    </ScrollView >
  );
};

export default Login;
