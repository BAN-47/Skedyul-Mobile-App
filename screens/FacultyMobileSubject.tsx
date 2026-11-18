import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { FacultyDashboard, FacultySchedule } from '../lib/api'
import { styles } from '../styles/facultyStyles'
import { formatTime } from '../utils/formatters'

type SubjectFilter = 'All' | 'Lecture' | 'Laboratory' | 'Day Shift' | 'Evening Shift'
type SubjectCard = { key: string; meetings: FacultySchedule[]; course: FacultySchedule }
const FILTERS: SubjectFilter[] = ['All', 'Lecture', 'Laboratory', 'Day Shift', 'Evening Shift']

function uniqueSubjectCards(schedules: FacultySchedule[]): SubjectCard[] {
  const cards = new Map<string, SubjectCard>()
  for (const item of schedules) {
    const key = `${item.course_code || ''}|${item.section_id || item.section || ''}`
    const existing = cards.get(key)
    if (existing) existing.meetings.push(item)
    else cards.set(key, { key, course: item, meetings: [item] })
  }
  return [...cards.values()].sort((a, b) => (a.course.course_code || '').localeCompare(b.course.course_code || '') || (a.course.section || '').localeCompare(b.course.section || ''))
}

function courseKind(item: FacultySchedule): 'Lecture' | 'Laboratory' | 'Lecture & Lab' {
  if (asNumber(item.lecture_hours) > 0 && asNumber(item.lab_hours) > 0) return 'Lecture & Lab'
  if (asNumber(item.lab_hours) > 0) return 'Laboratory'
  return 'Lecture'
}

function matchesFilter(card: SubjectCard, filter: SubjectFilter) {
  if (filter === 'All') return true
  if (filter === 'Lecture') return courseKind(card.course).includes('Lecture')
  if (filter === 'Laboratory') return courseKind(card.course).includes('Lab')
  return card.meetings.some(item => item.shift === (filter === 'Evening Shift' ? 'evening' : 'day'))
}

function meetingLabel(meetings: FacultySchedule[]) {
  const unique = new Map<string, FacultySchedule>()
  meetings.forEach(item => unique.set(`${item.day}|${item.start_time}|${item.end_time}|${item.room || ''}`, item))
  return [...unique.values()].map(item => `${item.day.slice(0, 3)} · ${formatTime(item.start_time)}–${formatTime(item.end_time)}`).join('  /  ')
}

/** Searchable, filterable course and section cards for the faculty member. */
export function FacultyMobileSubject({ dashboard }: { dashboard: FacultyDashboard }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SubjectFilter>('All')
  const cards = useMemo(() => uniqueSubjectCards(dashboard.schedules), [dashboard.schedules])
  const visibleCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return cards.filter(card => {
      if (!matchesFilter(card, filter)) return false
      if (!normalizedQuery) return true
      return [card.course.course_code, card.course.course_name, card.course.section, ...card.meetings.map(item => item.room)]
        .some(value => value?.toLowerCase().includes(normalizedQuery))
    })
  }, [cards, filter, query])
  const totalUnits = cards.reduce((sum, card) => sum + asNumber(card.course.units), 0)
  const totalStudents = [...new Map(cards.map(card => [card.course.section_id || card.course.section || card.key, card.course.student_count || 0])).values()]
    .reduce<number>((sum, count) => sum + asNumber(count), 0)
  const filterCounts: Record<SubjectFilter, number> = {
    All: cards.length,
    Lecture: cards.filter(card => courseKind(card.course).includes('Lecture')).length,
    Laboratory: cards.filter(card => courseKind(card.course).includes('Lab')).length,
    'Day Shift': cards.filter(card => card.meetings.some(item => item.shift === 'day')).length,
    'Evening Shift': cards.filter(card => card.meetings.some(item => item.shift === 'evening')).length,
  }
  const lectureCount = cards.filter(card => courseKind(card.course).includes('Lecture')).length
  const labCount = cards.filter(card => courseKind(card.course).includes('Lab')).length
  const dayCount = filterCounts['Day Shift']

  return (
    <View style={styles.subjectsScreen}>
      <View style={styles.subjectsHeading}>
        <View style={styles.subjectsHeadingText}>
          <Text style={styles.subjectsPageTitle}>My Subjects</Text>
          <Text style={styles.subjectsSemester}>{dashboard.semester?.name || 'Current semester'} {dashboard.semester?.academic_year || ''} · Academic Load</Text>
        </View>
        <View style={styles.subjectUnitsBadge}>
          <Text style={styles.subjectUnitsValue}>{formatNumber(totalUnits)} UNITS</Text>
          <Text style={styles.subjectUnitsCaption}>TOTAL</Text>
        </View>
      </View>

      <View style={styles.subjectOverview}>
        <OverviewMetric label="LECTURE LOAD" value={`${sumHours(cards, 'lecture')} hrs/wk`} />
        <OverviewMetric label="LAB LOAD" value={`${sumHours(cards, 'lab')} hrs/wk`} />
        <OverviewMetric label="STUDENTS" value={totalStudents ? String(totalStudents) : '—'} note="section count" />
      </View>

      <View style={styles.subjectSearch}>
        <Ionicons name="search-outline" size={17} color="#7E8DA4" />
        <TextInput value={query} onChangeText={setQuery} placeholder="Filter by subject code, title, or room…" placeholderTextColor="#8A98AC" style={styles.subjectSearchInput} autoCapitalize="none" autoCorrect={false} returnKeyType="search" />
        {query ? <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear subject search"><Ionicons name="close-circle" size={17} color="#8A98AC" /></Pressable> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectFilterScroll} contentContainerStyle={styles.subjectFilterRow}>
        {FILTERS.map(item => {
          const selected = item === filter
          const label = item === 'All' ? `All (${filterCounts[item]})`
            : item === 'Lecture' ? `Lecture (${lectureCount})`
              : item === 'Laboratory' ? `Laboratory (${labCount})`
                : item === 'Day Shift' ? `Day Shift (${dayCount})` : `Evening (${filterCounts[item]})`
          return <Pressable key={item} onPress={() => setFilter(item)} style={[styles.subjectFilterChip, selected && styles.subjectFilterChipActive]} accessibilityRole="button" accessibilityState={{ selected }}>
            <Text style={[styles.subjectFilterText, selected && styles.subjectFilterTextActive]}>{label}</Text>
          </Pressable>
        })}
      </ScrollView>

      <View style={styles.subjectCardList}>
        {visibleCards.map(card => <SubjectCourseCard key={card.key} card={card} />)}
        {!visibleCards.length ? <View style={styles.subjectNoResults}><Text style={styles.subjectNoResultsTitle}>{cards.length ? 'No matching subjects' : 'No subjects assigned yet'}</Text><Text style={styles.subjectNoResultsCopy}>{cards.length ? 'Try another filter or search term.' : 'Your assigned courses will appear here.'}</Text></View> : null}
      </View>
    </View>
  )
}

