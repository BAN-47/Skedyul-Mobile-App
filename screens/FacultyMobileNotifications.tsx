import { Text, View } from 'react-native'
import type { FacultyDashboard } from '../lib/api'
import { styles } from '../styles/facultyStyles'

/** Simple schedule-derived notices; these are not push notifications. */
export function FacultyMobileNotifications({ dashboard }: { dashboard: FacultyDashboard }) {
  return (
    <View style={styles.subjectsPanel}>
      <Text style={styles.panelTitle}>Notifications</Text>
      <Text style={styles.panelSubtitle}>Updates for your faculty schedule</Text>
      <View style={styles.notificationRow}><View style={styles.notificationDot} /><View style={styles.notificationCopy}><Text style={styles.notificationTitle}>Schedule overview</Text><Text style={styles.notificationText}>{dashboard.schedules.length ? `${dashboard.schedules.length} class sessions are on your schedule.` : 'Your schedule will appear here when classes are assigned.'}</Text><Text style={styles.notificationTime}>Current semester</Text></View></View>
      <View style={styles.notificationRow}><View style={[styles.notificationDot, { backgroundColor: '#16A34A' }]} /><View style={styles.notificationCopy}><Text style={styles.notificationTitle}>Teaching load</Text><Text style={styles.notificationText}>You are assigned {dashboard.load.hours} teaching hours.</Text><Text style={styles.notificationTime}>{dashboard.semester?.name || 'Semester'}</Text></View></View>
    </View>
  )
}
