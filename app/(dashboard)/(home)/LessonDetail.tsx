import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Linking
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Video, ResizeMode, Audio } from "expo-av";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface Lesson {
  id: number;
  title: string;
  readings?: string;
  content?: string;
  pdf_file?: string | null;
  video_file?: string;
  audio_file?: string;
  created_at: string;
}

const LessonDetail = () => {
  const { id } = useLocalSearchParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("resources");
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const video = useRef(null);
  const audioPlayer = useRef(new Audio.Sound());
  const navigation = useNavigation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/lessons/${id}/`
        );
        const data = await response.json();
        setLesson(data);
        setLoading(false);
      } catch (error:any) {
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          )
        }
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);
  const handlePlayPauseAudio = async () => {
    try {
      const status = await audioPlayer.current.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await audioPlayer.current.pauseAsync();
          if (timerRef.current !== null) {
            clearInterval(timerRef.current);
          }
          setIsPlaying(false);
        } else {
          await audioPlayer.current.playAsync();
          startTimer();
          setIsPlaying(true);
        }
      } else if (lesson?.audio_file && !isPlaying) {
        await audioPlayer.current.loadAsync(
          { uri: lesson.audio_file },
          { shouldPlay: true }
        );
        const loadedStatus = await audioPlayer.current.getStatusAsync();
        if (loadedStatus.isLoaded) {
          setDuration(loadedStatus.durationMillis! / 1000);
        }
        startTimer();
        setIsPlaying(true);
      } else {
        // console.error("Audio file is not available or cannot be played");
      }
    } catch (error: any) {
      if (error.message.includes("already loading")) {
        Alert.alert("Audio is still loading, please wait");
      } else {
      }
    }
  };

  const startTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(async () => {
      const status = await audioPlayer.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        setCurrentTime(status.positionMillis! / 1000);
      }
    }, 1000);
  };

  const unloadAudio = async () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    await audioPlayer.current.unloadAsync();
  };

  useEffect(() => {
    return () => {
      unloadAudio();
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#23A64A" />
      </View>
    );
  }

  const markLessonCompleted = async () => {
    setMarkingComplete(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const storedLessonId = await AsyncStorage.getItem("selected_lesson_id");
      // console.log("Lesson Id", storedLessonId);

      if (!userId || !storedLessonId) {
        Alert.alert("Error", "Missing user or Lesson information");
        return;
      }
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/lessons/${storedLessonId}/complete/${userId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            item_id: parseInt(storedLessonId),
          }),
        }
      );

      const data = await response.json();
      // console.log("Mark Lesson Completed Request Data:", data);

      if (response.ok) {
        Alert.alert("Success", "Lesson marked as complete!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),

          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to mark Lesson as complete");
      }
    } catch (error) {
      // console.error("Error marking Lesson as complete:", error);
      Alert.alert("Error", "Failed to mark Lesson as complete");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleOpenResource = async (fileUrl: string, fileType: string) => {
    try {
      const fullUrl = `${fileUrl}`;
      
      if (Platform.OS === 'ios') {
        await Linking.openURL(fullUrl);
      } else {
        await Linking.openURL(fullUrl);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to open the file. Please try again later."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.MyProfile}>
        <View style={styles.headerIcon}>
          <AntDesign
            name="left"
            size={23}
            color="#000"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          />
        </View>
        <View>
          <Text style={styles.overViewtext}>
            {lesson?.title || "Single Lesson"}
          </Text>
        </View>

      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          {lesson?.video_file ? (
            <Video
              ref={video}
              style={styles.video}
              source={{ uri: lesson.video_file }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={(status) => setStatus(status)}
            />
          ) : (
            <Text style={styles.noVideoText}>No video available</Text>
          )}
        </View>

        {lesson?.audio_file && (
          <View style={styles.audioContainer}>
            <TouchableOpacity
              style={styles.audioControl}
              onPress={handlePlayPauseAudio}
            >
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={40}
                color="#23A64A"
              />
            </TouchableOpacity>
            <Text style={styles.audioProgress}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>
        )}

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{lesson?.title}</Text>

        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "resources" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("resources")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "resources" && styles.activeTabText,
              ]}
            >
              Resources
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "summary" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("summary")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "summary" && styles.activeTabText,
              ]}
            >
              Summary
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === "resources" ? (
          <View style={styles.resourcesContainer}>
            {lesson?.pdf_file && (
              <TouchableOpacity
                style={styles.resourceItem}
                onPress={() => handleOpenResource(lesson.pdf_file!, 'pdf')}
              >
                <Ionicons name="document-text" size={24} color="#23A64A" />
                <Text style={styles.resourceText}>Course Document</Text>
                <AntDesign name="download" size={20} color="#777" />
              </TouchableOpacity>
            )}
            {lesson?.video_file && (
              <TouchableOpacity
                style={styles.resourceItem}
                onPress={() => handleOpenResource(lesson.video_file!, 'video')}
              >
                <Ionicons name="videocam" size={24} color="#23A64A" />
                <Text style={styles.resourceText}>Course Video</Text>
                <AntDesign name="download" size={20} color="#777" />
              </TouchableOpacity>
            )}
            {lesson?.audio_file && (
              <TouchableOpacity
                style={styles.resourceItem}
                onPress={() => handleOpenResource(lesson.audio_file!, 'audio')}
              >
                <Ionicons name="musical-notes" size={24} color="#23A64A" />
                <Text style={styles.resourceText}>Course Audio</Text>
                <AntDesign name="download" size={20} color="#777" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {lesson?.readings || "Summary not available."}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.courseButtonContainer}>
        <TouchableOpacity
          style={styles.NextButton}
          onPress={markLessonCompleted}
          disabled={markingComplete}
        >
          <Text style={styles.nexttext}>
            {markingComplete ? "Marking..." : "Mark As Complete"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.NextButton}
            onPress={() => navigation.goBack()}
        >
          <Text style={styles.nexttext}>Back To Next Lesson</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
    width: "100%",
    paddingBottom: 50,
  },
  MyProfile: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
    gap:10
  },
  headerIcon: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    elevation: 3,
  },
  overViewtext: {
    fontSize: 16,
    fontWeight: "500",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  noVideoText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
  courseInfo: {
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 18,
    color: "#333",
  },
  courseDetails: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  ratingContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },
  ratingText: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: "#23A64A",
  },
  tabText: {
    fontSize: 16,
    color: "#777",
  },
  activeTabText: {
    color: "#23A64A",
    fontWeight: "bold",
  },
  transcriptOverView: {
    flexDirection: "row",
    gap: 10,
    width: "90%",
    marginBottom: 10,
  },
  transcripttext: {
    fontSize: 12,
    fontWeight: "400",
    color: "#777",
  },
  transcripttextactive: {
    color: "#23A64A",
    fontSize: 12,
    fontWeight: "400",
  },
  summaryContainer: {
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  courseButtonContainer: {
    position: "absolute",
    bottom: 10,
    paddingVertical: 6,
    borderRadius: 3,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingLeft: 20,
  },
  NextButton: {
    backgroundColor: "#23A64A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  nexttext: {
    fontSize: 11,
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  audioControl: {
    marginRight: 10,
  },
  audioProgress: {
    fontSize: 16,
    color: "#777",
  },
  resourcesContainer: {
    padding: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  resourceText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default LessonDetail;
