import { Pressable, ScrollView, Text, View } from 'react-native'
import type { FacultyDashboard, FacultySchedule } from '../lib/api'
import { styles } from '../styles/facultyStyles'

/** Opens the summary of courses and teaching-load figures from the faculty PBT. */
export function ScheduleSummarySheet({ dashboard, onClose }: { dashboard: FacultyDashboard; onClose: () => void }) {
  const courses = getCourseRows(dashboard.schedules)
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
            <SummaryLine label="No. of Preparations" value={String(dashboard.load.preparations ?? dashboard.subject_count)} />
            <SummaryLine label="No. of Units" value={String(dashboard.load.units ?? sumUnits(courses))} />
            <SummaryLine label="No. of Hours / Week" value={`${dashboard.load.hours_per_week ?? dashboard.load.hours}h`} />
            <SummaryLine label="Teaching Load Limit" value={`${dashboard.load.max_hours}h`} />
            <SummaryLine label="Administrative Designation" value={dashboard.load.designation || '—'} />
            <View style={styles.summaryLoadDivider} />
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
  const total = courses.reduce((sum, course) => sum + (course.units || 0), 0)
  return total || '—'
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryLine}><Text style={styles.summaryLineLabel}>{label}</Text><Text style={styles.summaryLineValue}>{value}</Text></View>
}
