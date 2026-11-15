import { Stack } from 'expo-router'
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
  

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />
}

