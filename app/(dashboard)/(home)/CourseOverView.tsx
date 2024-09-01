import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import PagerView from "react-native-pager-view";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { router } from "expo-router";
import { useNavigation, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Enrollment {
  user: {
    id: number;
  };
}

interface Lesson {
  id: number;
  title: string;
  video_url: string;
  content: string;
  pdf_file: string | null;
  readings: string | null;
  created_at: string;
}
interface CourseDetails {
  id: number;
  title: string;
  description: string;
  course_image: string;
  instructor: {
    full_name: string;
  };
  enrollments: Enrollment[];
  lessons: Lesson[];
  skills: {
    id: number;
    name: string;
  }[];
}

interface Enrollment {
  user_id: never;
  studentId: string;
  dateEnrolled: Date;
}

interface Course {
  id: number;
  course_image: string;
  title: string;
  created_at: string;
  description: string;
}

const { width, height } = Dimensions.get("window");

const CustomCircularProgress = ({ value }: { value: number }) => {
  const radius = 15;
  const strokeWidth = 4;
  const size = radius * 2 + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * value) / 100;

  return (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E0E0E0"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#4CAF50"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
      <SvgText
        x="50%"
        y="50%"
        alignmentBaseline="middle"
        textAnchor="middle"
        fontSize={10}
        fill="#000"
      >
        {`${value}%`}
      </SvgText>
    </Svg>
  );
};

