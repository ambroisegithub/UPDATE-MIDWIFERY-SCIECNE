import React, { useState, useRef,useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";

import {
  Video,
  ResizeMode,
  AVPlaybackStatus,
} from "expo-av";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
const { width } = Dimensions.get("window");
interface Lesson {
  id: number;
  title: string;
  video_url: string;
  content: string;
  pdf_file: string;
  created_at: string;
}

const Course = () => {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [selectedTab, setSelectedTab] = useState<"transcript" | "summary">(
    "transcript"
  );
  const { id } = useLocalSearchParams(); 


  const navigation = useNavigation();
  useEffect(() => {
    const getCourseIdAndFetchLessons = async () => {
      try {
        const storedCourseId = await AsyncStorage.getItem("course_id");        
        if (storedCourseId) {
          setCourseId(Number(storedCourseId));
  
          const response = await fetch(
            `https://fcmc.muberarugo.org/api/lessons/${id}/`
          );
  
          if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            // throw new Error(`Unexpected content type: ${contentType}`);
          }
  
          const data = await response.json();           
          setLessons(data);
  
          if (data.length > 0) {
            setCurrentLesson(data[0]);
          }
  
          await AsyncStorage.removeItem("course_id");
        }
      } catch (error: any) {
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
  
    getCourseIdAndFetchLessons();
  }, []);
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
      </View>
    );
  }

  if (!currentLesson) {
    return (
      <View style={styles.errorContainer}>
        <Text>No lessons available for this course.</Text>
      </View>
    );
  }
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
          <Text style={styles.overViewtext}>Single  Lesson</Text>
        </View>
        <View>
          <Ionicons name="heart-outline" size={23} color="black" />
        </View>
      </View>
      <View style={styles.videoContainer}>
        
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: currentLesson.video_url,
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={(status) => setStatus(status)}
        />
      </View>

      <View style={styles.courseInfo}>
      <Text style={styles.courseTitle}>{currentLesson.title}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.courseDetails}>⏰ 6h 30min • 28 lessons</Text>
          <Text style={styles.ratingText}>4.9</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "transcript" && styles.activeTab,
          ]}
          onPress={() => setSelectedTab("transcript")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "transcript" && styles.activeTabText,
            ]}
          >
            Transcript
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

      {selectedTab === "transcript" ? (
        <View>
          <View style={styles.transcriptOverView}>
            <Text style={styles.transcripttextactive}>00:00</Text>
            <View>
              <Text style={styles.transcripttextactive}>
                This course provides an in-depth understanding of the basics of
                reproduction health. You will learn about various topics that
                cover everything from initial concepts to advanced
                understanding, ensuring comprehensive knowledge by the end.
              </Text>
            </View>
          </View>
          <View style={styles.transcriptOverView}>
            <Text style={styles.transcripttext}>00:15</Text>
            <View>
              <Text style={styles.transcripttext}>
                This course provides an in-depth understanding of the basics of
                reproduction health. You will learn about various topics that
                cover everything from initial concepts to advanced
                understanding, ensuring comprehensive knowledge by the end.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            This course provides an in-depth understanding of the basics of
            reproduction health. You will learn about various topics that cover
            everything from initial concepts to advanced understanding, ensuring
            comprehensive knowledge by the end.
          </Text>
        </View>
      )}
      <View style={styles.courseButtonContainer}>
        <TouchableOpacity style={styles.NextButton}>
          <Text style={styles.nexttext}>Next</Text>
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
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  courseInfo: {
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
  transcriptContainer: {
    paddingBottom: 16,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  playIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#23A64A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playIconText: {
    color: "#fff",
    fontSize: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    color: "#333",
  },
  lessonDuration: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  nextIcon: {
    fontSize: 28,
    color: "#23A64A",
    fontWeight: "bold",
  },
  summaryContainer: {
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },

  MyProfile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
  },
  headerIcon: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    elevation: 3,
  },
  overViewtext: {
    fontSize: 16,
    fontWeight: "medium",
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
  courseButtonContainer: {
    position: "absolute",
    bottom: 10,
    right: 20,
    backgroundColor: "#23A64A",
    paddingHorizontal: 25,
    paddingVertical: 6,
    borderRadius: 3,
  },
  NextButton: {
    display: "flex",
    justifyContent: "flex-end",
  },
  nexttext: {
    fontSize: 12,
    color: "white",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default Course;
