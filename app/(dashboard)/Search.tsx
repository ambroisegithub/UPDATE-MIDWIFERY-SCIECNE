import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

interface Category {
  id: number;
  name: string;
  description: string;
}

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

const truncateTitle = (title: string, maxLength: number) => {
  return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
};

const Search = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const response = await fetch(
        "https://fcmc.muberarugo.org/api/courses/categories/"
      );
      const data = await response.json();
      setCategories(data);
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        );
      }
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchCourses = async (query = "") => {
    setIsCoursesLoading(true);
    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/courses/search/?q=${query}`
      );
      const data = await response.json();
      setCourses(data);
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        );
      }
    } finally {
      setIsCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses(searchQuery);
  }, [searchQuery]);

  const handleSearchInput = (text: string) => {
    setSearchQuery(text);
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
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#6FA456", "#6FA456", "#6FA456", "#61A143"]}
          style={styles.background}
        >
          <Image
            source={require("@/assets/images/searchcloud.png")}
            style={styles.researchImage}
          />
          <Image
            source={require("@/assets/images/searchcloud1.png")}
            style={styles.researchImage1}
          />
          <View style={styles.header}>
            <View style={styles.cloudViewone}>
              <Text style={styles.headerTitle}>Which Course</Text>
            </View>
            <View style={styles.cloudViewtwo}>
              <Text style={styles.headerSubtitle}>
                would you like to learn?
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBarContainer, isFocused && styles.focusedBorder]}
        >
          <Ionicons
            name="search"
            size={20}
            color="#339206"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search Language..."
            placeholderTextColor="#C4C4C4"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChangeText={handleSearchInput}
          />
        </View>
      </View>

      <View style={styles.categoriesView}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {isCategoriesLoading ? (
          <ActivityIndicator size="large" color="#27AE60" />
        ) : (
          <ScrollView>
            {categories.length === 0 ? (
              <Text style={styles.noCategoriesText}>No categories found</Text>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryCard}
                  >
                    <Text style={styles.categoryname}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              />
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.PreviousCourseContainer}>
        <Text style={styles.previousCoursesTitle}>Previous Courses</Text>
        {isCoursesLoading ? (
          <ActivityIndicator size="large" color="#27AE60" />
        ) : courses.length === 0 ? (
          <Text style={styles.noMatchText}>No courses match your search</Text>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.courseCard}
                onPress={() => navigateToCourse(item.id)}
              >
                <Image
                  source={
                    item.course_image
                      ? { uri: item.course_image }
                      : require("@/assets/images/defaultCourseImage.png")
                  }
                  style={styles.courseImage}
                />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>
                    {truncateTitle(item.title, 30)}
                  </Text>
                  <Text style={styles.courseDescription}>
                    Instructor: {item.instructor?.full_name}
                  </Text>
                </View>
                <AntDesign name="right" size={18} color="#B3B3B3" />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFF0",
    flexGrow: 1,
  },
  header: {
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginVertical: 20,
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  focusedBorder: {
    borderWidth: 1,
    borderColor: "#F0FFF0",
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  categoryCard: {
    alignItems: "center",
    marginRight: 5,
    backgroundColor: "#339206",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  categoryCardImage: {
    marginRight: 0,
    marginBottom: 0,
  },

  categoryImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
    marginBottom: 5,
    objectFit: "contain",
  },

  categoryName: {
    fontSize: 14,
    color: "#000",
    fontWeight: "medium",
    textAlign: "center",
  },
  previousCoursesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    paddingBottom: 20,
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
    paddingHorizontal: 20,
  },
  courseImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  courseDescription: {
    fontSize: 14,
    color: "#A5A5A5",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#EFEFEF",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#333",
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "medium",
    color: "#0C0C0C",
    marginTop: 3,
  },
  categoryList: {
    marginBottom: 24,
  },
  categoryname: {
    color: "#ffffff",
  },
  categoriesView: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  background: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 30,
    paddingBottom: 60,
  },
  button: {
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  text: {
    backgroundColor: "transparent",
    fontSize: 15,
    color: "#fff",
  },
  cloudViewone: {
    flexDirection: "row",
    gap: 60,
  },
  cloudViewtwo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerContainer: {},
  researchImage: {
    right: 60,
    position: "absolute",
    top: 20,
  },
  researchImage1: {
    right: 5,
    position: "absolute",
    top: 90,
  },
  searchContainer: {
    position: "absolute",
    width: "100%",
    left: 0,
    right: 0,
    top: 110,
    paddingHorizontal: 20,
  },
  PreviousCourseContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  noMatchText: {
    fontSize: 16,
    color: "#A5A5A5",
    textAlign: "center",
    marginVertical: 20,
  },
  noCategoriesText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default Search;
