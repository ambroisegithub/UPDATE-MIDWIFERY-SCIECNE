import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Starter = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [focusedButton, setFocusedButton] = useState<string>("login");

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const userData = await AsyncStorage.getItem("user_data");
      const userId = await AsyncStorage.getItem("user_id");
      if (userData && userId) {
        router.push("/(dashboard)/(home)");
      }
    };
    checkUserLoggedIn();
  }, []);

  const handlePressIn = (buttonName: string) => {
    setFocusedButton(buttonName);
  };

  const renderContent = () => (
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
        <Text style={styles.muberarugotext}>CONTINUING PROFESSIONAL</Text>
        <Text style={styles.muberarugotext}>DEVELOPMENT</Text>

      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.line}></View>
        <View style={styles.welcomeView}>
        <Text style={styles.welcomeText}>Welcome to Comprehensive</Text>
        <Text style={styles.welcomeText}>Women's Health and Midwifery</Text>
        </View>
        <View style={styles.LearnView}>
        <Text style={styles.learnText1}>Explore In-Depth Courses on</Text>
        <Text style={styles.learnText}>Family-Centered Women's Care</Text>
        </View>

        <View style={styles.ButtonContainer1}>

          <Pressable
            style={[
              styles.registerloginContainer,
              focusedButton === "login" && styles.focusedButton,
            ]}
            onPressIn={() => handlePressIn("login")}
            onPress={() => router.push("/screen/Login")}
          >
            <Text
              style={[
                styles.buttonText,
                focusedButton === "login" && styles.focusedText,
              ]}
            >
              Login
            </Text>
            <Feather
              name="play"
              style={[
                styles.icon,
                focusedButton === "login" && styles.focusedIcon,
              ]}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  main: {
    flex: 1,
  },
  headerIcon: {
    flexDirection: "row",
    width: 40,
    alignItems: "center",
    margin:50,
    justifyContent:"center",
    marginLeft:20,
    paddingVertical:8,
    paddingHorizontal:8,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",          
    shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.3,           
    shadowRadius: 5,               
    elevation: 10, 
    marginBottom:0 
  },
  backIcon: {
    fontWeight: "bold",
  },
  ImageContainer: {
    alignItems: "center",
  },
  muberarugotext: {
    color: "#339206",
    fontSize: 25,
    fontWeight: "bold",
    alignItems:"center",
    justifyContent:"center"
  },
  muberarugoContainer:{
    alignItems:"center",
    justifyContent:"center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#339206",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingTop:10
  },
  welcomeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  line: {
    backgroundColor: "white",
    width: "25%",
    height: 5,
    borderRadius: 20,
    marginBottom: 45,
  },
  welcomeView: {
    alignItems: "center",
  },
  LearnView: {
    marginTop: 20,
    marginBottom: 35,
  },
  learnText: {
    color: "white",
    fontWeight: "bold",
    lineHeight: 23,
  },
  learnText1: {
    marginLeft: 5,
    color: "white",
    fontWeight: "bold",
  },
  ButtonContainer1: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%",
    marginTop: 10,
    alignItems:"center",
    paddingBottom:40
  },
  registerloginContainer: {
    flexDirection: "row",
    borderTopRightRadius: 30,
    alignItems: "center",
    padding: 15,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginRight: 10,
    fontWeight: "bold",
  },
  icon: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  focusedButton: {
    backgroundColor: "white",
  },
  focusedText: {
    color: "#339206",
    fontWeight: "bold",
  },
  focusedIcon: {
    color: "#339206",
    fontWeight: "bold",
  },
});

export default Starter;
