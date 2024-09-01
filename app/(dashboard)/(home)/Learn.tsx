import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { MaterialIcons } from "@expo/vector-icons";
interface Course {
  id: number;
  course_image: string;
  title: string;
  created_at: string;
  description: string;
  instructor: {
    full_name: string;
  };
}

const Learn = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "https://fcmc.muberarugo.org/api/courses/"
        );
        const data = await response.json();
        setCourses(data);
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

    fetchCourses();
  }, []);

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  const router = useRouter();

  const navigateToCourse = (courseId: number) => {
    router.push({
      pathname: "/(dashboard)/(home)/CourseOverView",
      params: { id: courseId },
    });
  };
  return (
    <View style={styles.container}>
      {/* Header */}
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

        </View>
      </View>
      <View style={styles.learnHomeImage}>
        <Image source={require("@/assets/images/learnHomeImage.png")} />
      </View>
      <Text style={styles.title}>Enroll Your Favourite Courses</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading courses...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.MainprogressContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {courses.map((course) => (
            <View key={course.id} style={styles.buttomContainerColumn}>
              <TouchableOpacity
                style={styles.buttomContainer}
                onPress={() => navigateToCourse(course.id)}
              >
                <View>
                  <Image
                    source={
                      course.course_image
                        ? { uri: course.course_image }
                        : require("@/assets/images/defaultCourseImage.png")
                    }
                    style={styles.courseImage}
                  />
                </View>

                <View>
                  <View>
                    <Text style={styles.courseTitle}>
                      {truncateTitle(course.title, 30)}
                    </Text>
                  </View>
                  <Pressable style={styles.completedCourse}>
                    <Text style={styles.createdAt}>
                      Instructor: {course.instructor.full_name}
                    </Text>
                  </Pressable>
                  <View style={styles.enrollContain}>
                    <TouchableOpacity
                      style={styles.enrollButton}
                      onPress={() => navigateToCourse(course.id)}
                    >
                      <Text style={styles.enrollButtontext}>View Course</Text>
                      <MaterialIcons
                        name="arrow-right-alt"
                        color="#ffffff"
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Learn;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    width: "100%",
    zIndex: 1,
    position: "absolute",
    top: 30,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#43463F",
  },
  courseList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    padding: 12,
    elevation: 3,
    borderColor: "#DADADA",
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  levelContainer: {
    backgroundColor: "#8BC34A",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 10,
    height: 60,
  },
  levelContainer2: {
    backgroundColor: "#FBB237",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 10,
    height: 60,
  },
  levelContainer3: {
    backgroundColor: "#FF4B4C",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 10,
    height: 60,
  },
  levelText: {
    color: "#fff",
    fontWeight: "medium",
    fontSize: 10,
  },
  headertext: {
    fontSize: 18,
    color: "#43463F",
    fontWeight: "semibold",
    paddingBottom: 1,
  },
  completedText: {
    color: "#898A8D",
    fontSize: 12,
    fontWeight: "bold",
  },
  courseContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  hourstext: {
    color: "#50555C",
    fontSize: 12,
    fontWeight: "semibold",
    paddingBottom: 2,
  },
  courseTime: {
    fontSize: 14,
    color: "#888",
    marginVertical: 5,
  },
  progressText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 10,
  },
  navText: {
    fontSize: 12,
    color: "#A8A8A8",
    textAlign: "center",
  },
  learnHomeImage: {
    width: "100%",
    paddingTop: 30,
    paddingHorizontal: 10,
  },
  MyProfile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
  },
  basicofLevel: {},
  MainprogressContainer: {
    padding: 10,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },

  buttomContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "space-around",
    gap: 20,
  },
  buttomContainerColumn: {
    flexDirection: "column",
    elevation: 3,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: "#CDCDCD",
    backgroundColor: "white",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  containerBottom: {
    paddingHorizontal: 6,
    paddingVertical: 10,
  },

  courseImage: {
    width: 65,
    height: 70,
    objectFit: "cover",
  },
  createdAt: {
    fontSize: 12,
    color: "#777",
    fontWeight: "bold",
  },
  completedCourse: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  enrollButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 15,
    borderRadius: 40,
    cursor: "pointer",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  enrollButtontext: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
  },
  EnrolledText: {
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
    borderBottomColor: "#2ecc71",
    borderBottomWidth: 3,
    width: "30%",
    justifyContent: "center",
  },
  EnrolledView: {
    width: "100%",
    alignItems: "center",
  },
  enrollContain: {
    width: "55%",
    alignItems: "center",
    marginTop: 5,
  },
});
