import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface Grade {
  id: number;
  user: number;
  quiz: Quiz;
  exam: string | null;
  score: string;
  total_score: number;
  course_id: number;
  assessment_title: string;
  type: string;
  percentage: number;
}

interface Quiz {
  id: number;
  course: number;
  title: string;
  total_marks: number;
}

interface GradesProps {
  grades: Grade[];
  gradeLoading: boolean;
}

const GradesSection: React.FC<GradesProps> = ({ grades, gradeLoading }) => {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#27AE60';   
    if (percentage >= 80) return '#2D9CDB';  
    if (percentage >= 70) return '#F2994A';  
    if (percentage >= 60) return '#F2C94C'; 
    return '#EB5757'; 
  };

  const getGradeStatus = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AntDesign name="piechart" size={24} color="#4A90E2" />
        <Text style={styles.headerTitle}>Course Grades</Text>
      </View>

      {gradeLoading ? (
        <ActivityIndicator size="large" color="#27AE60" style={styles.loader} />
      ) : grades.length > 0 ? (
        <ScrollView 
          contentContainerStyle={styles.gradesScrollView}
          showsVerticalScrollIndicator={false}
        >
          {grades.map((grade) => (
            <View 
              key={grade.id} 
              style={[
                styles.gradeCard, 
                { borderLeftColor: getGradeColor(grade.percentage) }
              ]}
            >
              <View style={styles.gradeHeader}>
                <Text style={styles.assessmentTitle}>
                  {grade.assessment_title || (grade.type === 'Quiz' ? 'Quiz' : 'Exam')}
                </Text>
                <Text 
                  style={[
                    styles.gradePercentage, 
                    { color: getGradeColor(grade.percentage) }
                  ]}
                >
                  {grade.percentage}%
                </Text>
              </View>
              
              <View style={styles.gradeDetails}>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Score</Text>
                  <Text style={styles.scoreValue}>
                    {grade.score} / {grade.total_score}
                  </Text>
                </View>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <Text 
                    style={[
                      styles.statusValue, 
                      { color: getGradeColor(grade.percentage) }
                    ]}
                  >
                    {getGradeStatus(grade.percentage)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noGradesContainer}>
          <AntDesign name="frowno" size={50} color="#BDBDBD" />
          <Text style={styles.noGradesText}>No grades available yet</Text>
          <Text style={styles.noGradesSubtext}>
            Complete quizzes and exams to see your progress
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradesScrollView: {
    paddingBottom: 20,
  },
  gradeCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderLeftWidth: 5,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assessmentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  gradePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  scoreLabel: {
    color: '#828282',
    fontSize: 12,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F4F4F',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    color: '#828282',
    fontSize: 12,
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  noGradesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noGradesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#828282',
    marginTop: 15,
  },
  noGradesSubtext: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default GradesSection;