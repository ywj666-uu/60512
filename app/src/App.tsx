import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PerformerListScreen from './screens/PerformerListScreen';
import CheerScreen from './screens/CheerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="PerformerList"
          component={PerformerListScreen}
          options={{ title: '街头艺人应援' }}
        />
        <Stack.Screen
          name="Cheer"
          component={CheerScreen}
          options={{ title: '应援' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
