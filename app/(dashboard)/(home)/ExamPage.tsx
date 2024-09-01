import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import Checkbox from "expo-checkbox";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
interface ExamResult {
  score: number;
  passed: boolean;
  message: string;
}

interface Answer {
  id: number;
  question: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  exam: number;
  text: string;
  is_multiple_choice: boolean;
  answers: Answer[];
}

interface exam {
  id: number;
  course: number;
  title: string;
  total_marks: number;
  questions: Question[];
}
interface Certificate {
  url: string;
  generated: boolean;
}
const examPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const navigation = useNavigation();
  const [exam, setExam] = useState<exam | null>(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [showRetakeButton, setShowRetakeButton] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [examPassed, setExamPassed] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        const storedCourseId = await AsyncStorage.getItem("course_id");
        setCourseId(storedCourseId);
        // console.log("Course Idddd", storedCourseId);
      } catch (error) {
        // console.error("Error fetching course ID:", error);
      }
    };
  
    fetchCourseId();
  }, []);
  const [examSummary, setExamSummary] = useState<{
    exam_id: number;
    score: number;
    total_questions: number;
    correct_answers: number;
  } | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    { question: number; selected_answer: number }[]
  >([]);

  useEffect(() => {
    checkExamStatus();
  }, []);
  const router=useRouter();
  const checkExamStatus = async () => {
    try {
      const examStatus = await AsyncStorage.getItem("examStatus");
      if (examStatus) {
        const { passed } = JSON.parse(examStatus);
        setExamPassed(passed);
      }
    } catch (error) {
      // console.error("Error checking exam status:", error);
    }
  };

  const updateExamStatus = async (passed: boolean) => {
    try {
      await AsyncStorage.setItem("examStatus", JSON.stringify({ passed }));
      setExamPassed(passed);
    } catch (error) {
      // console.error("Error updating exam status:", error);
    }
  };

  useEffect(() => {
    if (examSummary && examSummary.score < 80 && !isRetaking) {
      setShowRetakeButton(true);
    } else {
      setShowRetakeButton(false);
    }
  }, [examSummary, isRetaking]);

  const resetExamState = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setExamStarted(false);
    setExamCompleted(false);
    setUserAnswers([]);
    setIsRetaking(false);
    setShowRetakeButton(false);
  };

  const handleRetakeExam = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const examId = await AsyncStorage.getItem("selected_exam_id");

      if (!userId || !examId) {
        Alert.alert("Error", "Missing user or exam information");
        return;
      }

      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/${examId}/retake_exam/${userId}/`,
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

      if (response.ok) {
        resetExamState();
        await fetchExamDetails();

        Alert.alert("Success", "You can now retake the exam", [
          {
            text: "OK",
            onPress: () => {
              setExamStarted(false);
              setExamSummary(null);
            },
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to retake exam");
      }
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        )
      }
      Alert.alert("Error", "Failed to retake exam");
    }
  };

  const handleNext = async () => {
    if (selectedOption === null) {
      Alert.alert("Please select an answer.");
      return;
    }

    if (!exam) return;

    const currentQuestion = exam.questions[currentQuestionIndex];
    const updatedUserAnswers = [
      ...userAnswers,
      {
        question: currentQuestion.id,
        selected_answer: selectedOption,
      },
    ];
    setUserAnswers(updatedUserAnswers);

    const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

    if (isLastQuestion) {
      await handleexamSubmission(updatedUserAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleexamSubmission = async (
    answers: { question: number; selected_answer: number }[]
  ) => {
    try {
      setIsSubmitting(true);
      const userId = await AsyncStorage.getItem("user_id");
      const examId = await AsyncStorage.getItem("selected_exam_id");
  
      if (!userId || !examId) {
        Alert.alert("Error", "Missing user or exam information");
        return;
      }
  
      if (!exam || answers.length !== exam.questions.length) {
        Alert.alert("Error", "Please answer all questions");
        return;
      }
  
      const formattedAnswers = answers.map((answer) => ({
        question_id: answer.question,
        choice_id: answer.selected_answer,
      }));
  
      const payload = {
        answers: formattedAnswers,
        user_id: userId,
        exam_id: examId,
      };
  
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/${examId}/submit/${userId}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        const summary = {
          ...result,
          total_questions: exam.questions.length,
        };
        setExamSummary(summary);
        setExamCompleted(true);
  
        if (summary.score >= 80) {
          await updateExamStatus(true);
          
          await markExamCompleted();
        }
  
        if (summary.score < 80) {
          setShowRetakeButton(true);
        }
      } else {
        if (result.message === "Exam already completed") {
          Alert.alert("Info", "You have already completed this exam.");
        } else {
          Alert.alert(
            "Error",
            result.detail || result.message || "An error occurred"
          );
        }
      }
    } catch (error) {
      // console.error("Error submitting answers:", error);
      Alert.alert("Error", "Failed to submit Exam answers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchExamDetails = async () => {
    try {
      const examId = await AsyncStorage.getItem("selected_exam_id");
      if (!examId) {
        Alert.alert("Error", "No exam ID found");
        return;
      }

      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/${examId}/`
      );
      const data = await response.json();

      if (data && data.questions && data.questions.length > 0) {
        setExam(data);
      } else {
        Alert.alert("Error", "No questions found in the exam data.");
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

  useEffect(() => {
    fetchExamDetails();
  }, []);

  useEffect(() => {
    const loadExamProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem("examProgress");
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setCurrentQuestionIndex(progress.currentQuestionIndex);
          setSelectedOption(progress.selectedOption);
          setScore(progress.score);
          setExamStarted(true);
        }
      } catch (error) {
        // console.error("Error loading exam progress:", error);
      }
    };
    loadExamProgress();
  }, []);

  const handleStartexam = () => {
    setExamStarted(true);
  };
  
  const markExamCompleted = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const examId = await AsyncStorage.getItem("selected_exam_id");

      if (!userId || !examId) {
        Alert.alert("Error", "Missing user or Exam information");
        return;
      }

      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/${examId}/users/${userId}/complete/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            item_id: parseInt(examId),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Exam marked as complete!", [
          {
            text: "OK",
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to mark exam as complete");
      }
    } catch (error) {
      // console.error("Error marking exam as complete:", error);
      Alert.alert("Error", "Failed to mark exam as complete");
    }
  };

  const handleModalClose = async () => {
    setExamCompleted(false);
    if (examSummary && examSummary.score >= 80) {
      setExamStarted(false);
      await updateExamStatus(true);
      setExamResult({
        score: examSummary.score,
        passed: true,
        message: "Congratulations! You have passed this exam.",
      });
      await generateCertificate();
    } else {
      await AsyncStorage.removeItem("examStatus");
      setExamPassed(false);
    }
    setExamStarted(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      const clearExamStatus = async () => {
        try {
          await AsyncStorage.removeItem("examStatus");
          setExamPassed(false); 
          // console.log("Exam status cleared on screen focus");
        } catch (error) {
          // console.error("Error clearing exam status:", error);
        }
      };
      clearExamStatus();
      fetchExamDetails();
      return () => {
      };
    }, [])
  );
  
  const generateCertificate = async () => {
    try {
      setIsGeneratingCertificate(true);
      const userId = await AsyncStorage.getItem("user_id");
      const examId = await AsyncStorage.getItem("selected_exam_id");

      if (!userId || !examId) {
        Alert.alert("Error", "Missing user or exam information");
        return;
      }

      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/${examId}/certificate/${userId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCertificate({
          url: data.certificate_url,
          generated: true,
        });
        Alert.alert("Success", "Certificate generated successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to generate certificate");
      }
    } catch (error) {
      // console.error("Error generating certificate:", error);
      Alert.alert("Error", "Failed to generate certificate");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const handleViewCertificate = () => {
      router.push("/(dashboard)/Achievements");
   
  };


  const progressPercentage = exam
    ? ((currentQuestionIndex + 1) / exam.questions.length) * 100
    : 0;

  return (
    <View style={styles.container}>
      {!examStarted ? (
        <ScrollView>
          <View style={styles.firstView}>
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
                {exam?.title || "Module Exam"}
              </Text>
            </View>
          </View>
          <View style={styles.questionsContainer}>
            <Text style={styles.questionstext}>
              Practice Assignment • {exam?.questions.length || 0} QUESTIONS
            </Text>
          </View>
          <View>
            <Text style={styles.moduleexam}>
              {exam?.title ||
                "Module exam: Introduction to Reproduction Health"}
            </Text>
          </View>
          <View style={styles.examImageContainer}>
            <Image source={require("@/assets/images/quizimage.png")} />
          </View>

          {showRetakeButton ? (
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetakeExam}
            >
              <Text style={styles.retakeButtonText}>Retake Exam</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.previewbutton,
                examPassed && styles.disabledButton,
              ]}
              onPress={handleStartexam}
              disabled={examPassed}
            >
              <Text style={styles.previewtext}>
                {examPassed
                  ? "Exam Passed"
                  : examStarted
                  ? "Resume Exam"
                  : "Start Exam"}
              </Text>
            </TouchableOpacity>
          )}
          {examPassed && (
            <TouchableOpacity
              style={styles.viewCertificateButton}
              onPress={handleViewCertificate}
            >
              <Text style={styles.viewCertificateButtonText}>
                View Certificate
              </Text>
            </TouchableOpacity>
          )}
          {examResult && examResult.passed && (
            <View style={styles.resultContainer}>
              <AntDesign name="checkcircle" size={50} color="#27AE60" />
              <Text style={styles.resultScore}>Score: {examResult.score}%</Text>
              <Text style={styles.resultMessage}>{examResult.message}</Text>
            </View>
          )}
        </View>

        </ScrollView>

      ) : (
        <>
          <Pressable
            style={styles.backTozeroindex}
            onPress={() => {
              setExamStarted(false);
              setCurrentQuestionIndex(0);
              setUserAnswers([]);
            }}
          >
            <Text style={styles.headerIcon}>
              <AntDesign name="arrowleft" size={20} color="#000" />
            </Text>
            <Text style={styles.backtoexaminstructiontext}>
              Back to exam Instructions
            </Text>
          </Pressable>

          <Text style={styles.questionText}>
            {exam?.questions[currentQuestionIndex]?.text || "Loading..."}
          </Text>
          <ScrollView>
            {exam?.questions[currentQuestionIndex]?.answers.map((answer) => (
              <TouchableOpacity
                key={answer.id}
                style={styles.optionContainer}
                onPress={() => setSelectedOption(answer.id)}
              >
                <Checkbox
                  style={styles.checkbox}
                  value={selectedOption === answer.id}
                  onValueChange={() => setSelectedOption(answer.id)}
                />
                <Text style={styles.optionText}>{answer.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progressPercentage}%` }]}
            />
          </View>
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.previousButton}
              onPress={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setSelectedOption(null);
                }
              }}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentQuestionIndex === (exam?.questions.length || 0) - 1
                      ? "Finish"
                      : "Next"}
                  </Text>
                  <AntDesign name="arrowright" color="#fff" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>


          <Modal
            animationType="slide"
            transparent={true}
            visible={examCompleted}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Exam Completed!</Text>
                <Text>Total Score: {examSummary?.score}%</Text>
                <Text>Total Questions: {exam?.questions.length}</Text>
                <Text>Correct Answers: {examSummary?.correct_answers}</Text>
                {examSummary && examSummary.score < 80 && (
                  <Text style={styles.retakeMessage}>
                    Your score is below 80%. You can retake the exam to improve
                    your score.
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={handleModalClose}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#27AE60",
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row",
    width: 100,
    justifyContent: "center",
    paddingVertical: 5,
    marginHorizontal: 10,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  previousButton: {
    backgroundColor: "#27AE60",
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row",
    width: 100,
    justifyContent: "center",
    paddingVertical: 5,
    marginHorizontal: 10,
  },
  previousButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  MyProfile: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  headerIcon: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    elevation: 3,
  },
  overViewtext: {
    fontSize: 14,
    fontWeight: "bold",
    width: "100%",
  },
  questionstext: {
    fontWeight: "bold",
    color: "#777",
    fontSize: 10,
    paddingBottom: 5,
  },
  firstView: {},
  moduleexam: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 5,
    marginBottom: 10,
    width: "100%",
    textAlign: "center",
  },
  previewbutton: {
    width: "100%",
    backgroundColor: "#27AE60",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    marginVertical: 10,
    borderRadius: 5,
  },
  previewtext: {
    color: "white",
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginVertical: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#27AE60",
    borderRadius: 5,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  backTozeroindex: {
    borderRadius: 5,
    marginTop: 20,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    paddingVertical: 10,
    paddingTop: 5,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  backTozeroindexText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 19,
  },

  backtoexaminstructiontext: {
    fontWeight: "bold",
    fontSize: 16,
  },
  examImageContainer: {
    width: "100%",
    alignItems: "center",
  },

  questionsContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: "#27AE60",
    padding: 10,
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  markCompleteButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  markCompleteButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  retakeButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
  },

  retakeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  retakeMessage: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 5,
    backgroundColor: "#FFF1F1",
  },

  resultContainer: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#27AE60",
  },
  resultScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27AE60",
    marginTop: 10,
  },
  resultMessage: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  viewCertificateButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: "90%",
    alignSelf: "center",
  },
  viewCertificateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loader: {
    marginTop: 10,
  },
});

export default examPage;
