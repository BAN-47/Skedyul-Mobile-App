import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import type { FacultyDashboard, FacultySchedule } from '../lib/api'
import { FacultyScheduleDetailSheet } from '../components/FacultyScheduleDetailSheet'
import { styles } from '../styles/facultyStyles'
import { formatTime } from '../utils/formatters'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_COLORS = [
  { background: '#E1ECFF', accent: '#2862E8', title: '#204CB6' },
  { background: '#DDF9E9', accent: '#16A34A', title: '#176B39' },
  { background: '#FFF2C7', accent: '#E68A00', title: '#A95700' },
  { background: '#F1E8FF', accent: '#8555D9', title: '#6541A9' },
]

/** Faculty day view: the selected day's classes, a current/next room card, and course summary. */
export function FacultyMobileSchedule({ dashboard, onShowSummary }: { dashboard: FacultyDashboard; onShowSummary: () => void }) {
  const initialDay = DAYS.find(day => day.toLowerCase() === dashboard.today.toLowerCase()) || DAYS[0]
  const [selectedDay, setSelectedDay] = useState(initialDay)
  const [selectedClass, setSelectedClass] = useState<FacultySchedule | null>(null)
  const daySchedules = useMemo(() => dashboard.schedules
    .filter(item => item.day.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)), [dashboard.schedules, selectedDay])

  const minuteNow = new Date().getHours() * 60 + new Date().getMinutes()
  const todaySelected = selectedDay.toLowerCase() === dashboard.today.toLowerCase()
  const activeClass = todaySelected ? daySchedules.find(item => minuteNow >= timeToMinutes(item.start_time) && minuteNow < timeToMinutes(item.end_time)) : undefined
  const nextClass = todaySelected ? daySchedules.find(item => timeToMinutes(item.start_time) > minuteNow) : undefined
  const roomClass = activeClass || nextClass

  return <>
    {selectedClass ? <FacultyScheduleDetailSheet item={selectedClass} schedules={dashboard.schedules} faculty={dashboard.faculty} onClose={() => setSelectedClass(null)} /> : null}
    <View style={styles.welcomeCard}>
      <Text style={styles.welcomeOverline}>WELCOME BACK</Text>
      <Text style={styles.welcomeName}>{dashboard.faculty.name}</Text>
      <Text style={styles.welcomeMeta}>Faculty · {dashboard.faculty.program || dashboard.faculty.college || 'Department'} · {dashboard.semester?.name || 'Active semester'} {dashboard.semester?.academic_year || ''}</Text>
      <Text style={styles.scheduleWelcomeNote}>Your faculty schedule and room assignments</Text>
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs} contentContainerStyle={styles.dayTabsContent}>
      {DAYS.map(day => <Pressable key={day} onPress={() => setSelectedDay(day)} style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}>
        <Text style={[styles.dayTabText, selectedDay === day && styles.dayTabTextActive]}>{day}</Text>
      </Pressable>)}
    </ScrollView>

    <View style={styles.schedulePanel}>
      <View style={styles.schedulePanelHeading}>
        <Text style={styles.scheduleDayTitle}>{selectedDay}</Text>
        <Text style={styles.scheduleCount}>{daySchedules.length} {daySchedules.length === 1 ? 'class' : 'classes'}</Text>
      </View>
      {daySchedules.length ? daySchedules.map((item, index) => <DailyClassCard key={`${item.id}-${index}`} item={item} index={index} onPress={() => setSelectedClass(item)} />) : <View style={styles.dayEmpty}>
        <Text style={styles.emptyTitle}>No classes scheduled</Text>
        <Text style={styles.emptyCopy}>There are no faculty schedule entries for {selectedDay}.</Text>
      </View>}
    </View>

    <Text style={styles.roomSectionTitle}>Currently Using Room</Text>
    {roomClass ? <RoomStatusCard item={roomClass} active={Boolean(activeClass)} minuteNow={minuteNow} /> : <View style={styles.roomEmpty}><Text style={styles.roomEmptyText}>{todaySelected ? 'No class is currently in session and there are no more classes today.' : 'Room status is shown for today. Select today to see your current or next class.'}</Text></View>}

    <Pressable style={styles.summaryButton} onPress={onShowSummary}><Text style={styles.summaryButtonText}>▤  Show Summary of Courses</Text><Text style={styles.summaryChevron}>›</Text></Pressable>
    <Text style={styles.scheduleReadOnly}>Your schedule is view only. Contact your department chair for changes.</Text>
  </>
}

function DailyClassCard({ item, index, onPress }: { item: FacultySchedule; index: number; onPress: () => void }) {
  const color = DAY_COLORS[index % DAY_COLORS.length]
  return <View style={styles.dailyClassRow}>
    <Text style={styles.dailyClassTime}>{formatTime(item.start_time)} -      {formatTime(item.end_time)}</Text>
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${item.course_code || 'course'} schedule details`} style={[styles.dailyClassCard, { backgroundColor: color.background, borderLeftColor: color.accent }]}>
      <Text style={[styles.dailyClassMeta, { color: color.title }]} numberOfLines={1}>{item.room || 'Room not set'}</Text>
      <Text style={[styles.dailyClassCode, { color: color.title }]} numberOfLines={1}>{item.section || 'Section not set'} — {item.course_code || 'Course'}</Text>
      <Text style={[styles.dailyClassName, { color: color.title }]} numberOfLines={2}>{item.course_name || 'Course title unavailable'}</Text>
    </Pressable>
  </View>
}

function RoomStatusCard({ item, active, minuteNow }: { item: FacultySchedule; active: boolean; minuteNow: number }) {
  const start = timeToMinutes(item.start_time)
  const end = timeToMinutes(item.end_time)
  const progress = active ? Math.min(100, Math.max(0, ((minuteNow - start) / Math.max(1, end - start)) * 100)) : 0
  const minutesLeft = Math.max(0, end - minuteNow)
  return <View style={styles.roomStatusCard}>
    <View style={styles.roomStatusTop}>
      <View style={{ flex: 1 }}>
        <Text style={styles.roomStatusOverline}>{active ? 'NOW IN SESSION' : 'NEXT CLASS'}</Text>
        <Text style={styles.roomStatusRoom}>{item.room || 'Room not assigned'}</Text>
        <Text style={styles.roomStatusCourse}>{item.course_code || 'Course'} — {item.course_name || ''}</Text>
        <Text style={styles.roomStatusMeta}>{item.section || 'Section'} · {formatTime(item.start_time)}–{formatTime(item.end_time)}</Text>
      </View>
      {active ? <View style={styles.roomTimeBox}><Text style={styles.roomTimeValue}>{minutesLeft}m</Text><Text style={styles.roomTimeLabel}>remaining</Text></View> : null}
    </View>
    <View style={styles.roomProgressTrack}><View style={[styles.roomProgressFill, { width: `${progress}%` }]} /></View>
    <View style={styles.roomStatusBottom}><Text style={styles.roomStatusFaculty}>Assigned to {item.course_code || 'your class'}</Text><Text style={[styles.roomStatusBadge, active && styles.roomStatusBadgeActive]}>{active ? 'In session' : 'Upcoming'}</Text></View>
  </View>
}

function timeToMinutes(value: string) {
  const [hours = '0', minutes = '0'] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}
