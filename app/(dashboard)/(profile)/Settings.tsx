import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
const Settings = () => {
  const navigation = useNavigation();
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);

  const toggleSwitch = () => setIsDarkModeEnabled((previousState) => !previousState);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.MyProfile}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <AntDesign name="left" size={23} color="#000" />
        </TouchableOpacity>
        <Text style={styles.profileText}>Settings</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" color="#000" size={23} />
        </TouchableOpacity>
      </View>

      {/* Settings List */}
      <ScrollView>
        {/* Language Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Language</Text>
          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>First Language</Text>
            <TouchableOpacity>
                  <Feather
                    name="play"
                    color="#4F4F4F"
                    size={17}
                  />
                </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>Second Language</Text>
            <TouchableOpacity>
                  <Feather
                    name="play"
                    color="#4F4F4F"
                    size={17}
                  />
                </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Other Settings Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Other Settings</Text>
          <View style={styles.optionContainer}>
            <Text style={styles.optionText}>Dark Mode</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDarkModeEnabled ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isDarkModeEnabled}
            />
          </View>

          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>Notification</Text>
            <TouchableOpacity>
                  <Feather
                    name="play"
                    color="#4F4F4F"
                    size={17}
                  />
                </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>Text Size</Text>
            <TouchableOpacity>
                  <Feather
                    name="play"
                    color="#4F4F4F"
                    size={17}
                  />
                </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>Sound And Volume</Text>
            <TouchableOpacity>
                  <Feather
                    name="play"
                    color="#4F4F4F"
                    size={17}
                  />
                </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>Privacy Policy</Text>
            <TouchableOpacity>
                  <Feather
                    name="play"
                    color="#4F4F4F"
                    size={17}
                  />
                </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionContainer}>
            <Text style={styles.optionText}>Terms and Condition</Text>
            <TouchableOpacity>
                  <Feather
                    name="play"
                    color="#4F4F4F"
                    size={17}
                  />
                </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  MyProfile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  profileText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "500",
  },
  headerIcon: {
    padding: 10,
    backgroundColor: "#FCFCFE",
    borderRadius: 10,
    elevation: 3,
    borderColor: "#cccccc",
  },
  menuButton: {
    padding: 10,
    backgroundColor: "#FCFCFE",
    borderRadius: 10,
    elevation: 3,
    borderColor: "#cccccc",
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#FCFCFE",
    borderRadius: 10,
    elevation: 3,
    padding: 20,
    borderColor: "#dddddd",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "semibold",
    marginBottom: 10,
    color: "#898A8D",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 14,
    color: "#1F1F1F",
    fontWeight:"medium"
  },
});
