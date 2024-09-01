import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
interface User {
  date_of_birth: string;
  email: string;
  first_name: string;
  last_name: string;
  registration_number: string;
  role: string;
  telephone: string;
}

interface CourseDetails {
  id: number;
  course_image: string | null;
  title: string;
  description: string;
  created_at: string;
  instructor: {
    full_name: string;
    email: string;
    id: number;
    registration_number: string;
    telephone: string;
  };
}

interface EnrolledCourse {
  id: number;
  course: CourseDetails;
  date_enrolled: string;
  user: User;
}
interface CompletedCourse {
  course__id: number;
  course__title: string;
}

interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface CourseInProgress {
  course_id: number;
  course_title: string;
  course_description: string;
  course_image: string | null;
  instructor: Instructor;
}

const Home = () => {
  const router = useRouter();

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>(
    []
  );
  const [InprogressCourses, setInprogressCourses] = useState<
    CourseInProgress[]
  >([]);
  const [loaded] = useFonts({
    UrbanistBold: require("@/assets/fonts/Lexend-VariableFont_wght.ttf"),
  });
  const [userId, setUserId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(true);
  const [loadingInprogress, setLoadingInprogress] = useState(true);

  const fetchCourses = async () => {
    if (userId !== null) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/user/${userId}/enrollments/`
        );
        const data = await response.json();
        // console.log("Enrolled course:", data);
        setCourses(Array.isArray(data) ? data : []);
      } catch (error: any) {
        // console.error("Error fetching courses:", error);
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          );
        }
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("user_id");
        if (id) setUserId(JSON.parse(id));
      } catch (error) {
        // console.error("Error retrieving user ID from storage:", error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("user_data");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setFullName(parsedUserData.user.full_name);
        }
      } catch (error) {
        // console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCourses();
    }, [userId])
  );

  if (!loaded) {
    return null;
  }

  const fetchCompletedCourses = async () => {
    const storedUserId = await AsyncStorage.getItem("user_id");
    if (storedUserId) {
      setLoadingCompleted(true);
      try {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/completed-courses/${storedUserId}/`
        );
        const data = await response.json();
        setCompletedCourses(
          Array.isArray(data?.completed_courses) ? data.completed_courses : []
        );
      } catch (error: any) {
        // console.error("Error fetching completed courses:", error);
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          );
        }
        setCompletedCourses([]);
      } finally {
        setLoadingCompleted(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCompletedCourses();
    }, [userId])
  );

  const fetchCoursesInProgress = async () => {
    const storedUserId = await AsyncStorage.getItem("user_id");
    if (storedUserId) {
      setLoadingInprogress(true);
      try {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/in-progress/${storedUserId}/`
        );
        const data = await response.json();
        // console.log("Course In Progress", data);
        setInprogressCourses(
          Array.isArray(data?.courses_in_progress)
            ? data.courses_in_progress
            : []
        );
      } catch (error: any) {
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          );
        }
        setInprogressCourses([]);
      } finally {
        setLoadingInprogress(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCoursesInProgress();
    }, [userId])
  );

  const navigateToCourse = (courseId: number) => {
    router.push({
      pathname: "/(dashboard)/(home)/CourseOverView",
      params: { id: courseId },
    });
  };

  const navigateToCourseAll = () => {
    router.push("/(dashboard)/(home)/Learn");
  };

  const navigateToCompletedCorses = () => {
    router.push("/(dashboard)/(home)/CompletedCourse");
  };
  const navigateToInProgressCourses = () => {
    router.push("/(dashboard)/(home)/courseInProgress");
  };

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <View style={styles.mainone}>
          <Text style={styles.textname1}>Hi, {fullName}!</Text>
          <Text style={styles.textname}>What's your favorite</Text>
          <Text style={styles.textnameone}>
            course you would like to learn?
          </Text>
        </View>
        <View style={styles.mainTwo}>
          <Image source={require("@/assets/images/muberadashHomePage.png")} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainermain}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.subTitleSection}>
          <View style={styles.line} />
          <View>
            <Text style={styles.CourseBeing}>Courses Being Learned</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.courseCard}>
            <TouchableOpacity
              style={[styles.CompletedCourseCard, styles.completedCard]}
              onPress={navigateToCompletedCorses}
            >
              {loadingCompleted ? (
                <Text style={styles.loadingText}>
                  <ActivityIndicator size="large" color="#ffff" />
                </Text>
              ) : completedCourses.length === 0 ? (
                <Text style={styles.loadingText}>No courses completed yet</Text>
              ) : (
                <>
                  <Text style={styles.completedText}>Course Completed</Text>
                  <View style={styles.iconsContainer}>
                    <Text style={styles.courseNumber}>
                      {completedCourses.length}
                    </Text>
                    <TouchableOpacity style={styles.iconContainer}>
                      <Feather name="play" style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.CompletedCourseCard, styles.completedCard]}
              onPress={navigateToInProgressCourses}
            >
              {loadingInprogress ? (
                <Text style={styles.loadingText}>
                  <ActivityIndicator size="large" color="#ffff" />
                </Text>
              ) : InprogressCourses.length === 0 ? (
                <Text style={styles.loadingText}>
                  No courses In Progress yet
                </Text>
              ) : (
                <>
                  <Text style={styles.completedText}>Course In Progess</Text>
                  <View style={styles.iconsContainer}>
                    <Text style={styles.courseNumber}>
                      {InprogressCourses.length}
                    </Text>
                    <TouchableOpacity style={styles.iconContainer}>
                      <Feather name="play" style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.containerBottom}>
          <View style={styles.RecommendContainer}>
            <TouchableOpacity
              style={styles.RecommendButton}
              onPress={navigateToCourseAll}
            >
              <Text style={styles.Recommendtext}>View All Courses</Text>
              <AntDesign
                name="arrowright"
                color="#ffffff"
                size={20}
              ></AntDesign>
            </TouchableOpacity>
          </View>
          <View style={styles.EnrolledView}>
            <Text style={styles.EnrolledText}>Enrolled Courses</Text>
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Loading courses...</Text>
          ) : courses.length === 0 ? (
            <View style={styles.noCoursesContainer}>
              <Image
                source={require("@/assets/images/NocourseEnrolledYet.png")}
                style={styles.NotFound}
              />
              <Text style={styles.noCoursesText}>No courses enrolled yet.</Text>
              <Text style={styles.nocoursesText}>
                You are not enrolled in any courses yet. Please check back later
                or explore in all courses to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.containerBottom}>
              {courses.map((enrollment) => (
                <TouchableOpacity
                  key={enrollment.id}
                  style={styles.buttomContainerColumn}
                >
                  <TouchableOpacity
                    style={styles.buttomContainer}
                    onPress={() => navigateToCourse(enrollment.course.id)}
                  >
                    <View>
                      <Image
                        source={
                          enrollment.course.course_image
                            ? { uri: enrollment.course.course_image }
                            : require("@/assets/images/defaultCourseImage.png")
                        }
                        style={styles.courseImage}
                      />
                    </View>

                    <View>
                      <Text style={styles.courseTitle}>
                        {truncateTitle(enrollment.course.title, 30)}
                      </Text>
                      <Text style={styles.courseDescription}>
                        Instructor{" "}
                        {enrollment.course.instructor.full_name ||
                          "Instructor not available"}
                      </Text>
                      <View style={styles.enrollContain}>
                        <TouchableOpacity
                          style={styles.enrollButton}
                          onPress={() => navigateToCourse(enrollment.course.id)}
                        >
                          <Text style={styles.enrollButtontext}>
                            Continue To Learn
                          </Text>
                          <MaterialIcons
                            name="arrow-right-alt"
                            color="#ffffff"
                            size={20}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#339206",
    flex: 1,
  },
  subContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#339206",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  textname1: {
    fontFamily: "UrbanistBold",
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 13,
    color: "white",
  },
  textname: {
    fontFamily: "UrbanistBold",
    color: "white",
    lineHeight: 21,
    fontSize: 14,
  },
  textnameone: {
    fontFamily: "UrbanistBold",
    color: "white",
    lineHeight: 21,
    fontSize: 14,
    width: "90%",
  },
  scrollContainer: {
    flexDirection: "row",
    paddingHorizontal: 7,
    zIndex: 1,
    justifyContent: "space-between",
  },
  courseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 7,
  },
  line: {
    backgroundColor: "#2632386E",
    height: 5,
    width: 80,
    borderRadius: 20,
    marginBottom: 10,
  },
  subTitleSection: {
    alignItems: "center",
    paddingBottom: 10,
  },
  CourseBeing: {
    fontWeight: "500",
    fontSize: 20,
  },
  scrollContainermain: {
    borderTopLeftRadius: 15,
    backgroundColor: "white",
    borderTopRightRadius: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  contentContainer: {
    paddingTop: 10,
  },
  CompletedCourseCard: {
    backgroundColor: "#27AE60",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    marginHorizontal: 5,
    height: 100,
    width: "48%",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  completedCard: {
    backgroundColor: "#2ecc71",
  },
  icon: {
    color: "#339206",
    fontSize: 16,
    fontWeight: "bold",
  },
  iconContainer: {
    backgroundColor: "white",
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  completedText: {
    color: "white",
    marginBottom: 5,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  courseNumber: {
    fontWeight: "500",
    color: "white",
    fontSize: 18,
  },
  hourtext: {
    color: "white",
    fontSize: 10,
    fontWeight: "400",
  },
  mainone: {
    flex: 1,
  },
  mainTwo: {},

  buttomContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  completedCourse: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardContainer: {
    paddingTop: 10,
    elevation: 3,
  },
  courseTitle: {
    fontSize: 15,
    marginBottom: 3,
    fontWeight: "500",
    width: "100%",
  },
  progressPercentage: {
    marginTop: 28,
    fontSize: 12,
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
  viewAllButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 10,
    backgroundColor: "#27AE60",
    borderRadius: 8,
  },
  viewAllText: {
    color: "white",
    fontWeight: "bold",
  },
  RecommendContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  RecommendButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  Recommendtext: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  courseDescription: {
    fontSize: 12,
  },
  noCoursesContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  noCoursesText: {
    fontSize: 20,
    color: "#000",
    marginBottom: 5,
    fontWeight: "bold",
  },
  viewCoursesButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 15,
    paddingVertical: 0,
    borderRadius: 20,
  },
  viewCoursesButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  nocoursesText: {
    fontSize: 14,
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    color: "#212121",
  },
  NotFound: {
    height: 160,
    marginTop: 5,
    objectFit: "cover",
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
    width: 120,
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
    marginTop: 5,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
    color: "white",
  },
});

export default Home;
