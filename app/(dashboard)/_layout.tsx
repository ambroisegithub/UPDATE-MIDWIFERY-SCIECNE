import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#7d7d7d",
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: -5,
          borderTopWidth: 1,
          borderTopColor: "#BEBAB3",
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarIconStyle: {
          marginBottom: -20,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Learn",
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
              Learn
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={20}
              color={
                focused
                  ? "#7d7d7d"
                  : Colors[colorScheme ?? "light"].tabIconDefault
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(emergency)"
        options={{
          title: "Emergency",
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
              Emergency
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "alert-circle" : "alert-circle-outline"}
              size={20}
              color={
                focused
                  ? "#7d7d7d"
                  : Colors[colorScheme ?? "light"].tabIconDefault
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(Article)"
        options={{
          title: "Article",
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
              Articles
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "newspaper" : "newspaper-outline"}
              size={20}
              color={
                focused
                  ? "#7d7d7d"
                  : Colors[colorScheme ?? "light"].tabIconDefault
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Search"
        options={{
          title: "Search",
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
              Search
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={20}
              color={
                focused
                  ? "#7d7d7d"
                  : Colors[colorScheme ?? "light"].tabIconDefault
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Achievements"
        options={{
          title: "Achievement",
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
              Achievement
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={20}
              color={
                focused
                  ? "#7d7d7d"
                  : Colors[colorScheme ?? "light"].tabIconDefault
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
              Profile
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={20}
              color={
                focused
                  ? "#7d7d7d"
                  : Colors[colorScheme ?? "light"].tabIconDefault
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeLabel: {
    color: "#339206",
    marginTop: 5,
    fontSize: 11,
  },
  inactiveLabel: {
    color: "#7d7d7d",
    marginTop: 5,
    fontSize: 11,
  },
});
