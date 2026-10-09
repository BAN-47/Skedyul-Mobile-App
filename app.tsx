import { ActivityIndicator, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { FacultyMobileHome } from './screens/FacultyMobileHome'
import { FacultyMobileLogin } from './screens/FacultyMobileLogin'
import { PrimaryButton } from './components/PrimaryButton'
import { Brand } from './components/Brand'
import { useFacultySession } from './hooks/useFacultySession'
import { COLORS, styles } from './styles/facultyStyles'

/** App entry: restores a saved faculty session and chooses login or faculty screens. */
export default function SkedyulFacultyApp() {
  const session = useFacultySession()

  if (session.restoring) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar style="dark" />
        <ActivityIndicator color={COLORS.blue} size="large" />
        <Text style={styles.loadingLabel}>Opening your faculty schedule…</Text>
      </SafeAreaView>
    )
  }

  if (session.token && session.dashboard) {
    return (
      <FacultyMobileHome
        dashboard={session.dashboard}
        busy={session.busy}
        refreshing={session.refreshing}
        error={session.error}
        onRefresh={session.refresh}
        onSignOut={session.signOut}
        onSaveProfile={session.saveProfile}
        onChangePassword={session.changePassword}
        onSaveSecurity={session.saveSecurity}
        onSaveNotifications={session.saveNotifications}
        onUploadFacultyPhoto={session.uploadFacultyPhoto}
        onRemoveFacultyPhoto={session.removeFacultyPhoto}
      />
    )
  }

  if (session.token && (session.busy || session.refreshing)) {
    return (
      <SafeAreaView style={styles.setupLoadingScreen}>
        <StatusBar style="dark" />
        <View style={styles.setupLoadingCard}>
          <Brand />
          <ActivityIndicator color={COLORS.blue} size="large" />
          <Text style={styles.setupLoadingTitle}>Hold on!</Text>
          <Text style={styles.setupLoadingCopy}>We’re setting up your faculty dashboard and schedule.</Text>
          <Text style={styles.setupLoadingHint}>This should only take a moment.</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (session.token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.retryPanel}>
          <Brand />
          <Text style={styles.title}>We couldn’t load your schedule yet</Text>
          <Text style={styles.bodyCopy}>{session.error || 'Check your connection, then try again.'}</Text>
          <PrimaryButton title="Try again" busy={session.refreshing} onPress={() => void session.refresh()} />
          <Text onPress={() => void session.signOut()} style={styles.textButtonLabel}>Sign out</Text>
        </View>
      </SafeAreaView>
    )
  }

  return <FacultyMobileLogin busy={session.busy} error={session.error} onSignIn={session.signIn} />
}
