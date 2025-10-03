import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegisterScreen from "../screens/registerScreen";
import ScanScreen from "../screens/ScanScreen";
import HomeGuru from "../screens/GuruHome";
import RegisterGuruScreen from "../screens/registerGuru";
import IzinScreen from "../screens/IzinScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Izin" component={IzinScreen} />
        <Stack.Screen name="HomeGuru" component={HomeGuru} />
        <Stack.Screen name="RegisterGuru" component={RegisterGuruScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
