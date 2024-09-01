import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Article {
  id: number;
  title: string;
  content: string;
  cover_image: string;
  created_at: string;
}

interface Comment {
  id: number;
  update: number;
  author: {
    first_name: string;
    last_name: string;
    email: string;
  };
  content: string;
  created_at: string;
}

export default function SingleArticle() {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingLike, setSubmittingLike] = useState(false);
  const { id } = useLocalSearchParams();
  const [showComments, setShowComments] = useState(false);

  const fetchArticleDetails = async () => {
    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/updates/${id}/`
      );
      const data = await response.json();
      setArticle(data);


      const commentsResponse = await fetch(
        `https://fcmc.muberarugo.org/api/updates/${id}/comments/`
      );
      const commentsData = await commentsResponse.json();
      setComments(commentsData);
      setLoading(false);
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        );
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleDetails();
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    try {
      setSubmittingComment(true);
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in and try again.");
        return;
      }
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/updates/${id}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: comment.trim(),
            user_id: JSON.parse(userId),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowCommentBox(false);
        setComment("");
        Alert.alert("Success", "Comment added successfully!");
        
        fetchArticleDetails();
      } else {
        Alert.alert("Error", data.message || "Failed to add comment");
      }
    } catch (error:any) {
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the network. Please check your internet connection and try again."
        );
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
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
          <Text style={styles.overViewtext}>Updates Details</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {article && (
          <>
            <Image source={{ uri: article.cover_image }} style={styles.image} />
            <View style={styles.titleView}>
              <Text style={styles.title}>{article.title}</Text>
            </View>
            <Text style={styles.content}>{article.content}</Text>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => setLiked(!liked)}
                disabled={submittingLike}
              >
                {submittingLike ? (
                  <ActivityIndicator size="small" color="#27AE60" />
                ) : (
                  <AntDesign
                    name={liked ? "heart" : "hearto"}
                    size={24}
                    color={liked ? "red" : "gray"}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCommentBox(!showCommentBox)}
              >
                <AntDesign name="message1" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {showCommentBox && (
              <View style={styles.commentBox}>
                <TextInput
                  style={styles.input}
                  multiline
                  placeholder="Add a comment"
                  value={comment}
                  onChangeText={(text) => setComment(text)}
                  editable={!submittingComment}
                />
                <TouchableOpacity
                  style={[
                    styles.commentButton,
                    submittingComment && styles.disabledButton,
                  ]}
                  onPress={handleCommentSubmit}
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.commentButtonText}>Add Comment</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity onPress={() => setShowComments(!showComments)}>
              <Text>
                {showComments
                  ? "Hide Comments"
                  : `View Comments (${comments.length})`}
              </Text>
            </TouchableOpacity>

            {showComments && (
              <View style={styles.commentsContainer}>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <Text style={styles.commentAuthor}>
                        {`Author: ${comment.author.first_name} ${comment.author.last_name}`}
                      </Text>
                      <Text style={styles.commentContent}>
                        {comment.content}
                      </Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.created_at).toLocaleString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noComments}>No comments available</Text>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderColor: "#ccc",
    elevation: 3,
    borderWidth: 1,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "100%",
  },
  content: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  commentBox: {
    marginTop: 20,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: "top",
  },
  commentButton: {
    marginTop: 10,
    backgroundColor: "#23A64A",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  commentButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  MyProfile: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
    gap: 60,
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
  titleView: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  disabledButton: {
    opacity: 0.7,
  },
  commentsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  commentItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
    textAlign: "left",
  },
  noComments: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    paddingVertical: 10,
  },
});
