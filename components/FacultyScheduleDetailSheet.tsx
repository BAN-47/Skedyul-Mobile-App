import { Pressable, ScrollView, Text, View } from 'react-native'
import type { FacultyProfile, FacultySchedule } from '../lib/api'
import { styles } from '../styles/facultyStyles'
import { formatTime } from '../utils/formatters'

export function FacultyScheduleDetailSheet({ item, schedules, faculty, onClose }: {
  item: FacultySchedule
  schedules: FacultySchedule[]
  faculty: FacultyProfile
  onClose: () => void
}) {
  const days = [...new Set(schedules
    .filter(schedule => schedule.course_code === item.course_code
      && schedule.section === item.section
      && schedule.start_time === item.start_time
      && schedule.end_time === item.end_time
      && schedule.room === item.room)
    .map(schedule => shortDay(schedule.day)))]
  const scheduleText = `${days.join('/')} ${formatTime(item.start_time)} - ${formatTime(item.end_time)}`
  const durationMinutes = Math.max(0, toMinutes(item.end_time) - toMinutes(item.start_time))
  const hoursText = item.lecture_hours != null || item.lab_hours != null
    ? [item.lecture_hours ? `${item.lecture_hours}h Lecture` : '', item.lab_hours ? `${item.lab_hours}h Lab` : ''].filter(Boolean).join(' · ') || '—'
    : formatDuration(durationMinutes)

  return <View style={styles.modalShade}>
    <Pressable style={styles.modalBackdrop} onPress={onClose} accessibilityLabel="Close schedule details" />
    <View style={styles.scheduleDetailSheet}>
      <View style={styles.sheetHandle} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scheduleDetailHero}>
          <Text style={styles.scheduleDetailCode}>{item.course_code || 'Course'} · {item.section || 'Section'}</Text>
          <Text style={styles.scheduleDetailTitle}>{item.course_name || 'Course title unavailable'}</Text>
          <Text style={styles.scheduleDetailDepartment}>{faculty.program || faculty.college || 'Faculty Department'}</Text>
        </View>

        <View style={styles.scheduleDetailGrid}>
          <DetailTile label="UNITS" value={item.units == null ? '—' : `${item.units}u`} />
          <DetailTile label="HOURS" value={hoursText} />
          <DetailTile label="ROOM" value={item.room || 'Not assigned'} />
          <DetailTile label="SECTION" value={item.section || '—'} />
        </View>
        <DetailTile label="SCHEDULE" value={scheduleText} wide />
        <View style={styles.scheduleDetailFaculty}>
          <Text style={styles.detailTileLabel}>FACULTY</Text>
          <Text style={styles.detailTileValue}>{faculty.name}</Text>
          <Text style={styles.scheduleDetailDepartment}>Faculty · {faculty.program || faculty.college || 'Department'}</Text>
        </View>
      </ScrollView>
      <Pressable style={styles.scheduleDetailClose} onPress={onClose}><Text style={styles.scheduleDetailCloseText}>Close</Text></Pressable>
    </View>
  </View>
}

function DetailTile({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <View style={[styles.scheduleDetailTile, wide && styles.scheduleDetailWideTile]}>
    <Text style={styles.detailTileLabel}>{label}</Text>
    <Text style={styles.detailTileValue}>{value}</Text>
  </View>
}

function shortDay(day: string) {
  return day.slice(0, 3)
}

function toMinutes(value: string) {
  const [hours = '0', minutes = '0'] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes}m`
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
