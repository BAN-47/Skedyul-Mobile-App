import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ErrorBanner } from '../components/ErrorBanner'
import { PrimaryButton } from '../components/PrimaryButton'
import { styles } from '../styles/facultyStyles'

/** Faculty sign-in screen. Login requests are handled by the Laravel API. */
export function FacultyMobileLogin({ busy, error, onSignIn }: { busy: boolean; error: string; onSignIn: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <SafeAreaView style={styles.signInSafe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.signInScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.signInTop}>
            <Text style={styles.loginLogo}>SKED<Text style={styles.loginLogoAccent}>YUL</Text></Text>
            <Text style={styles.loginPortal}>FACULTY PORTAL</Text>
          </View>
          <View style={styles.signInCard}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in with your Skedyul faculty account.</Text>
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="name@school.edu" placeholderTextColor="#9AA4B5" autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" editable={!busy} returnKeyType="next" />
            <Text style={[styles.inputLabel, styles.passwordLabel]}>Password</Text>
            <View style={styles.signInPasswordRow}>
              <TextInput style={styles.signInPasswordInput} value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="#9AA4B5" autoCapitalize="none" secureTextEntry={!showPassword} textContentType="password" editable={!busy} onSubmitEditing={() => void onSignIn(email, password)} returnKeyType="go" />
              <Pressable onPress={() => setShowPassword(value => !value)} style={styles.passwordEyeButton} accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                <Text style={styles.passwordEyeText}>{showPassword ? '◎' : '◉'}</Text>
              </Pressable>
            </View>
            {error ? <ErrorBanner message={error} /> : null}
            <PrimaryButton title="Sign in" busy={busy} onPress={() => void onSignIn(email, password)} />
            <Text style={styles.facultyOnly}>Faculty profile required · No sign-up from this app</Text>
          </View>
          <Text style={styles.footerText}>Skedyul · Faculty schedule access</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
