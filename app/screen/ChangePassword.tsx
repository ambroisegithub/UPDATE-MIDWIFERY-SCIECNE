import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePassword = () => {
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: { message: "", valid: true },
    confirmPassword: { message: "", valid: true },
  });
  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id'); 
        if (id) {
          setUserId(JSON.parse(id)); 
        }
      } catch (error) {
        // console.error("Error retrieving user ID from storage:", error);
      }
    };

    fetchUserId();
  }, []);

  const validateForm = () => {
    const newPasswordError = formData.newPassword === "";
    const confirmPasswordError = formData.confirmPassword === "";
    const isInvalidNewPassword = formData.newPassword.length < 6;
    const passwordsDoNotMatch = formData.newPassword !== formData.confirmPassword;

    setErrors({
      newPassword: {
        message: newPasswordError
          ? "New password is required."
          : isInvalidNewPassword
          ? "Password must be at least 6 characters long."
          : "",
        valid: !newPasswordError && !isInvalidNewPassword,
      },
      confirmPassword: {
        message: confirmPasswordError
          ? "Please confirm your new password."
          : passwordsDoNotMatch
          ? "Passwords do not match."
          : "",
        valid: !confirmPasswordError && !passwordsDoNotMatch,
      },
    });

    return (
      !newPasswordError && !isInvalidNewPassword && !confirmPasswordError && !passwordsDoNotMatch
    );
  };

  const handleChangePassword = async () => {
    if (validateForm()) {
      setLoading(true);

      const requestBody = {
        user_id: userId,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      };

      try {
        const response = await fetch("https://fcmc.muberarugo.org/api/auth/change-password/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (data.status) {
          Alert.alert("Success", data.message);
          router.push("./Login");
        } else {
          Alert.alert("Error", data.message);
        }
      } catch (error:any) {
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          )
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangeText = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({
      ...prev,
      [field]: { message: "", valid: true },
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.main}>
          <View style={styles.headerIcon}>
            <AntDesign
              name="left"
              size={23}
              color="#000"
              onPress={() => navigation.goBack()}
              style={styles.backIcon}
            />
          </View>
          <View style={styles.ImageContainer}>
          <Image source={require("../../assets/images/muberarugoLogo.png")} />
          <View>
          <Text style={styles.muberarugotext}>CONTINUING PROFESSIONAL</Text>
          <View style={styles.ViewSciences}>
          <Text style={styles.muberarugotext}>
          DEVELOPMENT
      </Text>
          </View>

          </View>
        </View>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    !errors.newPassword.valid && styles.errorInput,
                  ]}
                  value={formData.newPassword}
                  onChangeText={(text) => handleChangeText("newPassword", text)}
                  placeholder="••••••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.showhideIcon}
                >
                  <Feather
                    name={showNewPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>
              {!errors.newPassword.valid && (
                <Text style={styles.errorMessage}>{errors.newPassword.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    !errors.confirmPassword.valid && styles.errorInput,
                  ]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChangeText("confirmPassword", text)}
                  placeholder="••••••••••••"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.showhideIcon}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>
              {!errors.confirmPassword.valid && (
                <Text style={styles.errorMessage}>{errors.confirmPassword.message}</Text>
              )}
            </View>

            <Pressable style={styles.changePasswordButton} onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.changePasswordButtonText}>
              {loading ? (
                  <ActivityIndicator size="large" color="#ffff" />
                ) : (
                  "Change Password"
                )}
                </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    justifyContent: "space-between",
  },
  main: {
    flex: 1,
    justifyContent: "space-between",
  },

  headerIcon: {
    flexDirection: "row",
    width: 40,
    alignItems: "center",
    margin: 50,
    justifyContent: "center",
    marginLeft: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    marginBottom: 0,
  },
  backIcon: {
    fontWeight: "bold",
  },
  ImageContainer: {
    alignItems: "center",
    // marginBottom: 10,
  },
  muberarugotext: {
    color: "#339206",
    fontSize: 32,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 17,
    color: "#339206",
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#339206",
    borderRadius: 30,
    padding: 13,
    fontSize: 16,
    color: "#000",
    width: "100%",
    fontWeight: "600",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  showhideIcon: {
    position: "absolute",
    right: 10,
    top: 15,
  },
  changePasswordButton: {
    backgroundColor: "#339206",
    borderRadius: 30,
    alignItems: "center",
    height:50,
    flexDirection:"column",
    justifyContent:"center"
  },
  changePasswordButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorInput: {
    borderColor: "#E25C5C",
  },
  errorMessage: {
    color: "#E25C5C",
    fontSize: 15,
    marginTop: 5,
    fontWeight: "bold",
  },
  
  ViewSciences:{
    alignItems:"center",
    justifyContent:"center"
  }
});

export default ChangePassword;
