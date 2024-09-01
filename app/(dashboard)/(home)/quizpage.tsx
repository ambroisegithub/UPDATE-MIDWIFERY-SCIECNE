import React, { useState, useEffect, useCallback } from "react";
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

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);

  const [quizSummary, setQuizSummary] = useState<{
    quiz_id: number;
    score: number;
    total_questions: number;
    correct_answers: number;
  } | null>(null);

  const [userAnswers, setUserAnswers] = useState<
    { question: number; selected_answer: number }[]
  >([]);

  const navigation = useNavigation();

  const fetchQuizDetails = useCallback(async () => {
    try {
      const quizId = await AsyncStorage.getItem("selected_quiz_id");
      if (quizId) {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/quizzes/${quizId}/`
        );
        const data = await response.json();
        setQuiz(data);
      }
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        )
      }
    }
  }, []);

  const loadQuizProgress = useCallback(async () => {
    const savedProgress = await AsyncStorage.getItem("quizProgress");
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setSelectedOption(progress.selectedOption);
      setQuizStarted(true);
    }
  }, []);

  const autoCompleteQuiz = useCallback(async () => {
    if (quiz && userAnswers.length === quiz.questions.length) {
      await handleQuizSubmission(userAnswers);
    }
  }, [quiz, userAnswers]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setIsStartButtonDisabled(true);
  };

  const handleNext = async () => {
    if (selectedOption === null) {
      Alert.alert("Please select an answer.");
      return;
    }

    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const updatedUserAnswers = [
      ...userAnswers,
      {
        question: currentQuestion.id,
        selected_answer: selectedOption,
      },
    ];
    setUserAnswers(updatedUserAnswers);

    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    if (isLastQuestion) {
      await handleQuizSubmission(updatedUserAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleQuizSubmission = async (
    answers: { question: number; selected_answer: number }[]
  ) => {
    try {
      setIsSubmitting(true);
      const userId = await AsyncStorage.getItem("user_id");
      const quizId = await AsyncStorage.getItem("selected_quiz_id");

      if (!quiz || answers.length !== quiz.questions.length) {
        Alert.alert("Error", "Please answer all questions");
        return;
      }

      const response = await fetch(
        `https://fcmc.muberarugo.org/api/quizzes/${quizId}/take/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answers,
            user_id: userId,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setQuizSummary({
          ...result,
          total_questions: quiz.questions.length,
        });
        setQuizCompleted(true);
        await markQuizCompleted();
      } else {
        Alert.alert(
          "Error",
          result.detail || result.message || "An error occurred"
        );
      }
    } catch (error) {
      // console.error("Error submitting answers:", error);
      Alert.alert("Error", "Failed to submit quiz answers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markQuizCompleted = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const quizId = await AsyncStorage.getItem("selected_quiz_id");

      if (!userId || !quizId) {
        Alert.alert("Error", "Missing user or quiz information");
        return;
      }

      const response = await fetch(
        `https://fcmc.muberarugo.org/api/quizzes/${quizId}/${userId}/complete/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            item_id: parseInt(quizId),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Quiz marked as complete!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to mark quiz as complete");
      }
    } catch (error) {
      // console.error("Error marking quiz as complete:", error);
      Alert.alert("Error", "Failed to mark quiz as complete"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
    loadQuizProgress();
  }, []);

  useEffect(() => {
    if (quizStarted && quiz && userAnswers.length === quiz.questions.length) {
      autoCompleteQuiz();
    }
  }, [quizStarted, quiz, userAnswers, autoCompleteQuiz]);

  const progressPercentage = quiz
    ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
    : 0;

  return (
    <View style={styles.container}>
      {!quizStarted ? (
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
                {quiz?.title || "Module Quiz"}
              </Text>
            </View>
          </View>
          <View style={styles.questionsContainer}>
            <Text style={styles.questionstext}>
              Practice Assignment • {quiz?.questions.length || 0} QUESTIONS
            </Text>
          </View>
          <View>
            <Text style={styles.modulequiz}>
              {quiz?.title ||
                "Module Quiz: Introduction to Reproduction Health"}
            </Text>
          </View>
          <View style={styles.quizImageContainer}>
            <Image source={require("@/assets/images/quizimage.png")} />
          </View>

          <TouchableOpacity
            style={[
              styles.previewbutton,
              isStartButtonDisabled && styles.disabledButton,
            ]}
            onPress={handleStartQuiz}
            disabled={isStartButtonDisabled}
          >
            <Text style={styles.previewtext}>
              {isStartButtonDisabled ? "Quiz Started" : "Start Quiz"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Pressable
            style={styles.backTozeroindex}
            onPress={() => {
              setQuizStarted(false);
              setCurrentQuestionIndex(0);
              setUserAnswers([]);
            }}
          >
            <Text style={styles.headerIcon}>
              <AntDesign name="arrowleft" size={20} color="#000" />
            </Text>
            <Text style={styles.backtoquizinstructiontext}>
              Back to quiz Instructions
            </Text>
          </Pressable>

          <Text style={styles.questionText}>
            {quiz?.questions[currentQuestionIndex]?.text || "Loading..."}
          </Text>
          <ScrollView>
            {quiz?.questions[currentQuestionIndex]?.answers.map((answer) => (
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
                    {currentQuestionIndex === (quiz?.questions.length || 0) - 1
                      ? "Finish"
                      : "Next"}
                  </Text>
                  <AntDesign name="arrowright" color="#fff" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {quizCompleted && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={quizCompleted}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Quiz Completed!</Text>
                  <Text>Total Score: {quizSummary?.score}</Text>
                  <Text>Total Questions: {quiz?.questions.length}</Text>
                  <Text>Correct Answers: {quizSummary?.correct_answers}</Text>

                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
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
  disabledButton: {
    backgroundColor: '#cccccc',
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
  modulequiz: {
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

  backtoquizinstructiontext: {
    fontWeight: "bold",
    fontSize: 16,
  },
  quizImageContainer: {
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
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  markCompleteButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default QuizPage;