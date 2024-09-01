// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useNavigation } from "expo-router";
import { useRouter, useLocalSearchParams } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import GradesSection from "@/app/Components/GradesSection";

const { width } = Dimensions.get("window");

interface Grade {
  id: number;
  user: number;
  quiz: Quiz;
  exam: string | null;
  score: string;
  total_score: number;
  course_id: number;
}

interface Lesson {
  video_file: string;
  audio_file: string;
  id: number;
  title: string;
  video_url: string;
  content: string;
  pdf_file: string | null;
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
}
interface Enrollment {
  user_id: never;
  studentId: string;
  dateEnrolled: Date;
}
// Define the Quiz interface
interface Answer {
  id: number;
  question: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  quiz: number;
  text: string;
  is_multiple_choice: boolean;
  answers: Answer[];
}

interface Quiz {
  id: number;
  course: number;
  title: string;
  total_marks: number;
  questions: Question[];
}

interface Exam {
  id: number;
  course: number;
  title: string;
  total_marks: number;
  questions: Question[];
}
const SingleCourse = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const video = useRef<Video>(null);
  const [selectedTab, setSelectedTab] = useState<
    "home" | "lessons" | "grades" | "description" | "quiz && exam"
  >("home");
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null
  );
  const [exams, setExams] = useState<Exam[]>([]);

  const [examLoading, setExamLoading] = useState(false);

  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(1);
  const navigation = useNavigation();
  const [completedExams, setCompletedExams] = useState<number[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeLoading, setGradeLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  const route = useRouter();

  const navigateToQuizPage = async (quizId: number) => {
    try {
      await AsyncStorage.setItem("selected_quiz_id", quizId.toString());
      route.push("/(dashboard)/(home)/quizpage");
    } catch (error) {
      // console.error("Error navigating to quiz:", error);
    }
  };

  const navigateToExamPage = async (examId: number) => {
    try {
      await AsyncStorage.setItem("selected_exam_id", examId.toString());
      route.push("/(dashboard)/(home)/ExamPage");
    } catch (error) {
      // console.error("Error navigating to Exam:", error);
    }
  };

  const navigateToLesson = async (lessonId: number) => {
    try {
      await AsyncStorage.setItem("selected_lesson_id", lessonId.toString());
      const lessonData = courseDetails?.lessons.find(
        (lesson) => lesson.id === lessonId
      );

      route.push({
        pathname: "/(dashboard)/(home)/LessonDetail",
        params: {
          id: lessonId,
          lessonData: JSON.stringify(lessonData),
        },
      });
    } catch (error) {
      // console.error("Error navigating to Lesson:", error);
      Alert.alert(
        "Error",
        "There was a problem accessing this lesson. Please try again."
      );
    }
  };

  useEffect(() => {
    const verifyLessonData = async () => {
      try {
        const storedLessonId = await AsyncStorage.getItem("selected_lesson_id");
        // console.log("Stored Lesson ID:", storedLessonId);
      } catch (error) {
        // console.error("Error verifying lesson data:", error);
      }
    };

    verifyLessonData();
  }, []);

  const fetchCourseDetails = async () => {
    try {
      const courseId = await AsyncStorage.getItem("course_id");
      // console.log("id", courseId);
      if (courseId) {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/${courseId}/`
        );
        const data = await response.json();
        // console.log("Get courses by id from local storage:", data);
        setCourseDetails(data);
        setLoading(false);
      }
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

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setQuizLoading(true);
      const courseId = await AsyncStorage.getItem("course_id");
      if (courseId) {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/${courseId}/quizzes/`
        );
        const data = await response.json();
        // console.log("Quiz", data);
        setQuizzes(data);
      }
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        )
      }
    } finally {
      setQuizLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      setExamLoading(true);
      const courseId = await AsyncStorage.getItem("course_id");
      if (courseId) {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/${courseId}/exams/`
        );
        const data = await response.json();
        // console.log("Exam", data);
        setExams(data);
      }
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        )
      }
    } finally {
      setExamLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedTab === "quiz && exam") {
      fetchQuizzes();
    }
  }, [selectedTab]);

  const takeExam = async (examId: number) => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        // console.error("User ID not found in local storage");
        return;
      }

      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/${examId}/take/${userId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam_id: examId,
            user_id: userId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // console.log("Exam started successfully:", data);
        navigateToExamPage(examId);
      } else {
        if (data.status === "Exam already completed") {
          Alert.alert("Notice", "You have already completed this exam.");
          setCompletedExams((prev) => [...prev, examId]);
        } else {
          Alert.alert("Error", data.message || "Failed to start the exam");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  const fetchGrades = async () => {
    try {
      setGradeLoading(true);
      const userId = await AsyncStorage.getItem("user_id");
      const courseId = await AsyncStorage.getItem("course_id");
      if (userId && courseId) {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/${courseId}/users/${userId}/grades/`
        );
        const data = await response.json();
        // console.log("Grades fetcheddddddd:", data);
        if (data.grades && data.grades.length > 0) {
          setGrades(data.grades);
        } else {
          setGrades([]);
        }
      } else {
        Alert.alert("Error", "Missing user or course ID.");
      }
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        )
      }
    } finally {
      setGradeLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === "grades") {
      fetchGrades();
    }
  }, [selectedTab]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.MyProfile}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.goBack()}
        >
          <AntDesign
            name="left"
            size={23}
            color="#000"
            accessibilityLabel="Go back"
          />
        </TouchableOpacity>
        <Text style={styles.courseTitle}>Single Course</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["Home", "Grades", "Quiz && Exam", "Description"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab.toLowerCase() === tab.toLowerCase() &&
                styles.activeTab,
            ]}
            onPress={() =>
              setSelectedTab(
                tab.toLowerCase() as
                  | "home"
                  | "grades"
                  | "description"
                  | "quiz && exam"
              )
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab.toLowerCase() === tab.toLowerCase() &&
                  styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {selectedTab === "home" && (
          <View style={styles.homeContainer}>
            {/* Manually repeat the title and content for each module */}
            {selectedModule === 1 && (
              <View style={styles.moduleContent}>
                <View>
                  <Text style={styles.courseCompletedtitle}>
                    {courseDetails?.title || "Loading..."}
                  </Text>

                  <Text style={styles.descriptionlearn}>
                    {courseDetails?.description || "Loading..."}
                  </Text>
                </View>
                <ScrollView>
                  <View>
                    <Text style={styles.introductiontitle}>Course Lessons</Text>
                  </View>
                  {courseDetails?.lessons &&
                  courseDetails.lessons.length > 0 ? (
                    courseDetails.lessons.map((lesson) => (
                      <View
                        key={`lesson-${lesson.id}`}
                        style={{ marginVertical: 10 }}
                      >
                        <TouchableOpacity
                          key={lesson.id}
                          style={styles.resoucescardContainer}
                          onPress={() => navigateToLesson(lesson.id)}
                        >
                          <View style={styles.lessonInfo}>
                            <Text style={styles.lessonTitle}>
                              {lesson.title}
                            </Text>
                          </View>
                          <View style={styles.minutecheckContainer}>
                            {/* Conditionally show the video button */}
                            {lesson.video_file ? (
                              <TouchableOpacity
                                style={styles.videominutebotton}
                              >
                                <Text style={styles.lessonDuration}>Video</Text>
                                <AntDesign
                                  name="videocamera"
                                  color="#27AE60"
                                  size={18}
                                />
                              </TouchableOpacity>
                            ) : null}

                            {/* Conditionally show the audio button */}
                            {lesson.audio_file ? (
                              <TouchableOpacity
                                style={styles.audiominutebotton}
                              >
                                <Text style={styles.lessonDuration}>Audio</Text>
                                <Feather
                                  name="music"
                                  color="#27AE60"
                                  size={18}
                                />
                              </TouchableOpacity>
                            ) : null}

                            <TouchableOpacity style={styles.videominutebotton}>
                              <Text style={styles.lessonDuration}>
                                {new Date(
                                  lesson.created_at
                                ).toLocaleDateString()}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.viewLesson}
                              onPress={() => navigateToLesson(lesson.id)}
                            >
                              <Text style={styles.viewLessontext}>View</Text>
                              <Feather
                                name="arrow-right"
                                style={styles.icon}
                                size={20}
                              />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text>No lessons available</Text>
                  )}
                </ScrollView>
              </View>
            )}

            {selectedModule === 2 && (
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>
                  Module 2: Human Reproduction
                </Text>
                <Text style={styles.moduleText}>
                  Detailed information about human reproductive systems.
                </Text>
              </View>
            )}

            {selectedModule === 3 && (
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>Module 3: Fertilization</Text>
                <Text style={styles.moduleText}>
                  Exploring the fertilization process in depth.
                </Text>
              </View>
            )}

            {selectedModule === 4 && (
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>
                  Module 4: Embryonic Development
                </Text>
                <Text style={styles.moduleText}>
                  Understanding how embryos develop.
                </Text>
              </View>
            )}

            {selectedModule === 5 && (
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>
                  Module 5: Genetics and Reproduction
                </Text>
                <Text style={styles.moduleText}>
                  The role of genetics in reproduction.
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === "grades" && (
          <GradesSection grades={grades} gradeLoading={gradeLoading} />
        )}
        {selectedTab === "quiz && exam" && (
          <View style={styles.quizContainer}>
            {quizLoading ? (
              <ActivityIndicator size="large" color="#27AE60" />
            ) : quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <View key={quiz.id} style={styles.quizmarkContainer}>
                  <View style={styles.checkboxmodule}>
                    <View style={styles.moidulesQuiz}>
                      <View style={styles.quizTitleView}>
                        <Text style={styles.quizTitle}>
                          Module Quiz: {quiz.title}
                        </Text>
                      </View>
                      <View style={styles.questionsMarks}>
                        <Text style={styles.questionNumber}>
                          Total Questions: {quiz.questions.length}
                        </Text>
                        <Text style={styles.marktotalmark}>
                          Total Marks: {quiz.total_marks}
                        </Text>
                      </View>
                      <View style={styles.takeQuizView}>
                        <TouchableOpacity
                          style={styles.courseButton}
                          onPress={() => navigateToQuizPage(quiz.id)}
                        >
                          <Text style={styles.buttonText}>Take Quiz</Text>
                          <Feather
                            name="arrow-right"
                            style={styles.icon}
                            size={20}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.NoquizView}>
                <Text>No quizzes available</Text>
              </View>
            )}

            {/* Exam Section */}
            <View style={styles.examContainer}>
              {examLoading ? (
                <ActivityIndicator size="large" color="#27AE60" />
              ) : exams.length > 0 ? (
                exams.map((exam) => (
                  <View key={exam.id} style={styles.quizmarkContainer}>
                    <View style={styles.checkboxmodule}>
                      <View style={styles.moidulesQuiz}>
                        <View style={styles.quizTitleView}>
                          <Text style={styles.examTitle}>
                            Exam: {exam.title}
                          </Text>
                        </View>
                        <View style={styles.questionsMarks}>
                          <Text style={styles.questionNumber}>
                            Total Questions: {exam.questions.length}
                          </Text>
                          <Text style={styles.marktotalmark}>
                            Total Marks: {exam.total_marks}
                          </Text>
                        </View>
                        <View style={styles.takeQuizView}>
                          <TouchableOpacity
                            style={[
                              styles.courseButton,
                              completedExams.includes(exam.id) &&
                                styles.disabledButton,
                            ]}
                            onPress={() => takeExam(exam.id)}
                            disabled={completedExams.includes(exam.id)}
                          >
                            <Text style={styles.buttonText}>
                              {completedExams.includes(exam.id)
                                ? "Completed"
                                : "Take Exam"}
                            </Text>
                            <Feather
                              name="arrow-right"
                              style={styles.icon}
                              size={20}
                              color={
                                completedExams.includes(exam.id)
                                  ? "#ccc"
                                  : "#000"
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.NoquizView}>
                  <Text>No exams available</Text>
                </View>
              )}
            </View>
          </View>
        )}
        {selectedTab === "description" && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.courseDescription}>Course Description</Text>
            <Text>{courseDetails?.description || "Loading..."}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  MyProfile: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    gap: 70,
  },
  headerIcon: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    elevation: 3,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: "#339206",
  },
  tabText: {
    fontSize: 13,
    color: "#777",
  },
  activeTabText: {
    color: "#339206",
    fontWeight: "bold",
  },
  homeContainer: {
    padding: 20,
  },
  homeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  homeText: {
    fontSize: 16,
    color: "#555",
  },
  startCourseButton: {
    marginTop: 20,
    backgroundColor: "#339206",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  startCourseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "#339206",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  lessonTitle: {
    fontSize: 15,
    color: "#000",
    fontWeight: "800",
    marginBottom: 5,
  },
  lessonDuration: {
    fontSize: 12,
    color: "#000000",
    fontWeight: "500",
  },
  viewLessontext: {
    color: "white",
    fontWeight: "bold",
  },
  nextIcon: {
    fontSize: 28,
    color: "#339206",
    fontWeight: "bold",
  },
  gradesContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 5,
    marginBottom: 5,
  },
  gradesTitle: {
    fontSize: 13,
    fontWeight: "400",
  },
  gradeText: {
    fontSize: 16,
    color: "#555",
  },
  resourcesContainer: {
    padding: 16,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resourceLink: {
    fontSize: 16,
    color: "#339206",
    marginBottom: 8,
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 10,
  },

  modules: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#339206",
    width: 70,
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 18,
    gap: 5,
  },
  paragraph: {
    fontSize: 15,
  },
  checkbox: {
    borderRadius: 20,
  },
  currentModuleNumber: {
    color: "white",
    fontWeight: "bold",
  },
  modulesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  activeModule: {
    backgroundColor: "#339206",
  },
  moduleContent: {},
  moduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 5,
  },
  moduleText: {
    fontSize: 16,
    color: "#555",
  },
  courseCompletedtitle: {
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 15,
  },
  introductiontitle: {
    fontSize: 13,
    borderBottomColor: "#339206",
    borderWidth: 1,
    borderTopColor: "white",
    borderLeftColor: "white",
    borderRightColor: "white",
    width: "53%",
    fontWeight: "400",
    marginTop: 5,
    marginBottom: 5,
  },
  congratstext: {
    paddingVertical: 5,
  },
  descriptionlearn: {
    paddingVertical: 5,
  },
  resoucescardContainer: {
    flexDirection: "column",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderColor: "#777",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  minutecheckContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "space-around",
  },
  videominutebotton: {
    borderWidth: 1,
    height: 33,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#23A64A",
    borderRadius: 5,
    fontWeight: "bold",
    flexDirection: "row",
    gap: 5,
  },
  audiominutebotton: {
    borderWidth: 1,
    height: 33,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#23A64A",
    borderRadius: 5,
    fontWeight: "bold",
    flexDirection: "row",
    gap: 5,
  },
  viewLesson: {
    height: 33,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    fontWeight: "bold",
    backgroundColor: "#27AE60",
    flexDirection: "row",
    gap: 5,
  },
  progressLine: {
    marginBottom: 5,
  },
  quizmarkContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 15,
    marginTop: 0,
    marginBottom: 10,
    paddingVertical: 15,
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: 10,
  },
  quizTitle: {
    fontWeight: "bold",
    fontSize: 12,
    alignItems: "center",
  },
  quizTitleView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quizmark: {
    color: "#777",
    fontWeight: "bold",
    fontSize: 10,
    marginTop: 5,
  },
  marktotalmark: {
    color: "#339206",
    fontWeight: "bold",
  },
  checkboxmodule: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  markquiz: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  courseDescription: {
    marginBottom: 10,
    fontWeight: "bold",
    borderBottomColor: "#339206",
    borderBottomWidth: 1,
    width: "50%",
  },
  moidulesQuiz: {
    flexDirection: "column",
  },
  questionNumber: {
    fontSize: 12,
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
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
    width: "80%",
    height: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    marginRight: 10,
    fontWeight: "bold",
  },
  icon: {
    color: "#fff",
  },
  questionsMarks: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  takeQuizView: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  NoquizView: {
    padding: 20,
  },
  quizContainer: {
    marginTop: 10,
  },
  examContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },
  examTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 35,
  },
  takeExamView: {
    alignItems: "flex-end",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  gradeContainer: { padding: 15 },
  gradeCard: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardSubtitle: { fontSize: 14, color: "#555" },
  noGradesText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  retakeButton: {
    backgroundColor: "#FFA500",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
});

export default SingleCourse;
