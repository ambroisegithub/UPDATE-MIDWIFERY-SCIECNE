import { Stack } from "expo-router";

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Settings" />
      <Stack.Screen name="Privacy" />
    </Stack>
  );
}
