import { Pressable, ScrollView, Text, View } from 'react-native'
import type { FacultyDashboard, FacultySchedule } from '../lib/api'
import { styles } from '../styles/facultyStyles'

/** Opens the summary of courses and teaching-load figures from the faculty PBT. */
export function ScheduleSummarySheet({ dashboard, onClose }: { dashboard: FacultyDashboard; onClose: () => void }) {
  const courses = getCourseRows(dashboard.schedules)
  const shifts = dashboard.load.shift_breakdown
  const day = shifts?.day
  const evening = shifts?.evening
  const totalPreparations = shifts?.total_preparations ?? null
  const totalUnits = day && evening
    ? formatNumber(Number(day.units) + Number(evening.units))
    : String(dashboard.load.units ?? sumUnits(courses))
  const totalHours = day && evening ? day.hours_per_week + evening.hours_per_week : dashboard.load.hours_per_week ?? dashboard.load.hours
  return (
    <View style={styles.modalShade}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.courseSummarySheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.settingsTitleRow}><Text style={styles.panelTitle}>Summary of Courses</Text><Pressable onPress={onClose}><Text style={styles.closeSettings}>Close</Text></Pressable></View>
        <Text style={styles.panelSubtitle}>{dashboard.semester?.name || 'Current semester'} · {dashboard.semester?.academic_year || ''}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summaryTableHeader}><Text style={[styles.summaryColumnTitle, { flex: 0.8 }]}>CODE</Text><Text style={[styles.summaryColumnTitle, { flex: 1.7 }]}>COURSE TITLE</Text><Text style={[styles.summaryColumnTitle, { flex: 1 }]}>YR/SEC</Text><Text style={[styles.summaryColumnTitle, { flex: 0.65, textAlign: 'right' }]}>STUDENTS</Text></View>
          {courses.length ? courses.map((course, index) => <View key={`${course.course_code}-${course.section}-${index}`} style={styles.summaryCourseRow}>
            <Text style={[styles.summaryCourseCode, { flex: 0.8 }]}>{course.course_code || '—'}</Text>
            <View style={{ flex: 1.7 }}><Text style={styles.summaryCourseName}>{course.course_name || '—'}</Text><Text style={styles.summaryCourseUnits}>{course.units ?? '—'} units</Text></View>
            <Text style={[styles.summaryCourseSection, { flex: 1 }]}>{course.section || '—'}</Text>
            <Text style={[styles.summaryCourseSection, { flex: 0.65, textAlign: 'right' }]}>{course.student_count ?? '—'}</Text>
          </View>) : <Text style={styles.summaryEmpty}>No courses assigned this semester.</Text>}
          <View style={styles.summaryLoadBox}>
            <SummaryHeading title="No. of Preparations" />
            <SummaryLine label="Total (excluding REC)" value={totalPreparations === null ? '—' : String(totalPreparations)} />
            <SummaryLine label="Evening" value={evening ? String(evening.preparations) : '—'} />
            <SummaryLine label="Day" value={day ? String(day.preparations) : '—'} />
            <View style={styles.summaryLoadDivider} />
            <SummaryHeading title="No. of Units" />
            <SummaryLine label="Day" value={day ? formatNumber(day.units) : '—'} />
            <SummaryLine label="Evening" value={evening ? formatNumber(evening.units) : '—'} />
            <SummaryLine label="Total" value={totalUnits} />
            <View style={styles.summaryLoadDivider} />
            <SummaryHeading title="No. of Hours / Week" />
            <SummaryLine label="Day" value={day ? `${formatNumber(day.hours_per_week)}h` : '—'} />
            <SummaryLine label="Evening" value={evening ? `${formatNumber(evening.hours_per_week)}h` : '—'} />
            <SummaryLine label="Total" value={`${formatNumber(totalHours)}h`} />
            <View style={styles.summaryLoadDivider} />
            <SummaryHeading title="Teaching Load Limit" />
            <SummaryLine label="Day" value={day ? `${formatNumber(day.max_hours)}h` : '—'} />
            <SummaryLine label="Evening" value={evening ? `${formatNumber(evening.max_hours)}h` : '—'} />
            <View style={styles.summaryLoadDivider} />
            <SummaryLine label="Administrative Designation" value={dashboard.load.designation || '—'} />
            <SummaryLine label="Production" value={dashboard.load.production || '—'} />
            <SummaryLine label="Extension" value={dashboard.load.extension || '—'} />
            <SummaryLine label="Research" value={dashboard.load.research || '—'} />
          </View>
        </ScrollView>
        <Pressable style={styles.summaryClose} onPress={onClose}><Text style={styles.summaryCloseText}>Done</Text></Pressable>
      </View>
    </View>
  )
}

function getCourseRows(schedules: FacultySchedule[]) {
  const rows = new Map<string, FacultySchedule>()
  schedules.forEach(item => rows.set(`${item.course_code || ''}|${item.section || ''}`, item))
  return [...rows.values()]
}

function sumUnits(courses: FacultySchedule[]) {
  const total = courses.reduce((sum, course) => sum + (Number(course.units) || 0), 0)
  return total || '—'
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryLine}><Text style={styles.summaryLineLabel}>{label}</Text><Text style={styles.summaryLineValue}>{value}</Text></View>
}

function SummaryHeading({ title }: { title: string }) {
  return <Text style={styles.summaryGroupHeading}>{title}</Text>
}

function formatNumber(value: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '0'
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(1)
}
