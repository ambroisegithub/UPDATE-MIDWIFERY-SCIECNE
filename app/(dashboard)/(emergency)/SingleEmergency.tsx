
// @ts-nocheck
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { Audio } from "expo-av";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { format } from "date-fns";

interface EmergencyFile {
  file_type: string;
  file_url: string;
  description: string;
}

interface Emergency {
  id: number;
  title: string;
  created_at: string;
  description: string;
  files: EmergencyFile[];
}

function getFileTypeIcon(file_type: string): string {
  switch (file_type) {
    case "pdf":
      return "pdffile1";
    case "video":
      return "videocamera";
    case "audio":
      return "sound";
    default:
      return "file-o";
  }
}

const SingleEmergency = () => {
  const { id } = useLocalSearchParams();
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<EmergencyFile | null>(null);
  const video = useRef(null);
  const audioPlayer = useRef(new Audio.Sound());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const navigation = useNavigation();

  useEffect(() => {
    fetchEmergency();
    return () => {
      unloadAudio();
    };
  }, [id]);

  const fetchEmergency = async () => {
    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/emergency/${id}/`
      );
      const data = await response.json();
      setEmergency(data);
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

  const handleFileOpen = async (file: EmergencyFile) => {
    setSelectedFile(file);
    const fileUrl = `https://fcmc.muberarugo.org${file.file_url}`;

    switch (file.file_type) {
      case "pdf":
        await Linking.openURL(fileUrl);
        break;
      case "video":
      case "audio":
        setModalVisible(true);
        break;
    }
  };

  const handlePlayPauseAudio = async () => {
    try {
      const status = await audioPlayer.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await audioPlayer.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await audioPlayer.current.playAsync();
          setIsPlaying(true);
        }
      } else if (selectedFile) {
        await audioPlayer.current.loadAsync(
          { uri: `https://fcmc.muberarugo.org${selectedFile.file_url}` },
          { shouldPlay: true }
        );
        setIsPlaying(true);
      }
    } catch (error) {
      // console.error("Error handling audio:", error);
    }
  };

  const unloadAudio = async () => {
    try {
      await audioPlayer.current.unloadAsync();
    } catch (error) {
      // console.error("Error unloading audio:", error);
    }
  };


  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#23A64A" />
      </View>
    );
  }

  const truncateDescription = (description: string, maxLength: number) => {
    return description.length > maxLength ? description.slice(0, maxLength) + "..." : description;
  };

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
            <Text style={styles.emergencytext}>Emergencies</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{emergency?.title}</Text>
          <Text style={styles.date}>
            {format(new Date(emergency?.created_at), "MMM dd, yyyy")}
          </Text>
          <Text style={styles.description}>{emergency?.description}</Text>
          <View style={styles.filesSection}>
            <Text style={styles.sectionTitle}>Attached Files</Text>
            {emergency?.files.length > 0 ? (
              emergency.files.map((file, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fileCard}
                  onPress={() => handleFileOpen(file)}
                >
                  <View style={styles.fileInfo}>
                    <View style={styles.fileIconContainer}>
                      <AntDesign
                        name={getFileTypeIcon(file.file_type)}
                        size={24}
                        color="#23A64A"
                      />
                    </View>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName}>{truncateDescription(file.description, 120)}
                      </Text>
                      <Text style={styles.fileMetadata}>
                        {file.file_type.toUpperCase()} 
                      </Text>
                    </View>
                    <MaterialIcons
                      name="play-circle-outline"
                      size={32}
                      color="#23A64A"
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noFileText}>No file attached</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedFile?.description}</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setIsPlaying(false);
                  unloadAudio();
                }}
              >
                <AntDesign name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {selectedFile?.file_type === "video" && (
              <Video
                ref={video}
                style={styles.modalVideo}
                source={{
                  uri: `https://fcmc.muberarugo.org${selectedFile.file_url}`,
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
            )}

            {selectedFile?.file_type === "audio" && (
              <View style={styles.modalAudioPlayer}>
                <TouchableOpacity
                  style={styles.audioControl}
                  onPress={handlePlayPauseAudio}
                >
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={64}
                    color="#23A64A"
                  />
                </TouchableOpacity>
                <Text style={styles.audioProgress}>
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    zIndex: 1,
    position: "absolute",
    top: 0,
    backgroundColor: "#f5f5f5",
    paddingVertical: 25,
  },

  MyProfile: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 70,
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

  placeholder: {
    width: 40,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 90,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 24,
  },
  filesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  fileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  fileMetadata: {
    fontSize: 12,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 16,
  },
  modalVideo: {
    width: "100%",
    height: 300,
    borderRadius: 12,
  },
  modalAudioPlayer: {
    alignItems: "center",
    padding: 20,
  },
  audioControl: {
    marginBottom: 20,
  },
  audioProgress: {
    fontSize: 16,
    color: "#666",
  },
  noFileText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },

  emergencytext: {
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default SingleEmergency;
