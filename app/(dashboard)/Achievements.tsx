import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  Alert
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface Certificates {
  id: number;
  issued_date: string;
  cpd: number;
  user: {
    registration_number: string;
    first_name: string;
    last_name: string;
    email: string;
    telephone: string;
    date_of_birth: string;
    role: string;
    profile_image: string | null;
  };
  course: Course | null;
  exam: {
    id: number;
    course: number;
    title: string;
    total_marks: number;
    questions: {
      id: number;
      text: string;
      exam: number;
      answers: {
        id: number;
        question: number;
        text: string;
        is_correct: boolean;
      }[];
    }[];
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  course_image: string;
  instructor: {
    full_name: string;
  };
}
interface CertificateInfo {
  status: string;
  certificate: {
    user: {
      registration_number: string;
      name: string;
      email: string;
    };
    exam: string;
    course: {
      title: string;
      description: string;
      cpd: number;
    };
    issued_date: string;
    score_percentage: number;
    cpd: number;
  };
}

const Achievements = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [certificates, setCertificates] = useState<Certificates[]>([]);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateInfo | null>(null);

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

  const generateCertificateHTML = () => {
    if (!selectedCertificate) return "";

    const {
      certificate: {
        user: { name },
        course: { title: courseTitle, cpd },
        exam,
        issued_date: issuedDate,
        score_percentage: score,
      },
    } = selectedCertificate;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      background-image: linear-gradient(to bottom, #F0F8FF, #B0E0E6);
      margin: 0;
      color: #333;
    }
    .certificate-container {
      width: 100%;
      max-width: 850px;
      padding: 40px;
      border: 1px solid #4CAF50;
      border-radius: 8px;
      background-color: #ffffff;
      text-align: center;
      position: relative;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-image: linear-gradient(to right, #4CAF50, #339206);
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 4px 4px 0 0;
    }
    .header-logo {
      max-height: 50px;
    }
    .header-text {
      font-size: 18px;
      font-weight: bold;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      color: #4CAF50;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 18px;
      font-weight: 600;
      color: #666;
      margin-bottom: 10px;
    }
    .content {
      font-size: 16px;
      margin: 15px 0;
      line-height: 1.6;
    }
    .recipient-name {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin: 20px 0;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-image: linear-gradient(to right, #4CAF50, #339206);
      color: #ffffff;
      padding: 20px 20px;
      border-radius: 0 0 4px 4px;
      font-size: 14px;
    }
    .signature-section {
      text-align: left;
    }
    .signature {
      font-weight: bold;
      color: #333;
    }
    .date {
      text-align: right;
      color: #fff;
      font-weight: bold;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="header">
      <img src="https://res.cloudinary.com/dtl8gpxzt/image/upload/v1730735161/uo8nivq6xnr73t0kp8c8.png" alt="Logo" class="header-logo"> <!-- Add actual logo image path -->
      <div class="header-text">Rwanda Association of Midwives</div>
    </div>
  
    <div class="title">Certificate of Participation</div>
    <div class="subtitle">Course: ${courseTitle} (CPD: ${cpd})</div>
    <div class="content">This certificate is awarded to:</div>
    <div class="recipient-name">${name}</div>
    <div class="content">
      For achieving a score of ${score}% in the exam titled: ${exam}.
    </div>
    <div class="footer">
      <div class="signature-section">
        
          <img src="https://res.cloudinary.com/dtl8gpxzt/image/upload/v1730735161/xn889ko3dvgnhu9zwtik.png" alt="Logo" class="header-logo">
        <div>Josephine MUREKEZI</div>
        <div class="signature">President of Rwanda Association of Midwives</div>
      </div>
      <div class="date">
        Date: ${new Date(issuedDate).toLocaleDateString()}
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handlePrint = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateCertificateHTML(),
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      // console.error("Error generating certificate:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchCertificates = async () => {
        setLoading(true);
        try {
          const userId = await AsyncStorage.getItem("user_id");
          const response = await fetch(
            `https://fcmc.muberarugo.org/api/exams/user/${userId}/certificates/`
          );
          const data = await response.json();
          setCertificates(
            data.certificates.map((cert: { cpd: any }) => ({
              ...cert,
              cpd: cert.cpd || 0,
            })) || []
          );
        } catch (error:any) {
          if (error.message && error.message.includes("Network request failed")) {
            Alert.alert(
              "Network Error",
              "Unable to connect to the network. Please check your internet connection and try again."
            );
          }
        } finally {
          setLoading(false);
        }
      };

      fetchCertificates();
    }, [])
  );

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCertificate(null);
  };

  const generateCertificate = async (examId: number) => {
    const userId = await AsyncStorage.getItem("user_id");
    try {
      const response = await fetch(
        `https://fcmc.muberarugo.org/api/exams/${examId}/certificate/${userId}/`
      );
      const data: CertificateInfo = await response.json();
      // console.log("Certificate Generated:", data);
      if (response.ok) {
        setSelectedCertificate(data);
        openModal();
      } else {
        // console.error(data.status);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIcon}
        >
          <AntDesign name="left" size={23} color="#000" />
        </TouchableOpacity>
        <Text style={styles.profileText}>Achievements</Text>
        <TouchableOpacity style={styles.menuButton}></TouchableOpacity>
      </View>

      <View style={styles.totalAchievementsContainer}>
        <View style={styles.totalAchievements}>
          <View style={styles.achievementDetails}>
            <Text style={styles.totalAchievementText}>
              Total Achievements: {certificates.length}
            </Text>
            <Text style={styles.achievementSubtext}>
              Great job, {fullName}, That's Your Complete achievements.
            </Text>
          </View>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#27AE60" style={styles.loader} />
      ) : (
        <ScrollView style={styles.achievementsContainer}>
          {certificates.map((certificate, index) => (
            <TouchableOpacity
              key={certificate.id}
              style={[styles.card, { backgroundColor: "#9BD2FC" }]}
            >
              <View style={styles.cardImage}>
                <Image
                  source={require("@/assets/images/cupaward.png")}
                  style={styles.ImageView}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.TitleText}>
                  Exam Name: {certificate.exam.title}
                </Text>

                <Text style={styles.subtitle}>
                  Date: {certificate.issued_date}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.certificateButton}
                onPress={() => generateCertificate(certificate.exam.id)}
              >
                <Text style={styles.certificateButtonText}>
                  View Certificate
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                {selectedCertificate && (
                  <View style={styles.certificateContainer}>
                    <View style={styles.headerContainer}>
                      <Image
                        source={require("@/assets/images/CertificateLogo.png")}
                        style={styles.logo}
                      />
                      <View>
                        <Text style={styles.headerText}>
                          Rwanda Association of Midwives
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.title}>Certificate of Achievement</Text>
                    <Text style={styles.subtitle}>
                      Course: {selectedCertificate.certificate.course.title}{" "}
                      (CPD: {selectedCertificate.certificate.course.cpd})
                    </Text>
                    <Text style={styles.content}>
                      This certificate is awarded to:
                    </Text>
                    <Text style={styles.awardeeName1}>
                      {selectedCertificate.certificate.user.name}
                    </Text>
                    <Text style={styles.content}>
                      For achieving a score of{" "}
                      {selectedCertificate.certificate.score_percentage}% in the
                      exam titled: {selectedCertificate.certificate.exam}.
                    </Text>
                    <Image
                      source={require("@/assets/images/CertificateSignature.png")}
                      style={styles.signature}
                    />

                    <View style={styles.FooterContainer}>
                      <View style={styles.awardeeNameContainer}>
                        <Text style={styles.awardeeName}>
                          Josephine MUREKEZI
                        </Text>
                        <Text style={styles.presidentText}>
                          President of Rwanda Association of Midwives
                        </Text>
                      </View>

                      <Text style={styles.footer}>
                        Date: {selectedCertificate.certificate.issued_date}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.printButton}
                      onPress={handlePrint}
                    >
                      <Text style={styles.printButtonText}>
                        Download & Share Certificate
                      </Text>
                      <AntDesign name="download" color="#fff" size={20} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </View>
  );
};

export default Achievements;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 5,
  },
  profileText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "500",
  },
  headerIcon: {
    padding: 10,
    backgroundColor: "#FCFCFE",
    borderRadius: 10,
    elevation: 3,
  },
  menuButton: {
    padding: 10,
    backgroundColor: "#FCFCFE",
    borderRadius: 10,
    elevation: 3,
  },
  totalAchievements: {
    alignItems: "center",
    marginVertical: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    width: "100%",
    paddingVertical: 30,
    borderColor: "#D4D1D1",
    borderRadius: 5,
  },
  totalAchievementsContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  achievementDetails: {
    paddingLeft: 10,
  },
  totalAchievementText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  achievementSubtext: {
    fontSize: 12,
    color: "#000",
    marginTop: 5,
    width: "70%",
  },
  achievementsContainer: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    padding: 13,
    backgroundColor: "#F8F8F8",
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
  },
  cardImage: {
    marginRight: 10,
  },
  ImageView: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FF8504",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  TitleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  rateView: {
    flexDirection: "row",
    marginVertical: 5,
  },
  shortDisc: {
    fontSize: 14,
    color: "#ffffff",
  },
  RateTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "98%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
  },
  closeButton: { position: "absolute", top: 10, right: 10 },
  closeButtonText: { fontSize: 18, color: "#333" },

  certificateContainer: {
    marginVertical: 20,
  },
  logo: { width: 80, height: 80, marginBottom: 10, resizeMode: "contain" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "bold",
  },
  content: { fontSize: 16, color: "#333", marginVertical: 10 },
  awardeeName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  awardeeName1: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  signature: {
    width: 100,
    height: 50,
    marginVertical: 10,
    resizeMode: "contain",
  },

  printButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 20,
  },

  certificateButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#FF8504",
    borderRadius: 5,
    alignSelf: "center",
  },
  certificateButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  printButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#4CAF50",
    height: 50,
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  awardeeNameContainer: {
    flexDirection: "column",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
  },
  presidentText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  FooterContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#4CAF50",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
  },
  loader: { marginTop: 20 },
});
