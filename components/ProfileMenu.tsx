import { Image, Pressable, Text, View } from 'react-native'
import { facultyImageUrl, type FacultyDashboard } from '../lib/api'
import { styles } from '../styles/facultyStyles'
import { getInitials } from '../utils/formatters'

export function ProfileMenu({ dashboard, busy, onClose, onSettings, onSignOut }: {
  dashboard: FacultyDashboard
  busy: boolean
  onClose: () => void
  onSettings: () => void
  onSignOut: () => void
}) {
  return (
    <View style={styles.modalShade}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.profileSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.profileIdentity}>
          <View style={styles.profileAvatar}>{facultyImageUrl(dashboard.faculty.profile_image) ? <Image source={{ uri: facultyImageUrl(dashboard.faculty.profile_image)! }} style={styles.profileAvatarImage} /> : <Text style={styles.headerAvatarText}>{getInitials(dashboard.faculty.name)}</Text>}</View>
          <View style={{ flex: 1 }}><Text style={styles.profileName}>{dashboard.faculty.name}</Text><Text style={styles.profileRole}>Faculty · {dashboard.faculty.program || 'Department'}</Text></View>
        </View>
        <View style={styles.sheetDivider} />
        <Pressable style={styles.profileAction} onPress={onSettings}><Text style={styles.profileActionText}>Settings</Text><Text style={styles.profileArrow}>›</Text></Pressable>
        <Pressable style={styles.profileAction} disabled={busy} onPress={onSignOut}><Text style={styles.signOutAction}>{busy ? 'Signing out…' : 'Sign Out'}</Text></Pressable>
      </View>
    </View>
  )
}
