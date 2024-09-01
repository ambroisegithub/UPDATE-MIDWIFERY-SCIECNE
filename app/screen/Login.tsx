import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Login = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const [formData, setFormData] = useState({ licenseNumber: "", password: "" });
  const [errors, setErrors] = useState({
    licenseNumber: { message: "", valid: true },
    password: { message: "", valid: true },
  });
  const [networkError, setNetworkError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const validateLicenseNumber = (licenseNumber: string) => {
    const licenseRegex = /^LIC\d{4}RW$/;
    return licenseRegex.test(licenseNumber);
  };

  const validateForm = () => {
    const licenseError = formData.licenseNumber === "";
    const invalidLicense =
      !validateLicenseNumber(formData.licenseNumber) && !licenseError;
    const passwordError = formData.password === "";
    const isInvalidPassword =
      formData.password !== "" && formData.password.length < 6;

    setErrors({
      licenseNumber: {
        message: licenseError
          ? "License Number is required."
          : invalidLicense
          ? "Invalid License Number format. It should be in the format LICxxxxRW."
          : "",
        valid: !licenseError && !invalidLicense,
      },
      password: {
        message: passwordError
          ? "Password is required."
          : isInvalidPassword
          ? "Password must be at least 6 characters long."
          : "",
        valid: !passwordError && !isInvalidPassword,
      },
    });

    return (
      !licenseError && !invalidLicense && !passwordError && !isInvalidPassword
    );
  };


  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);
      setNetworkError(false);

      try {
        const existingUserId = await AsyncStorage.getItem("user_id");
        if (existingUserId) {
          await AsyncStorage.removeItem("user_data");
          await AsyncStorage.removeItem("user_id");
        }

        const response = await fetch(
          "https://fcmc.muberarugo.org/api/auth/login/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              registration_number: formData.licenseNumber,
              password: formData.password,
            }),
          }
        );

        const data = await response.json();

        if (data.status) {
          const { first_login, data: userData } = data;

          await AsyncStorage.setItem("user_data", JSON.stringify(userData));
          await AsyncStorage.setItem("user_id", userData.user.id.toString());

          setFormData({ licenseNumber: "", password: "" });

          if (first_login) {
            router.push("./ChangePassword");
          } else {
            router.push("/(dashboard)/(home)");
          }
        } else {
          if (data.message === "Registration number does not exist. Please contact the admin to register.") {
            Alert.alert(
              "Registration Number Not Found",
              "The registration number you provided does not exist. Please contact the admin to register."
            );
          } else {
            Alert.alert(
              "Login Failed",
              "Incorrect Password, please check your Password and try again."
            );
          }
        }
      } catch (error: any) {
        if (error.message === "Network request failed") {
          setNetworkError(true);
        } else {
          Alert.alert(
            "Error",
            `Something went wrong during login: ${error.message}`
          );
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

  const renderLoginContent = () => (
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
                <Text style={styles.muberarugotext}>DEVELOPMENT</Text>
              </View>
            </View>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label]}>Enter Your License Number</Text>
              <TextInput
                style={[
                  styles.input,
                  !errors.licenseNumber.valid && styles.errorInput,
                  !errors.licenseNumber.valid && styles.errorInputText,
                ]}
                value={formData.licenseNumber}
                onChangeText={(text) => handleChangeText("licenseNumber", text)}
                placeholder="Enter your license number (LICxxxxRW)"
                placeholderTextColor="#999"
              />
              {!errors.licenseNumber.valid && (
                <Text style={styles.errorMessage}>
                  {errors.licenseNumber.message}
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label]}>Enter Your Password</Text>
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
                <Text style={styles.errorMessage}>
                  {errors.password.message}
                </Text>
              )}
              <Pressable
              onPress={()=>{
                router.push("/screen/SendOtp")
            }}
              >
                <Text style={styles.forgetPasswordText}>
                  Forget Password
                </Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? (
                  <ActivityIndicator size="large" color="#ffff" />
                ) : (
                  "Login"
                )}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderNoNetworkContent = () => (
    <View>
      <View style={styles.headerIcon}>
        <AntDesign
          name="left"
          size={23}
          color="#000"
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        />
      </View>

      <View style={styles.noNetworkContainer}>
        <Image source={require("../../assets/images/EmptyState.png")} />
        <Text style={styles.noNetworkText}>No Network Connection</Text>
        <Text style={styles.noNetworkSubText}>
          Please check your internet connection and try again.
        </Text>
        <Pressable style={styles.retryButton} onPress={handleLogin}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {networkError ? renderNoNetworkContent() : renderLoginContent()}
    </View>
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
    marginBottom: 12,
    justifyContent: "center",
  },
  muberarugotext: {
    color: "#339206",
    fontSize: 22,
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    padding: 20,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
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
  loginButton: {
    backgroundColor: "#339206",
    borderRadius: 30,
    alignItems: "center",
    height:50,
    flexDirection:"column",
    justifyContent:"center",
    marginTop:10
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#E25C5C",
  },
  errorInput: {
    borderColor: "#E25C5C",
  },
  errorInputText: {
    color: "#E25C5C",
  },
  errorMessage: {
    color: "#E25C5C",
    fontSize: 15,
    marginTop: 5,
    fontWeight: "bold",
  },
  loginWithGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  loginWithText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  donthaveanaccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },
  Register: {
    color: "#339206",
    fontWeight: "bold",
  },
  donthaveanaccounttext: {
    color: "#3C3C43",
    fontWeight: "600",
    fontSize: 16,
  },
  linebottom: {
    width: "40%",
    height: 5,
    backgroundColor: "#1C1C1E",
    position: "absolute",
    bottom: 10,
    left: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  ViewSciences: {
    alignItems: "center",
    justifyContent: "center",
  },
  noNetworkContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    flexDirection: "column",
  },
  noNetworkText: {
    fontSize: 24,
    color: "#E25C5C",
    fontWeight: "bold",
    marginBottom: 10,
  },
  noNetworkSubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#339206",
    padding: 10,
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "50%",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgetPasswordText:{
    textDecorationLine: "underline",
    marginTop:5,
    color:"#339206",
    fontWeight:"bold"

  }
});

export default Login;
