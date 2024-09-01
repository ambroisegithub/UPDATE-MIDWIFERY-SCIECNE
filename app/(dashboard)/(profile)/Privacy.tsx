import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";
const Privacy = () => {
  const navigation = useNavigation();
  const [registration_number, setregistration_number] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [first_name, setfirst_name] = useState("");
  const [last_name, setlast_name] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [date_of_birth, setdate_of_birth] = useState("");

  const [focusedField, setFocusedField] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        // console.log("User Id", userId);
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/auth/profile/${userId}/`
        );
        const data = await response.json();
        // console.log("user Profile", data);

        setregistration_number(data.registration_number);
        setName(`${data.first_name} ${data.last_name}`);
        setfirst_name(data.first_name);
        setlast_name(data.last_name);
        setEmail(data.email);
        setTelephone(data.telephone);
        setdate_of_birth(data.date_of_birth);
        setRole(data.role);
        
        setProfileImage(data.profile_image);
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

    fetchProfile();
  }, []);


  const validateForm = () => {
    let isValid = true;

    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setEmailError("Invalid email format");
      isValid = false;
    } else {
      setEmailError("");
    }

    return isValid;
  };
  const handleEditProfile = async () => {
    if (!validateForm()) return;
  
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_of_birth)) {
      Alert.alert("Invalid Date Format", "Please use the YYYY-MM-DD format for the date of birth.");
      return;
    }
  
    setLoading(true);
    const userId = await AsyncStorage.getItem("user_id");
    const formData = new FormData();
  
    formData.append("registration_number", registration_number);
    formData.append("email", email);
    formData.append("first_name", first_name);
    formData.append("last_name", last_name);
    formData.append("telephone", telephone);
  
    const formattedDate = moment(date_of_birth).format("YYYY-MM-DD");
    formData.append("date_of_birth", formattedDate);
  
    if (profileImage) {
      formData.append("profile_image", {
        uri: profileImage,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);
    }
  
    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/auth/profile/${userId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );
  
      if (response.ok) {
        // console.log("Profile updated successfully!");
        Alert.alert("Success", "Profile updated successfully!"); 
        navigation.goBack();
      } else {
        const errorData = await response.json();
        if (errorData.date_of_birth) {
          Alert.alert("Date Error", errorData.date_of_birth[0]);
        } else {
          // console.error("Failed to update profile:", errorData);
        }
      }
    } catch (error) {
      // console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFocus = (field: React.SetStateAction<string>) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField("");
  };
  const uploadImage = async (uri: string) => {
    const formData = new FormData();

    formData.append("image", {
      uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setProfileImage(uri);
      uploadImage(uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity>
          <Image
            source={require("@/assets/images/PrevacyBackground.png")}
            style={styles.HeaderImage}
          />
        </TouchableOpacity>
        <View style={styles.ProfileHeaderContainer}>
          <View style={styles.MyProfile}>
            <View style={styles.headerIcon}>
              <AntDesign
                name="left"
                size={23}
                color="#000"
                onPress={() => navigation.goBack()}
                style={styles.backIcon}
              />
            </View>
            <Text style={styles.profileText}>Privacy</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleEditProfile}
            >
              <Text>
                {loading ? (
                  <ActivityIndicator color="#27AE60" />
                ) : (
                  "Edit Profile"
                )}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileHeaderDetails}>
            <View style={styles.profileImagedet}>
              <TouchableOpacity
                style={styles.ProfileImageContainer}
                onPress={pickImage}
              >
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require("@/assets/images/profileImage.png")
                  }
                  style={styles.profileImage}
                />
              </TouchableOpacity>
              <Pressable style={styles.editButton}>
                <MaterialIcons name="edit" color="white" size={15} />
              </Pressable>
              <View>
  <Text style={styles.firstname}>
    {first_name || last_name ? `${first_name ?? ''} ${last_name ?? ''}`.trim() : 'No Name'}
  </Text>
</View>

            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainermain}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Form Fields */}
          <View style={styles.form}>
            {/* Name Input */}
            <Text style={styles.labelText}>First Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: !first_name
                    ? "red"
                    : focusedField === "first_name"
                    ? "#339206"
                    : "#ccc",
                },
              ]}
              placeholder="First Name"
              value={first_name}
              onChangeText={setfirst_name}
              onFocus={() => handleFocus("first_name")}
              onBlur={handleBlur}
            />

            <Text style={styles.labelText}>Last Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: !last_name
                    ? "red"
                    : focusedField === "last_name"
                    ? "#339206"
                    : "#ccc",
                },
              ]}
              placeholder="Last Name"
              value={last_name}
              onChangeText={setlast_name}
              onFocus={() => handleFocus("last_name")}
              onBlur={handleBlur}
            />

            <Text style={styles.labelText}>Registration Number</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: !registration_number
                    ? "red"
                    : focusedField === "registration_number"
                    ? "#339206"
                    : "#ccc",
                },
              ]}
              placeholder="registration_number"
              value={registration_number}
              onChangeText={setregistration_number}
              onFocus={() => handleFocus("registration_number")}
              onBlur={handleBlur}
            />
            {/* Email Input */}
            <Text style={styles.labelText}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor:
                    emailError || !email
                      ? "red"
                      : focusedField === "email"
                      ? "#339206"
                      : "#ccc",
                },
              ]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              onFocus={() => handleFocus("email")}
              onBlur={handleBlur}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <Text style={styles.labelText}>Telephone</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: !telephone
                    ? "red"
                    : focusedField === "telephone"
                    ? "#339206"
                    : "#ccc",
                },
              ]}
              placeholder="Telephone"
              value={telephone}
              onChangeText={setTelephone}
              onFocus={() => handleFocus("telephone")}
              onBlur={handleBlur}
            />
            <Text style={styles.labelText}>Role</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === "role" ? "#339206" : "#ccc",
                },
              ]}
              placeholder="Role"
              value={role}
            />

            <Text style={styles.labelText}>Joined Date</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor:
                    focusedField === "date_of_birth" ? "#339206" : "#ccc",
                },
              ]}
              placeholder="date of birth"
              value={date_of_birth}
              onChangeText={(text) => setdate_of_birth(text)} 

            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Privacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  HeaderImage: {
    width: "100%",
    height: 320,
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
  },
  backButton: {
    paddingHorizontal: 30,
  },
  menuButton: {
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    width: "30%",
    alignItems: "center",
  },
  MyProfile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ProfileHeaderContainer: {
    padding: 10,
    width: "100%",
    position: "absolute",
    top: 30,
  },
  profileText: {
    color: "white",
    fontWeight: "400",
    fontSize: 18,
    alignItems: "center",
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 50,
    objectFit:"cover"

  },
  ProfileImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  profileHeaderDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 50,
  },
  firstname: {
    fontSize: 20,
    fontWeight: "400",
    color: "##263238",
    marginBottom: 5,
  },
  Proffesion: {
    color: "#898989",
    fontSize: 12,
    fontWeight: "400",
  },
  profileImagedet: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  headerIcon: {
    width: 40,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  backIcon: {
    fontWeight: "bold",
  },
  scrollContainermain: {
    borderTopLeftRadius: 15,
    backgroundColor: "white",
    borderTopRightRadius: 15,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  form: {
    paddingHorizontal: 5,
  },
  labelText: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    width: "100%",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  showhideicon: {
    position: "absolute",
    right: 10,
    top: 35,
  },
  profileInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallText: {
    fontSize: 12,
    color: "#666",
  },
  editButton: {
    position: "relative",
    bottom: 40,
    left: 40,
    backgroundColor: "#339206",
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: "#fff",
    marginRight:20
  },
  profileImage1: {
    backgroundColor: "red",
  },
});
