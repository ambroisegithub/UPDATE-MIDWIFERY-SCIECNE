import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions ,Pressable} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For print icon
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
const { width } = Dimensions.get("window");

const ReadingPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AntDesign
          name="left"
          size={23}
          color="#000"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerText}>
          Course syllabus for Introduction to Reproduction
        </Text>
        <Pressable>
        <Ionicons
          name="print-outline"
          size={24}
          color="#000"
          onPress={generatePdf}
          accessibilityLabel="Print"
        />
        </Pressable>

      </View>

      <Text style={styles.shortTitle}>
        This course provides an in-depth understanding of the basics of reproduction health. You'll explore essential topics that guide you from fundamental concepts to an advanced comprehension of the subject, ensuring a holistic learning experience by the end.
      </Text>

      <Text style={styles.moduleTitle}>Module 1: Introduction to Reproduction Health</Text>
      <Text style={styles.moduleDescription}>
        In this module, you will be introduced to the key concepts of reproduction health. You'll explore the physiological and biological aspects that form the foundation of reproductive health knowledge.
      </Text>
      <Text style={styles.listItem}>1. Understand the human reproductive system.</Text>
      <Text style={styles.listItem}>2. Identify the stages of human reproduction.</Text>
      <Text style={styles.listItem}>3. Explore factors affecting reproductive health.</Text>

      <Text style={styles.moduleTitle}>Module 2: Advanced Reproductive Health</Text>
      <Text style={styles.moduleDescription}>
        This module delves deeper into advanced topics, covering common reproductive health issues, preventive strategies, and current global trends in reproductive health research.
      </Text>
      <Text style={styles.listItem}>1. Understand reproductive health disorders.</Text>
      <Text style={styles.listItem}>2. Explore advanced techniques in reproductive health management.</Text>
      <Text style={styles.listItem}>3. Learn about modern contraception methods.</Text>

    </View>
  );
};

const htmlContent = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #ffffff;
      }
      h1 {
        font-weight: bold;
        font-size: 16px;
        text-align: center;
      }
      h2 {
        font-size: 16px;
        font-weight: bold;
        margin-top: 20px;
        padding-bottom: 5px;
      }
      p {
        font-size: 14px;
        font-weight: 600;
        padding: 10px 0;
        text-align: justify;
      }
      ul {
        padding-left: 20px;
      }
      li {
        font-size: 14px;
        padding-left: 10px;
        padding-vertical: 2px;
      }
    </style>
  </head>
  <body>
    <h1>Course syllabus for Introduction to Reproduction</h1>
    <p>This course provides an in-depth understanding of the basics of reproduction health. You'll explore essential topics that guide you from fundamental concepts to an advanced comprehension of the subject, ensuring a holistic learning experience by the end.</p>
    <h2>Module 1: Introduction to Reproduction Health</h2>
    <p>In this module, you will be introduced to the key concepts of reproduction health. You'll explore the physiological and biological aspects that form the foundation of reproductive health knowledge.</p>
    <ul>
      <li>1. Understand the human reproductive system.</li>
      <li>2. Identify the stages of human reproduction.</li>
      <li>3. Explore factors affecting reproductive health.</li>
    </ul>
    <h2>Module 2: Advanced Reproductive Health</h2>
    <p>This module delves deeper into advanced topics, covering common reproductive health issues, preventive strategies, and current global trends in reproductive health research.</p>
    <ul>
      <li>1. Understand reproductive health disorders.</li>
      <li>2. Explore advanced techniques in reproductive health management.</li>
      <li>3. Learn about modern contraception methods.</li>
    </ul>
  </body>
</html>
`;

const generatePdf = async () => {
    const file = await printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    await shareAsync(file.uri);
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  shortTitle: {
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 10,
    textAlign: "justify",
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    paddingBottom: 5,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#333",
    paddingBottom: 10,
  },
  listItem: {
    fontSize: 14,
    paddingLeft: 10,
    paddingVertical: 2,
  },
});

export default ReadingPage;
