import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useSelector } from 'react-redux';
import SplashScreen from './screens/SplashScreen';
import Login from './screens/Login';
import Register from './screens/Register';
import CustomerCountDisplay from './screens/CustomerCountDisplay';
import { AuthProvider } from './screens/auth/AuthContext';
import store from './src/Store/store';
import TabNavigator from './screens/TabNavigator';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const masterToken = useSelector(state => state.tokenReducer.token);

  useEffect(() => {
    // Check if the user is logged in by looking for a token in the Redux state
    setIsLoggedIn(!!masterToken);
  }, [masterToken]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isLoggedIn ? 'Home' : 'Splash'}
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
          <Stack.Screen name="CustomerCountDisplay" component={CustomerCountDisplay} initialParams={{ masterToken: 'userToken' }} />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const App = () => {


  return (
    <Provider store={store}>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </Provider>
  );
};

export default App;
