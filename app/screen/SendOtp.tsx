import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";

const SendOtp = () => {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false); 

  const validateLicenseNumber = (licenseNumber: string) => {
    const licenseRegex = /^LIC\d{4}RW$/;
    return licenseRegex.test(licenseNumber);
  };

  const navigation = useNavigation();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!validateLicenseNumber(licenseNumber)) {
      setError("Invalid License Number format. It should be in the format LICxxxxRW.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("https://fcmc.muberarugo.org/api/auth/send-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration_number: licenseNumber,
        }),
      });

      const data = await response.json();
      // console.log("Otp Sent Result", data);
      if (data.message === "OTP sent successfully to email.") {
        await AsyncStorage.setItem("license_number", licenseNumber);
        setOtpSent(true); // Show modal on successful OTP send
      }
    } catch (error) {
      // console.error("Error sending OTP:", error);
      Alert.alert("Error", "An error occurred while sending OTP.");
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

      <View style={styles.formContainer}>
        <Text style={styles.label}>Enter Your License Number</Text>
        <TextInput
          style={[styles.input, error ? styles.errorInput : {}]}
          value={licenseNumber}
          onChangeText={(text) => {
            setLicenseNumber(text);
            if (validateLicenseNumber(text)) {
              setError("");
            }
          }}
          placeholder="Enter your license number (LICxxxxRW)"
          placeholderTextColor="#999"
        />

        {error && <Text style={styles.errorMessage}>{error}</Text>}

        <Pressable
          style={styles.sendButton}
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              "Send License Number"
            )}
          </Text>
        </Pressable>
      </View>

    
      <Modal
        visible={otpSent}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOtpSent(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>OTP has been sent to your email.</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setOtpSent(false); // Close modal
                router.push("/screen/VerificationPage"); // Navigate to VerificationPage
              }}
            >
              <Text style={styles.modalButtonText}>Go to Verification</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  ImageContainer: {
    alignItems: "center",
  },
  muberarugotext: {
    color: "#339206",
    fontSize: 20,
    fontWeight: "bold",
  },
  formContainer: {
    marginTop: 5,
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
});

export default SendOtp;
