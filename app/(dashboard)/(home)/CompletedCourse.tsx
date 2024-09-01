import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";

import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";

// Updated interface to match the actual response structure
interface CompletedCourseData {
  course_id: number;
  course_title: string;
  course_description: string;
  course_image: string;
  category: string | null;
  instructor: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface CompletedCoursesResponse {
  completed_courses?: CompletedCourseData[];
}

const CompletedCourse = () => {
  const [completedCourses, setCompletedCourses] = useState<CompletedCourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchCompletedCourses = async () => {
    const userId = await AsyncStorage.getItem("user_id");
    if (userId) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://fcmc.muberarugo.org/api/courses/completed-courses/${userId}/`
        );
        const data: CompletedCoursesResponse = await response.json();
        // console.log("Completed Course", data);
        
        // Safely access completed_courses and default to empty array
        setCompletedCourses(data.completed_courses || []);
      } catch (error: any) {
        if (error.message && error.message.includes("Network request failed")) {
          Alert.alert(
            "Network Error",
            "Unable to connect to the network. Please check your internet connection and try again."
          );
        }
        setCompletedCourses([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCompletedCourses();
    }, [])
  );

  const uniqueCompletedCourses = completedCourses.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.course_id === value.course_id)
  );

  const truncateText = (text: string, maxLength: number) =>
    text && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const renderCourseCard = (course: CompletedCourseData) => (
    <TouchableOpacity 
      key={course.course_id} 
      style={styles.card}
    >
      <View style={styles.courseImageContainer}>
        {course.course_image ? (
          <Image 
            source={{ uri: course.course_image }} 
            style={styles.courseImage} 
            resizeMode="cover"
          />
        ) : (
          <MaterialIcons name="image" size={40} color="#BDBDBD" />
        )}
      </View>

      <View style={styles.courseDetailsContainer}>
        <Text style={styles.courseTitle}>
          {truncateText(course.course_title, 40)}
        </Text>
        
        <View style={styles.instructorContainer}>
          <Feather name="user" size={16} color="#666" />
          <Text style={styles.instructorName}>
            {`${course.instructor.first_name} ${course.instructor.last_name}`}
          </Text>
        </View>

        {course.course_description && (
          <Text style={styles.courseDescription}>
            {truncateText(course.course_description, 100)}
          </Text>
        )}

        <View style={styles.completionBadge}>
          <Feather name="check-circle" size={18} color="#4CAF50" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.MyProfile}>
        <View style={styles.headerIcon}>
          <AntDesign
            name="left"
            size={23}
            color="#000"
            onPress={() => navigation.goBack()}
          />
        </View>
        <View>
          <Text style={styles.overViewtext}>Completed Courses</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27AE60" />
        </View>
      ) : uniqueCompletedCourses.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No completed courses found.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {uniqueCompletedCourses.map(renderCourseCard)}
        </ScrollView>
      )}
    </View>
  );
};

export default CompletedCourse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  MyProfile: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 15,
    gap: 70,
  },
  headerIcon: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 8,
    elevation: 3,
  },
  overViewtext: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 15,
  },
  courseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  courseImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  courseDetailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  instructorName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  courseDescription: {
    fontSize: 13,
    color: "#888",
    marginBottom: 10,
  },
  completionBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  completedText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 5,
    fontWeight: "500",
  },
});