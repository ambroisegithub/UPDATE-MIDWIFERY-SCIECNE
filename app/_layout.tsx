import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import NoNetwork from './screen/NoNetwork';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    UrbanistBold: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  if (!loaded) {
    return null;
  }

  if (isConnected === false) {
    return <NoNetwork />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