function SubjectCourseCard({ card }: { card: SubjectCard }) {
  const kind = courseKind(card.course)
  const isEvening = card.meetings.some(item => item.shift === 'evening')
  const shiftLabel = isEvening ? 'Evening' : 'Day'
  const meetingDays = [...new Set(card.meetings.map(item => item.day.slice(0, 3)))].join(' & ')
  const rooms = [...new Set(card.meetings.map(item => item.room).filter((room): room is string => Boolean(room)))].join(', ')
  const students = card.course.student_count
  return <View style={styles.subjectCourseCard}>
    <View style={styles.subjectBadgesRow}>
      <Text style={styles.subjectCodeBadge}>{card.course.course_code || 'COURSE'}</Text>
      <Text style={styles.subjectTypeBadge}>{kind} · {formatNumber(card.course.units || 0)} Units</Text>
      {card.course.section ? <Text style={styles.subjectSectionBadge}>{card.course.section}</Text> : null}
      <Text style={styles.subjectShiftBadge}>{shiftLabel}</Text>
    </View>
    <Text style={styles.subjectCardTitle}>{card.course.course_name || 'Course title unavailable'}</Text>
    <Text style={styles.subjectCardMeta}>{kind === 'Laboratory' ? 'Laboratory course' : 'Scheduled course'} · {meetingDays || 'Schedule not set'}</Text>
    <View style={styles.subjectMeetingBox}>
      <Ionicons name="calendar-outline" size={15} color="#2563EB" />
      <View style={styles.subjectMeetingText}>
        <Text style={styles.subjectMeetingTime}>{meetingLabel(card.meetings) || 'Time not set'}</Text>
        <Text style={styles.subjectMeetingRoom}>Room {rooms || 'not assigned'}</Text>
      </View>
    </View>
    <View style={styles.subjectCardFooter}>
      <Text style={styles.subjectStudentCount}>◉  {students == null ? 'Section count unavailable' : `${students} students in section`}</Text>
      <Text style={styles.subjectCardStatus}>{card.meetings.length} {card.meetings.length === 1 ? 'meeting' : 'meetings'}</Text>
    </View>
  </View>
}

function OverviewMetric({ label, value, note }: { label: string; value: string; note?: string }) {
  return <View style={styles.subjectOverviewCard}>
    <Text style={styles.subjectOverviewLabel}>{label}</Text>
    <Text style={styles.subjectOverviewValue}>{value}</Text>
    {note ? <Text style={styles.subjectOverviewNote}>{note}</Text> : null}
  </View>
}

function sumHours(cards: SubjectCard[], type: 'lecture' | 'lab') {
  const uniqueCourses = new Map<string, FacultySchedule>()
  cards.forEach(card => uniqueCourses.set(card.course.course_code || card.course.course_name || card.key, card.course))
  const hours = [...uniqueCourses.values()].reduce((sum, item) => sum + asNumber(type === 'lecture' ? item.lecture_hours : item.lab_hours), 0)
  return formatNumber(hours)
}

function asNumber(value: number | string | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatNumber(value: number | string | null | undefined) {
  const parsed = asNumber(value)
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(1)
}
