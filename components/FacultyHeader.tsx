import { Image, Pressable, Text, View } from 'react-native'
import { facultyImageUrl, type FacultyDashboard, type ScheduleShiftFilter } from '../lib/api'
import { styles } from '../styles/facultyStyles'
import { getInitials } from '../utils/formatters'

function HeaderStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.headerStat}><Text style={styles.headerStatLabel}>{label}</Text><Text style={styles.headerStatValue}>{value}</Text></View>
}

export function FacultyHeader({ dashboard, selectedDay, selectedShift, onOpenProfile }: { dashboard: FacultyDashboard; selectedDay: string; selectedShift: ScheduleShiftFilter; onOpenProfile: () => void }) {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening'
  const dateLabel = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
  const daySchedules = dashboard.schedules.filter(item => item.day.toLowerCase() === selectedDay.toLowerCase() && matchesShift(item, selectedShift))
  const sectionCount = new Set(daySchedules.map(item => item.section_id || item.section?.trim()).filter(Boolean)).size
  const subjectCount = new Set(daySchedules.map(item => item.course_code || item.course_name).filter(Boolean)).size
  const teachingHours = daySchedules.reduce((total, item) => {
    const toMinutes = (time: string) => {
      const [hours = '0', minutes = '0'] = time.split(':')
      return Number(hours) * 60 + Number(minutes)
    }
    return total + Math.max(0, toMinutes(item.end_time) - toMinutes(item.start_time)) / 60
  }, 0)

  return (
    <View style={styles.homeHeader}>
      <View style={styles.headerTop}>
        <Text style={styles.headerLogo} numberOfLines={1}>
          SKED<Text style={styles.logoAccentLoading}>YUL</Text>
        </Text>
        <Text style={styles.homeDate} numberOfLines={1}>
          {dateLabel}
        </Text>
      </View>
      <View style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Text style={styles.homeGreeting}>
            Good {greeting},{" "}
            {dashboard.faculty.first_name ||
              dashboard.faculty.name.split(" ")[0]}
          </Text>
          <Text style={styles.homeSubtitle}>
            {dashboard.faculty.program || "Faculty"} ·{" "}
            {dashboard.semester?.name || "Current semester"}{" "}
            {dashboard.semester?.academic_year || ""}
          </Text>
        </View>
        <Pressable
          onPress={onOpenProfile}
          style={styles.headerAvatar}
          accessibilityLabel="Open profile menu"
        >
          {facultyImageUrl(dashboard.faculty.profile_image) ? (
            <Image
              source={{
                uri: facultyImageUrl(dashboard.faculty.profile_image)!,
              }}
              style={styles.headerAvatarImage}
            />
          ) : (
            <Text style={styles.headerAvatarText}>
              {getInitials(dashboard.faculty.name)}
            </Text>
          )}
        </Pressable>
      </View>
      <View style={styles.headerStats}>
        <HeaderStat
          label={`${selectedDay}${selectedShift === 'all' ? '' : ` ${selectedShift === 'day' ? 'Day' : 'Evening'}`} Teaching Load`}
          value={`${Number.isInteger(teachingHours) ? teachingHours : teachingHours.toFixed(1)} hrs`}
        />
        <HeaderStat label="Subjects" value={String(subjectCount)} />
        <HeaderStat label="Sections" value={String(sectionCount)} />
      </View>
    </View>
  );
}

function matchesShift(item: FacultyDashboard['schedules'][number], shift: ScheduleShiftFilter) {
  if (shift === 'all') return true
  const actualShift = item.shift || (Number(item.start_time.split(':')[0]) >= 16 ? 'evening' : 'day')
  return actualShift === shift
}
