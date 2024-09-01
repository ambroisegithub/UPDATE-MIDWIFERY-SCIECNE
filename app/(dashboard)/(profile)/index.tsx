import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

interface Certificates {
  id: number;
  issued_date: string;
  user: {
    registration_number: string;
    first_name: string;
    last_name: string;
    email: string;
    telephone: string;
    date_of_birth: string;
    role: string;
    profile_image: string | null;
  };
  course: Course | null;
  exam: {
    id: number;
    course: number;
    title: string;
    total_marks: number;
    questions: {
      id: number;
      text: string;
      exam: number;
      answers: {
        id: number;
        question: number;
        text: string;
        is_correct: boolean;
      }[];
    }[];
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  course_image: string;
  instructor: {
    full_name: string;
  };
}

const Profile = () => {
  const navigation = useNavigation();
  const route = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificates[]>([]);

  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          const userId = await AsyncStorage.getItem("user_id");
          
          if (!userId) {
            route.push("/screen/Login");
            return;
          }

          await Promise.all([
            fetchCertificates(userId),
            fetchProfile(userId)
          ]);
        } catch (error) {
          // console.error("Authentication check error:", error);
          route.push("/screen/Login");
        } finally {
          setLoading(false);
        }
      };

      checkAuthStatus();
    }, [])
  );

  const fetchCertificates = async (userId: string) => {
    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/user/${userId}/certificates/`
      );
      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        )
      }
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/auth/profile/${userId}/`
      );
      const data = await response.json();

      setName(data.first_name ? `${data.first_name} ${data.last_name}` : "No Name");
      setRole(data.role || "No Role");
      setProfileImage(data.profile_image);
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        )
      }
    }
  };


  const navigateToAchivements = () => {
    route.push("/(dashboard)/Achievements");
  };

  const navigateToPrivacy = () => {
    route.push("/(dashboard)/(profile)/Privacy");
  };

  const logout = async () => {
    try {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              await AsyncStorage.multiRemove([
                "course_id",
                "selected_quiz_id",
                "user_data",
                "user_id",
                "license_number",
                "otp",
              ]);

              route.push("/screen/Login");
            }
          }
        ]
      );
    } catch (error) {
      // console.error("Error logging out:", error);
      Alert.alert("Logout Error", "An error occurred while logging out.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#27AE60" size="large"/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Image
          source={require("@/assets/images/mubdetails.png")}
          style={styles.HeaderImage}
        />
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
            <View style={styles.myProfileView}>
              <Text style={styles.profileText}>My Profile</Text>
            </View>
          </View>
          <View style={styles.profileHeaderDetails}>
            <View style={styles.profileImagedet}>
              <View style={styles.ProfileImageContainer}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require("@/assets/images/profileImage.png")
                  }
                  style={styles.profileImage}
                />
              </View>
              <View>
                <Text style={styles.firstname}>{name}</Text>
                <Text style={styles.Proffesion}>{role}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={navigateToPrivacy}>
              <Image source={require("@/assets/images/NotePencil.png")} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          style={styles.scrollContainermain}
          contentContainerStyle={{ ...styles.contentContainer, flexGrow: 1 }}
        >
          <View style={styles.summaryCard}>
            <View style={styles.achivementsView}>
              <Text style={styles.numberAmount}>{certificates.length}</Text>
              <Text style={styles.quantityTotal}>Achievements</Text>
            </View>

          </View>
          <View style={styles.DashboardContainer}>
            <View style={styles.subDashboardContainer}>
              <Text style={styles.Title}>Dashboard</Text>

              <Pressable
                style={styles.DashboardPart}
                onPress={navigateToAchivements}
              >
                <View style={styles.rowIcon}>
                  <View style={styles.iconContainer1}>
                    <Image source={require("@/assets/images/Reward.png")} />
                  </View>
                  <Text style={styles.dashbordtext}>Achievements</Text>
                </View>
                <TouchableOpacity style={styles.iconText}>
                  <Text style={styles.new}>{certificates.length} New</Text>
                  <TouchableOpacity>
                    <Feather
                      name="play"
                      style={styles.playIcon}
                      color="#ffffff"
                      size={17}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Pressable>
              <Pressable
                style={styles.DashboardPart}
                onPress={navigateToPrivacy}
              >
                <View style={styles.rowIcon}>
                  <View style={styles.iconContainer2}>
                    <Image source={require("@/assets/images/lock.png")} />
                  </View>
                  <Text style={styles.dashbordtext}>Privacy</Text>
                </View>
                <TouchableOpacity style={styles.iconText1}>
                  <Text style={styles.new}>Action Needed</Text>

                  <Feather
                    name="play"
                    style={styles.playIcon}
                    color="#ffffff"
                    size={17}
                  />
                </TouchableOpacity>
              </Pressable>
            </View>
          </View>
          <View style={styles.MyAccountContainerMain}>
            <View style={styles.MyAccountContainer}>
              <Text style={styles.Title}>My Account</Text>
              <TouchableOpacity onPress={logout}>
                <Text style={styles.LogoutAccount}>Logout Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  HeaderImage: {
    width: "100%",
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
  navigationText: {
    color: "#339206",
    fontWeight: "bold",
  },
  MyProfile: {
    flexDirection: "row",
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
    objectFit: "cover",
    borderRadius: 40,
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
  },
  Proffesion: {
    color: "#898989",
    fontSize: 15,
    fontWeight: "bold",
  },
  profileImagedet: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  numberAmount: {
    fontWeight: "400",
    fontSize: 18,
    alignItems: "center",
  },
  quantityTotal: {
    fontWeight: "400",
    fontSize: 10,
    color: "#898989",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
    marginLeft: 12,
  },
  backIcon: {
    fontWeight: "bold",
  },
  playIcon: {},
  DashboardPart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    paddingHorizontal: 10,
  },
  DashboardContainer: {
    padding: 20,
  },
  subDashboardContainer: {
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    borderColor: "#DADADA",
    paddingVertical: 10,
  },
  iconContainer: {
    backgroundColor: "#339206",
    borderRadius: 50,
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer1: {
    borderRadius: 50,
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1C40F",
  },
  iconContainer2: {
    borderRadius: 50,
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#828282",
  },

  dashbordtext: {
    fontSize: 14,
    fontWeight: "500",
  },
  rowIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  iconText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#3870FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  iconText1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FF683A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  new: {
    color: "white",
    fontSize: 12,
    fontWeight: "400",
  },
  MyAccountContainer: {
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    borderColor: "#DADADA",
    paddingVertical: 10,
  },
  MyAccountContainerMain: {
    padding: 20,
  },
  Title: {
    paddingLeft: 5,
    color: "#898A8D",
    fontWeight: "500",
    fontSize: 12,
    marginBottom:5
  },
  SwitchAnotherAccount: {
    color: "#3E5FAF",
    fontWeight: "500",
    fontSize: 14,
    alignItems: "center",
    padding: 5,
    paddingVertical: 10,
  },
  LogoutAccount: {
    color: "#FB6D64",
    fontWeight: "500",
    fontSize: 14,
    alignItems: "center",
    padding: 5,
  },
  scrollContainermain: {
    borderTopLeftRadius: 15,
    backgroundColor: "white",
    borderTopRightRadius: 15,
    paddingBottom: 10,
  },
  contentContainer: {
  },
  myProfileView: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "flex-end",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achivementsView:{
    alignItems:"center"
  }
});
