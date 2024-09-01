import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from "react-native";

import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import axios from "axios";

interface Course {
  course_id: number;
  course_title: string;
  course_description: string;
  course_image: string | null;
  instructor: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const CourseInProgress: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const navigation = useNavigation();

  const fetchCoursesInProgress = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      
      if (!userId) {
        // throw new Error('User ID not found');
      }

      const response = await axios.get(`https://fcmc.muberarugo.org/api/courses/in-progress/${userId}`);
      
      setCourses(response.data.courses_in_progress);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCoursesInProgress();
    }, [fetchCoursesInProgress])
  );

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity 
      key={course.course_id} 
      style={styles.card}
      onPress={() => {
      }}
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

        <View style={styles.progressBadge}>
          <Feather name="clock" size={18} color="#2196F3" />
          <Text style={styles.progressText}>In Progress</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNoCourses = () => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>No courses in progress</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
        <View>
          <Text style={styles.overViewtext}>Courses in Progress</Text>
        </View>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27AE60" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {courses.length > 0 
            ? courses.map(renderCourseCard) 
            : renderNoCourses()}
        </ScrollView>
      )}
    </View>
  );
};

export default CourseInProgress;

const { width } = Dimensions.get('window');

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
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcon: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 8,
    marginRight: 15,
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
    paddingTop: 15,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  courseImageContainer: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
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
    flexWrap: 'wrap',
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
  progressBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 12,
    color: "#2196F3",
    marginLeft: 5,
    fontWeight: "500",
  },
});