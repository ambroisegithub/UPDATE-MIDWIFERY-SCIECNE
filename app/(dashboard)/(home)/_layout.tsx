import { Stack } from "expo-router";

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Learn" />
      <Stack.Screen name="PreConception" />
      <Stack.Screen name="SingleCourse" />
      <Stack.Screen name="CourseOverView" />
      <Stack.Screen name="Course" />
      <Stack.Screen name="quizpage" />
    </Stack>
  );
}
