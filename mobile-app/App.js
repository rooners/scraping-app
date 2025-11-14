import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddProductScreen from './screens/AddProductScreen';
import TrackedProductsScreen from './screens/TrackedProductsScreen';
import PriceHistoryScreen from './screens/PriceHistoryScreen';
import * as Notifications from 'expo-notifications';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
    axios.post('http://localhost:5000/register-push-token', { token });
    return token;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TrackedProducts">
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="TrackedProducts" component={TrackedProductsScreen} />
        <Stack.Screen name="PriceHistory" component={PriceHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
