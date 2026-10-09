import { Text, View } from 'react-native'
import type { FacultyDashboard, FacultySchedule } from '../lib/api'
import { styles } from '../styles/facultyStyles'

function getUniqueSubjects(schedules: FacultySchedule[]) {
  const seen = new Set<string>()
  return schedules.filter(item => {
    const key = `${item.course_code || ''}-${item.course_name || ''}-${item.section || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Subjects assigned to the signed-in faculty member for the current semester. */
export function FacultyMobileSubject({ dashboard }: { dashboard: FacultyDashboard }) {
  const subjects = getUniqueSubjects(dashboard.schedules)
  return (
    <View style={styles.subjectsPanel}>
      <Text style={styles.panelTitle}>My Subjects</Text>
      <Text style={styles.panelSubtitle}>{subjects.length} subjects this semester</Text>
      <View style={styles.subjectTableHead}>
        <Text style={[styles.subjectHeadText, { flex: 0.8 }]}>CODE</Text>
        <Text style={[styles.subjectHeadText, { flex: 2.2 }]}>SUBJECT NAME</Text>
        <Text style={[styles.subjectHeadText, { flex: 1 }]}>SECTION</Text>
      </View>
      {subjects.map((item, index) => <View style={styles.subjectRow} key={`${item.id}-${index}`}>
        <Text style={[styles.subjectCode, { flex: 0.8 }]}>{item.course_code || '—'}</Text>
        <View style={{ flex: 2.2 }}><Text style={styles.subjectName}>{item.course_name || 'Course'}</Text><Text style={styles.subjectRoom}>{item.room || 'Room not set'}</Text></View>
        <Text style={[styles.subjectSection, { flex: 1 }]}>{item.section || '—'}</Text>
      </View>)}
      {!subjects.length ? <View style={styles.dayEmpty}><Text style={styles.emptyTitle}>No subjects available</Text></View> : null}
    </View>
  )
}
