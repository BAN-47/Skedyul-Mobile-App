import { Stack } from 'expo-router'
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter'
import { Oswald_400Regular, Oswald_500Medium, Oswald_700Bold } from '@expo-google-fonts/oswald'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_700Bold,
  })

  if (!fontsLoaded) return null

  return <Stack screenOptions={{ headerShown: false }} />
}

