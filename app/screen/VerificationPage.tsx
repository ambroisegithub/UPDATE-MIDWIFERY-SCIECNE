import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const VerificationPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [inputErrors, setInputErrors] = useState([false, false, false, false, false, false]);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const inputRefs = Array(6)
    .fill(null)
    .map(() => useRef<TextInput>(null));

  useEffect(() => {
    const getLicenseNumber = async () => {
      const number = await AsyncStorage.getItem("license_number");
      if (number) {
        setRegistrationNumber(number);
      }
    };
    getLicenseNumber();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, ""); // Allow only numbers
    setOtp(newOtp);

    if (value) {
      setInputErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[index] = false;
        return newErrors;
      });
    }

    if (value && index < otp.length - 1) {
      inputRefs[index + 1].current?.focus();
    } else if (!value && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    const hasEmptyFields = otp.some((digit) => digit === "");
  
    if (hasEmptyFields || !registrationNumber) {
      setInputErrors(otp.map((digit) => digit === ""));
      Alert.alert("Warning", "Please fill all OTP fields and ensure registration number is set.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(
        "https://fcmc.muberarugo.org/api/auth/verify-otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registration_number: registrationNumber,
            otp: otpString,
          }),
        }
      );
  
      const data = await response.json();
      // console.log("Verification Data", data);
  
      if (data.message === "OTP is valid. Proceed to set a new password.") {
        await AsyncStorage.setItem("otp", otpString);
        setShowModal(true); 
      } else if (data.non_field_errors && data.non_field_errors.includes("Invalid OTP.")) {
        Alert.alert("Check", "If OTP is valid. Please check and try again.");
      } else if (data.status) {
        router.push("/screen/ConfirmChangePasswordPage");
      }
    } catch (error) {
      Alert.alert("Network Error", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
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
      <View style={styles.contentsContainer}>
        <Text style={styles.label}>Check Your Email And Enter The OTP</Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[
                styles.otpInput,
                inputErrors[index] && styles.otpInputError,
              ]}
              value={digit}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={(value) => handleOtpChange(index, value)}
            />
          ))}
        </View>
        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Verify OTP</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.resendButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.resendButtonText}>Resend OTP</Text>
        </Pressable>
      </View>


      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              OTP is valid. Proceed to set a new password.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                router.push("/screen/ConfirmChangePasswordPage");
              }}
            >
              <Text style={styles.modalButtonText}>Proceed to Change Password</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    justifyContent: "center",
  },
  label: {
    fontSize: 18,
    color: "#339206",
    marginBottom: 20,
    fontWeight: "bold",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#339206",
    borderRadius: 8,
    padding: 10,
    fontSize: 24,
    textAlign: "center",
    width: 40,
    height: 50,
  },
  otpInputError: {
    borderColor: "red",
  },
  submitButton: {
    backgroundColor: "#339206",
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendButton: {
    marginTop: 15,
    alignItems: "center",
  },
  resendButtonText: {
    color: "#339206",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
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
    // marginBottom: 30,
  },
  muberarugotext: {
    color: "#339206",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentsContainer: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    color: "#339206",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#339206",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VerificationPage;
