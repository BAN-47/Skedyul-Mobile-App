import { Image, Pressable, Text, View } from 'react-native'
import { facultyImageUrl, type FacultyDashboard } from '../lib/api'
import { styles } from '../styles/facultyStyles'
import { getInitials } from '../utils/formatters'

function HeaderStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.headerStat}><Text style={styles.headerStatLabel}>{label}</Text><Text style={styles.headerStatValue}>{value}</Text></View>
}

export function FacultyHeader({ dashboard, onOpenProfile }: { dashboard: FacultyDashboard; onOpenProfile: () => void }) {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening'
  const dateLabel = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
  const sectionCount = new Set(dashboard.schedules.map(item => item.section).filter(Boolean)).size

  return (
    <View style={styles.homeHeader}>
      <Text style={styles.homeDate}>{dateLabel}</Text>
      <View style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Text style={styles.homeGreeting}>Good {greeting}, {dashboard.faculty.first_name || dashboard.faculty.name.split(' ')[0]}</Text>
          <Text style={styles.homeSubtitle}>{dashboard.faculty.program || 'Faculty'} · {dashboard.semester?.name || 'Current semester'} {dashboard.semester?.academic_year || ''}</Text>
        </View>
        <Pressable onPress={onOpenProfile} style={styles.headerAvatar} accessibilityLabel="Open profile menu">
          {facultyImageUrl(dashboard.faculty.profile_image) ? <Image source={{ uri: facultyImageUrl(dashboard.faculty.profile_image)! }} style={styles.headerAvatarImage} /> : <Text style={styles.headerAvatarText}>{getInitials(dashboard.faculty.name)}</Text>}
        </Pressable>
      </View>
      <View style={styles.headerStats}>
        <HeaderStat label="Teaching Load" value={`${dashboard.load.hours} hrs`} />
        <HeaderStat label="Subjects" value={String(dashboard.subject_count)} />
        <HeaderStat label="Sections" value={String(sectionCount)} />
      </View>
    </View>
  )
}
