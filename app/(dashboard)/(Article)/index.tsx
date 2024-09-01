import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Article {
  id: number;
  title: string;
  content: string;
  cover_image: string;
  created_at: string;
}

export default function ArticleUpdate() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedArticles, setLikedArticles] = useState<number[]>([]);
  const navigation = useNavigation();
  const route = useRouter();

  const fetchArticles = async () => {
    try {
      const response = await fetch("https://fcmc.muberarugo.org/api/updates/");
      const data = await response.json();
      console.log("All updates",data)
      setArticles(data);
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchArticles();
    }, [])
  );

  const handleLike = (id: number) => {
    setLikedArticles((prev) =>
      prev.includes(id) ? prev.filter((articleId) => articleId !== id) : [...prev, id]
    );
  };

  const navigateToArticle = (articleId: number) => {
    route.push({
      pathname: "/(dashboard)/(Article)/SingleArticle",
      params: { id: articleId },
    });
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <AntDesign name="left" size={23} color="#000" />
        </TouchableOpacity>
        <Text style={styles.profileText}>Updates and Articles</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {articles.length === 0 ? (
          <View style={styles.noArticlesContainer}>
            <Text style={styles.noArticlesText}>No articles or updates available at the moment.</Text>
          </View>
        ) : (
          articles.map((article) => (
            <View key={article.id} style={styles.card}>
              <Image source={{ uri: article.cover_image }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.title}>{article.title}</Text>
                <Text style={styles.description} numberOfLines={3}>
                  {article.content}
                </Text>
                <View style={styles.footer}>
                  <TouchableOpacity onPress={() => handleLike(article.id)}>
                    <AntDesign
                      name={likedArticles.includes(article.id) ? "heart" : "hearto"}
                      size={24}
                      color={likedArticles.includes(article.id) ? "red" : "gray"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigateToArticle(article.id)} style={styles.ArticleView}>
                    <Text style={styles.viewButton}>View Article</Text>
                  </TouchableOpacity>
                  <Text style={styles.date}>
                    {new Date(article.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingTop: 50,
    paddingBottom: 20,
  },
  profileText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 20,
  },
  headerIcon: {
    padding: 10,
    backgroundColor: "#FCFCFE",
    borderRadius: 10,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  noArticlesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noArticlesText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  date: {
    fontSize: 12,
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewButton: {
    color: "white",
    textDecorationLine: "underline",
    fontSize: 14,
    fontWeight:"500"
  },
  ArticleView:{
    backgroundColor:"#23A64A",
    alignItems:"center",
    paddingVertical:3,
    paddingHorizontal:10,
    borderRadius:3,
  }
});
