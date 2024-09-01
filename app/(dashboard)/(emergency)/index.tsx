import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { router, useNavigation } from "expo-router";
import AntDesign from "react-native-vector-icons/AntDesign";
import { format } from "date-fns";
interface Emergency {
  id: number;
  title: string;
  description: string;
  created_at: string;
  files: { file_type: string }[];
}

const { width } = Dimensions.get("window");

const Emergencies = () => {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await fetch("https://fcmc.muberarugo.org/api/emergency/");
      const data = await response.json();
      setEmergencies(data.emergencies);
      setLoading(false);
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        );
      }
      setLoading(false);
    }
  };

  const navigateToSingleEmergency = (emergency_id: number) => {
    router.push({
      pathname: "/(dashboard)/(emergency)/SingleEmergency",
      params: { id: emergency_id },
    });
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "pdffile1";
      case "video":
        return "videocamera";
      case "audio":
        return "sound";
      default:
        return "file-o";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
        <Text style={styles.loadingText}>Loading emergencies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
          <View>
            <Text style={styles.emergencytext}>
              Emergencies
            </Text>
          </View>

        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {emergencies.map((emergency) => (
          <TouchableOpacity
            key={emergency.id}
            style={styles.emergencyCard}
            onPress={() => navigateToSingleEmergency(emergency.id)}
          >
            <View style={styles.emergencyHeader}>
              <Text style={styles.emergencyTitle}>{emergency.title}</Text>
            </View>

            <Text style={styles.emergencyDescription} numberOfLines={2}>
              {emergency.description}
            </Text>
            <Text style={styles.emergencyDate}>
                {format(new Date(emergency.created_at), "MMM dd, yyyy")}
              </Text>

            {emergency.files && emergency.files.length > 0 && (
              <View style={styles.filesContainer}>
                {emergency.files.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <AntDesign
                      name={getFileTypeIcon(file.file_type)}
                      size={16}
                      color="#666"
                    />
                    <Text style={styles.fileType}>{file.file_type}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    width: "100%",
    zIndex: 1,
    position: "absolute",
    top: 0,
    backgroundColor: "#f5f5f5",
    paddingVertical:30
    
  },

  MyProfile: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap:70
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

  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop:80
  },
  emergencyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  emergencyDate: {
    fontSize: 14,
    color: "#666",
  },
  emergencyDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 12,
  },
  filesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  fileType: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  emergencytext:{
    fontWeight:"bold",
    fontSize:18
  }
});

export default Emergencies;