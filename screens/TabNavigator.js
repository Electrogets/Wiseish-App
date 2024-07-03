import React, { useState, useEffect } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Appearance, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationPage from './NotificationPage';
import Register from './Register';
import VisitorReminder from './VisitorReminder';
import CustomerCountDisplay from './CustomerCountDisplay';

const Tab = createMaterialTopTabNavigator();

const TabNavigator = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    Appearance.getColorScheme() === 'dark',
  );
  const [refreshCustomerCount, setRefreshCustomerCount] = useState(false);

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

  return (
    <SafeAreaView
      style={[styles.safeAreaView, isDarkMode && styles.darkContainer]}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#333' : '#fff' },
        ]}>
        <NotificationPage isDarkMode={isDarkMode} />
        <CustomerCountDisplay
          isDarkMode={isDarkMode}
          refresh={refreshCustomerCount}
        />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#000',
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: 'bold',
              color: isDarkMode ? '#fff' : '#000',
            },
            tabBarIndicatorStyle: {
              backgroundColor: '#BB32DC',
            },
            tabBarStyle: {
              backgroundColor: isDarkMode ? '#111' : '#fff',
            },
          }}>
          <Tab.Screen
            name="Register"
            options={{ tabBarLabel: 'Register' }}
            children={() => (
              <Register refreshCustomerCount={setRefreshCustomerCount} />
            )}
          />
          <Tab.Screen name="Visitor Reminders" component={VisitorReminder} />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 0,
  },
  darkContainer: {
    backgroundColor: '#333',
  },
});

export default TabNavigator;
