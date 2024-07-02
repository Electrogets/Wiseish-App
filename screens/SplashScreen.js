import React, { useCallback } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Color, FontFamily } from './GlobalStyles';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const SplashScreen = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    // Navigate to another screen
    navigation.navigate('Login');
  };

  return (

    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handlePress} activeOpacity={0.7}>
        <LinearGradient
          style={[styles.androidSmall3Child, styles.wiseish1IconPosition]}
          locations={[0, 1]}
          colors={['#6acdde', '#bb32dc']}
          useAngle={true}
          angle={90}>
          <Text style={styles.letsStart}>Let’s Start</Text>
        </LinearGradient>
      </TouchableWithoutFeedback>

      <Image
        style={styles.androidSmall3Item}
        resizeMode="cover"
        source={require('./assets/splashscreen.png')}
      />
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: Color.colorWhite,
    flex: 1,
    // height: hp('60%'),
    width: wp('100%'),
    // overflow: "hidden",
    backgroundColor: 'white',
  },
  wiseish1IconPosition: {
    left: '50%',
    position: 'absolute',
    top: 600,
    backgroundColor: 'white',
  },
  welcomePosition: {
    textAlign: 'left',
    color: Color.colorWhite,
    left: '50%',
    position: 'absolute',
  },
  wiseishMobileBg1811: {
    top: 0,
    left: 4,
    width: 356,
    height: 633,
    display: 'none',
    position: 'absolute',
  },
  androidSmall3Child: {
    marginLeft: -91,
    top: 526,
    borderRadius: 17,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4.8,
    elevation: 4.8,
    shadowOpacity: 1,
    width: 182,
    height: 33,
    backgroundColor: 'transparent',
  },
  letsStart: {
    marginLeft: 40,
    top: -1,
    fontSize: 24,
    fontWeight: '500',
    fontFamily: FontFamily.interMedium,
    width: 125,
    height: 50,
    color: 'white',
  },
  wiseish1Icon: {
    marginLeft: -189,
    top: 226,
    width: 360,
    height: 360,
  },
  androidSmall3Item: {
    // left: -41,
    width: '100%',
    height: '65%',
    position: 'relative',
    resizeMode: 'contain',
  },
  welcome: {
    marginLeft: -110,
    top: 137,
    fontSize: 40,
    fontWeight: '600',
    fontFamily: FontFamily.interSemiBold,
  },
});

export default SplashScreen;
