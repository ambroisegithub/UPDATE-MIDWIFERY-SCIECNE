import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const ChooseLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const router = useRouter();
  const navigation = useNavigation();

  const languages: string[] = ["English", "Kinyarwanda", "Kiswahili", "Arabic", "French"];

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
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
      <View style={styles.chooseLanguageView}>
        <Text style={styles.chooseLanguageText}>Choose Language</Text>
        
        {languages.map((language, index) => (
          <Pressable
            key={index}
            style={[
              styles.languageButton,
              selectedLanguage === language && styles.languageButtonSelected
            ]}
            onPress={() => handleLanguageSelect(language)}
          >
            <Text
              style={[
                styles.languageText,
                selectedLanguage === language && styles.languageTextSelected
              ]}
            >
              {language}
            </Text>
          </Pressable>
        ))}

        <Pressable style={styles.languageButtonNext} onPress={()=>{
            router.push("/screen/Starter")
        }}>
          <Text style={styles.languageTextNext}>Next</Text>
        </Pressable>
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
  main: {},
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
  },
  backIcon: {
    fontWeight: "bold",
  },
  chooseLanguageView: {
    alignItems: "center",
  },
  chooseLanguageText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#273958",
  },
  languageButton: {
    backgroundColor: "white",
    borderRadius: 40,
    width: "85%",
    alignItems: "center",
    padding: 13,
    marginTop: 30,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#339206",
  },
  languageButtonSelected: {
    backgroundColor: "#339206",
  },
  languageText: {
    color: "#339206",
    fontSize: 20,
    fontWeight: "bold",
  },
  languageTextSelected: {
    color: "white",
  },
  languageButtonNext: {
    backgroundColor: "#339206",
    width: "40%",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  languageTextNext:{
    color:"white",
    fontSize: 20,
    fontWeight: "bold",
  }
});

export default ChooseLanguage;
