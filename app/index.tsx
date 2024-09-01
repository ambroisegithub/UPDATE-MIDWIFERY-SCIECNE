import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
const OnBoarding = () => {
  const router = useRouter();
  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        router.push("./screen/Starter");
      }, 20000);

      return () => clearTimeout(timer);
    }, [router])
  );

  const renderContent = () => (
    <View style={styles.main}>
      <Image
        source={require("@/assets/images/muberarugoLogo1.png")}
        style={styles.logoImage}
      />
              <Text style={styles.muberarugotext}>CONTINUING PROFESSIONAL</Text>
              <Text style={styles.muberarugotext}>DEVELOPMENT</Text>
    </View>
  );

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#339206",
    alignItems: "center",
    justifyContent: "center", 
  },
  main: {
    alignItems: "center",
    justifyContent: "center",
  },
  muberarugotext: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
  logoImage: {
    width: 146,
    height: 154,
    alignItems:"center"
  }
});

export default OnBoarding;
