import { Text, View } from 'react-native'
import type { FacultySchedule } from '../lib/api'
import { styles } from '../styles/facultyStyles'
import { formatTime } from '../utils/formatters'

export function ClassCard({ item, index, showDay = false }: { item: FacultySchedule; index: number; showDay?: boolean }) {
  return (
    <View style={styles.classCard}>
      <View style={[styles.classAccent, index % 2 ? styles.classAccentTeal : null]} />
      <View style={styles.classMain}>
        <View style={styles.classTopRow}>
          <Text style={styles.classCode}>{item.course_code || 'CLASS'}</Text>
          {showDay ? <Text style={styles.classDay}>{item.day}</Text> : null}
        </View>
        <Text style={styles.className} numberOfLines={2}>{item.course_name || 'Course details'}</Text>
        <View style={styles.classMetaRow}>
          <Text style={styles.classMeta}>{item.section || 'Section —'}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.classMeta}>{item.room || 'Room —'}</Text>
        </View>
      </View>
      <View style={styles.classTime}>
        <Text style={styles.classStart}>{formatTime(item.start_time)}</Text>
        <Text style={styles.classEnd}>{formatTime(item.end_time)}</Text>
      </View>
    </View>
  )
}