interface EnrollmentButtonProps {
  courseId: number;
  initialEnrollmentStatus: boolean;
}
const CourseOverView: React.FC<EnrollmentButtonProps> = () => {
  const navigation = useNavigation();
  const [autoScroll, setAutoScroll] = useState(true);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null
  );
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [enrolledUsers, setEnrolledUsers] = useState(0);
  const { id } = useLocalSearchParams();
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/${id}/`
        );
        const data = await response.json();
        // console.log("Course Details:", data);
        setCourseDetails(data);

        const userId = await AsyncStorage.getItem("user_id");
        if (userId && data.enrollments) {
          const userEnrolled = data.enrollments.some(
            (enrollment: { user: { id: number } }) =>
              enrollment.user.id === JSON.parse(userId)
          );
          setIsEnrolled(userEnrolled);
        }
      } catch (error:any) {
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          )
        }
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);


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
      }
    };

    fetchCourses();
  }, []);

  const route = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("user_id");
        if (id) {
          setUserId(JSON.parse(id));
        }
      } catch (error) {
        // console.error("Error retrieving user ID from storage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/${courseDetails?.id}/enrollments/`
        );
        const enrollments = await response.json();

        const uniqueEnrolledUsers = enrollments.length;
        setEnrolledUsers(uniqueEnrolledUsers);
      } catch (error:any) {
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          )
        }
      }
    };

    if (courseDetails?.id) {
      fetchEnrollments();
    }
  }, [courseDetails?.id]);

  const [expandedModules, setExpandedModules] = useState([
    false,
    false,
    false,
    false,
  ]);

  const toggleModuleExpansion = (index: number) => {
    const newExpandedModules = [...expandedModules];
    newExpandedModules[index] = !newExpandedModules[index];
    setExpandedModules(newExpandedModules);
  };

  const getFullImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "";
    return `https://fcmc.muberarugo.org${imagePath}`;
  };
  const navigateToCourse = (courseId: number) => {
    router.push({
      pathname: "/(dashboard)/(home)/CourseOverView",
      params: { id: courseId },
    });
  };
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  const truncateDescription = (description: string, maxLength: number) => {
    return description.length > maxLength
      ? description.slice(0, maxLength) + "..."
      : description;
  };
  const truncateReadings = (readings: string, maxLength: number = 100) => {
    if (!readings) return null;
    return readings.length > maxLength
      ? readings.slice(0, maxLength) + "..."
      : readings;
  };
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("user_id");
        if (id) {
          setUserId(JSON.parse(id));
        }
      } catch (error) {
        // console.error("Error retrieving user ID from storage:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchUserId();
  }, []);

  const enrollCourse = async () => {
    const userId = await AsyncStorage.getItem("user_id");
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in and try again.");
      return;
    }

    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/courses/${courseDetails?.id}/enroll/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: JSON.parse(userId),
          }),
        }
      );

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // console.error("Failed to parse response as JSON:", responseText);
        Alert.alert(
          "Error",
          "The server returned an unexpected response. Please try again later."
        );
        return;
      }

      if (response.ok) {
        setIsEnrolled(true);
        Alert.alert(
          "Success",
          "You have successfully enrolled in this course!"
        );
        navigateToSingleLessons();
      } else if (
        responseData.error === "User is already enrolled in this course"
      ) {
        Alert.alert(
          "Enrollment",
          "You are already enrolled in this course, Continue to learn."
        );
      } else {
        Alert.alert(
          "Enrollment Failed",
          responseData.message ||
            "An error occurred while enrolling. Please try again."
        );
      }
    } catch (error) {
      // console.error("Error enrolling in course:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please check your internet connection and try again later."
      );
    }
  };

  const navigateToSingleLessons = () => {
    router.push("/(dashboard)/(home)/SingleCourse");
  };

  const storeCourseId = async (courseId: number) => {
    try {
      await AsyncStorage.setItem("course_id", JSON.stringify(courseId));
    } catch (error) {
      // console.error("Error storing course ID:", error);
    }
  };

  const handleButtonClick = async () => {
    if (!courseDetails?.id) {
      Alert.alert("Error", "Course ID is missing.");
      return;
    }

    setIsButtonLoading(true); 

    try {
      if (isEnrolled) {
        await storeCourseId(courseDetails.id);
        navigateToSingleLessons();
      } else {
        await enrollCourse();
        await storeCourseId(courseDetails.id);
        navigateToSingleLessons();
      }
    } catch (error) {
      // console.error("Error during enrollment:", error);
      Alert.alert("Error", "Could not enroll in the course. Please try again.");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const courseId = await AsyncStorage.getItem("course_id");
      const userId = await AsyncStorage.getItem("user_id");
      // console.log("course Id", courseId);
      // console.log("user Id", userId);

      if (courseId && userId) {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/completing /course/${courseId}/progress/${userId}/`
        );
        const data = await response.json();
        // console.log("total  progress", data);

        setTotalProgress(Math.round(data.totalProgress));
      }
    } catch (error) {
      // console.error("Error fetching progress:", error);
      Alert.alert("Error", "Failed to load progress. Please try again.");
    }
  };

  useEffect(() => {
    fetchProgress();

    const unsubscribe = navigation.addListener("focus", fetchProgress);
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PagerView style={styles.pagerView}>
          {[
            "Basic Of Reproduction",
            "Advanced Reproduction",
            "Expert Reproduction",
          ].map((title, index) => (
            <View style={styles.sliderContainer} key={`slide-${index}`}>
              <Image
                source={
                  getFullImageUrl(courseDetails?.course_image)
                    ? { uri: getFullImageUrl(courseDetails?.course_image) }
                    : require("@/assets/images/CourseOverView.png")
                }
                style={styles.learnImage}
              />

              <View style={styles.basicReproduction}>
                <Text style={styles.title}>
                  {courseDetails?.title || "Loading..."}
                </Text>
                <Text style={styles.subtitle}>
                  Prepared by{" "}
                  {courseDetails?.instructor.full_name || "Loading..."}
                </Text>
              </View>
            </View>
          ))}
        </PagerView>

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
        </View>
      </View>

      <View style={styles.courseInfo}>
        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={29} color="#000" />
            <Text style={styles.statText}>{enrolledUsers}</Text>
          </View>
          <View style={styles.statItem}>
            <CustomCircularProgress value={totalProgress} />
            <Text style={styles.progressText}>Progress</Text>
          </View>
        </View>
      </View>
      <View style={styles.PreviousCourseContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Text style={styles.descriptionText}>
            {courseDetails?.description || "Loading..."}
          </Text>

          <View>
            <View>
              <ScrollView>
                <Text style={styles.skillYouwillGain}>
                  Skills you will gain
                </Text>
                {loading ? (
                  <Text>Loading...</Text>
                ) : courseDetails?.skills && courseDetails.skills.length > 0 ? (
                  <FlatList
                    data={courseDetails.skills}
                    keyExtractor={(item) => `skill-${item.id}`}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoriesView}># {item.name}</Text>
                      </TouchableOpacity>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                  />
                ) : (
                  <Text style={styles.noSkillsText}>
                    No skills available for this course.
                  </Text>
                )}
              </ScrollView>
            </View>

            <Text style={styles.skillYouwillGain}>Recommended Courses</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.courseCardContainer}>
                {courses.map((course) => (
                  <TouchableOpacity
                    style={styles.courseCard}
                    key={`course-${course.id}`}
                    onPress={() => navigateToCourse(course.id)}
                  >
                    <Image
                      source={
                        course.course_image
                          ? { uri: course.course_image }
                          : require("@/assets/images/defaultCourseImage.png")
                      }
                      style={styles.courseImage}
                    />
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseTitle}>
                        {truncateTitle(course.title, 20)}
                      </Text>
                      <Text style={styles.courseDescription}>
                        {truncateDescription(course.description, 20)}
                      </Text>
                    </View>
                    <AntDesign name="right" size={18} color="#B3B3B3" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View>
              <Text style={styles.skillYouwillGain}>
                Syllabus:What you will learn in this course
              </Text>
              <>
                {courseDetails?.lessons.map((lesson, index) => {
                  const videoCount = lesson.video_url ? 1 : 0;
                  const pdfCount = lesson.pdf_file ? 1 : 0;

                  return (
                    <View
                      key={`lesson-${lesson.id}`}
                      style={{ marginVertical: 10 }}
                    >
                      <TouchableOpacity
                        onPress={() => toggleModuleExpansion(index)}
                      >
                        <View style={styles.moduleHeader}>
                          <Text style={{ fontSize: 14, fontWeight: "500" }}>
                            {lesson.title}
                          </Text>
                          <Ionicons
                            name={
                              expandedModules[index]
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={18}
                          />
                        </View>
                      </TouchableOpacity>
                      {expandedModules[index] && (
                        <>
                          <Text>{lesson.content}</Text>
                          <View style={styles.detailRow}>
                            {lesson.readings ? (
                              <Text style={styles.detailText}>
                                {truncateReadings(lesson.readings)}
                              </Text>
                            ) : (
                              <Text style={styles.detailText}>
                                No readings available
                              </Text>
                            )}
                          </View>
                        </>
                      )}
                    </View>
                  );
                })}
              </>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.courseButtonContainer}>
        <TouchableOpacity
          style={[
            styles.courseButton,
            isButtonLoading && styles.disabledButton,
          ]}
          onPress={handleButtonClick}
          disabled={isButtonLoading}
        >
          {isButtonLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {isEnrolled ? "Continue to learn" : "Go to Course"}
              </Text>
              <Feather
                name={isEnrolled ? "arrow-right" : "play"}
                style={styles.icon}
                size={20}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CourseOverView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    flexGrow: 1,
  },
  header: {
    width: "100%",
    height: height * 0.4,
  },
  scrollContainer: {
    paddingBottom: 70,
  },
  contentContainer: {
    flexGrow: 1,
  },
  MyProfile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
  },
  headerIcon: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    elevation: 3,
  },
  pagerView: {
    flex: 1,
  },
  sliderContainer: {
    width: "100%",
    height: height * 0.37,
    justifyContent: "center",
    alignItems: "center",
  },
  learnImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  basicReproduction: {
    position: "absolute",
    bottom: 40,
    zIndex: 1,
    padding: 10,
    borderRadius: 10,
    width: "90%",
    backgroundColor: "#000",
    opacity: 0.7,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#ffffff",
  },
  inactiveDot: {
    backgroundColor: "#505050",
  },
  courseInfo: {
    paddingHorizontal: 20,
  },
  courseStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "medium",
    marginBottom: 10,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  courseButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 1,
    left: 0,
    right: 0,
  },
  courseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#339206",
    borderRadius: 0,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 10,
  },
  icon: {
    color: "#fff",
  },
  progressText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "medium",
    marginBottom: 10,
  },
  readMoreText: {
    color: "#339206",
    fontWeight: "bold",
  },
  PreviousCourseContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  moduleTitle: {
    fontSize: 14,
  },
  moduleDetails: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "medium",
    color: "#0C0C0C",
    marginTop: 3,
  },
  categoryList: {
  },
  categoryname: {
    color: "#ffffff",
  },
  categoriesView: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 20,
    color: "white",
    fontWeight: "bold",
  },
  categoryCard: {
    marginRight: 5,
    backgroundColor: "#339206",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    color: "white",
  },
  skillYouwillGain: {
    paddingVertical: 10,
    fontWeight: "bold",
    fontSize: 16,
    paddingBottom: 0,
  },

  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  courseImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 0,
  },

  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  courseDescription: {
    fontSize: 14,
    color: "#A5A5A5",
  },
  courseCardContainer: {
    flexDirection: "row",
    gap: 5,
  },
  detailRow: {
    flexDirection: "column",
    marginVertical: 2,
  },
  detailText: {
    fontSize: 12,
    color: "#000",
    lineHeight: 20,
  },
  noSkillsText: {
    fontSize: 12,
  },
  disabledButton: {
    backgroundColor: "#339206",
  },
});
