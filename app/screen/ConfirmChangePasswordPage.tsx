import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const ConfirmChangePasswordPage = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: { message: "", valid: true },
    confirmPassword: { message: "", valid: true },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const regNum = await AsyncStorage.getItem("license_number");
      const otpValue = await AsyncStorage.getItem("otp");

      if (regNum) setRegistrationNumber(regNum);
      if (otpValue) setOtp(otpValue);
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const passwordError = formData.password === "";
    const confirmPasswordError = formData.confirmPassword === "";
    const isInvalidPassword =
      formData.password !== "" && formData.password.length < 6;
    const passwordsMatch = formData.password === formData.confirmPassword;

    setErrors({
      password: {
        message: passwordError
          ? "Password is required."
          : isInvalidPassword
          ? "Password must be at least 6 characters long."
          : "",
        valid: !passwordError && !isInvalidPassword,
      },
      confirmPassword: {
        message: confirmPasswordError
          ? "Confirm Password is required."
          : !passwordsMatch
          ? "Passwords do not match."
          : "",
        valid: !confirmPasswordError && passwordsMatch,
      },
    });

    return !passwordError && !isInvalidPassword && passwordsMatch;
  };

  const handleChangeText = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({
      ...prev,
      [field]: { message: "", valid: true },
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(
        "https://fcmc.muberarugo.org/api/auth/reset-password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registration_number: registrationNumber,
            otp: otp,
            new_password: formData.password,
          }),
        }
      );

      const data = await response.json();
      if (data.message === "Password reset successfully.") {
        setShowModal(true);
      } else if (
        data.non_field_errors &&
        data.non_field_errors.includes("Invalid OTP.")
      ) {
        Alert.alert("Error", "Invalid OTP. Please check and try again.");
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
  };

  return (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.container}
    >
      
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
    <View style={styles.container}>
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
        <Text style={styles.muberarugotext}>CONTINUING PROFESSIONAL</Text>
        <Text style={styles.muberarugotext}>DEVELOPMENT</Text>
      </View>
      <View style={styles.formContainer}>
        <Text style={[styles.label]}>Enter Your New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              !errors.password.valid && styles.errorInput,
              !errors.password.valid && styles.errorInputText,
            ]}
            value={formData.password}
            onChangeText={(text) => handleChangeText("password", text)}
            placeholder="••••••••••••"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showhideIcon}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
        </View>
        {!errors.password.valid && (
          <Text style={styles.errorMessage}>{errors.password.message}</Text>
        )}

        <Text style={[styles.label]}>Confirm New Password</Text>
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
          <Text style={styles.errorMessage}>
            {errors.confirmPassword.message}
          </Text>
        )}

        <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
   
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Password has been changed successfully.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                router.push("/screen/Login");
              }}
            >
              <Text style={styles.modalButtonText}>Go to Login</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  ImageContainer: {
    alignItems: "center",
    // marginBottom: 10,
  },
  muberarugotext: {
    color: "#339206",
    fontSize: 20,
    fontWeight: "bold",
  },
  formContainer: {
    marginTop: 20,
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#339206",
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#339206",
    borderRadius: 30,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: "#000",
    width: "100%",
  },
  errorInput: {
    borderColor: "#E25C5C",
  },
  errorMessage: {
    color: "#E25C5C",
    fontSize: 14,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: "#339206",
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    color: "#339206",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#339206",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  errorInputText: {
    color: "#E25C5C",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollViewContent: {
    justifyContent: "space-between",
  },
});

export default ConfirmChangePasswordPage;
