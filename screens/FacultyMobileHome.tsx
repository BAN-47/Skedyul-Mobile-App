import { useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import type { FacultyDashboard } from '../lib/api'
import { ErrorBanner } from '../components/ErrorBanner'
import { FacultyHeader } from '../components/FacultyHeader'
import { ProfileMenu } from '../components/ProfileMenu'
import { ScheduleSummarySheet } from '../components/ScheduleSummarySheet'
import { FacultyMobileNotifications } from './FacultyMobileNotifications'
import { FacultyMobileSchedule } from './FacultyMobileSchedule'
import { FacultyMobileSettings } from './FacultyMobileSettings'
import { FacultyMobileSubject } from './FacultyMobileSubject'
import { COLORS, styles } from '../styles/facultyStyles'

type FacultyTab = 'schedule' | 'subjects' | 'notifications'

/** Shared faculty layout: header, the selected faculty screen, and bottom navigation. */
export function FacultyMobileHome({ dashboard, busy, refreshing, error, onRefresh, onSignOut, onSaveProfile, onChangePassword, onSaveSecurity, onSaveNotifications, onUploadFacultyPhoto, onRemoveFacultyPhoto }: {
  dashboard: FacultyDashboard
  busy: boolean
  refreshing: boolean
  error: string
  onRefresh: () => Promise<void>
  onSignOut: () => Promise<void>
  onSaveProfile: (personal: Record<string, unknown>, contact: Record<string, unknown>) => Promise<void>
  onChangePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) => Promise<void>
  onSaveSecurity: (data: { usr_session_timeout_minutes: number; usr_max_login_attempts: number }) => Promise<void>
  onSaveNotifications: (data: Record<string, boolean>) => Promise<void>
  onUploadFacultyPhoto: (uri: string, fileName: string, mimeType: string) => Promise<void>
  onRemoveFacultyPhoto: () => Promise<void>
}) {
  const [tab, setTab] = useState<FacultyTab>('schedule')
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.homeRoot}>
        <FacultyHeader dashboard={dashboard} onOpenProfile={() => setProfileOpen(true)} />
        {error ? <View style={styles.homeError}><ErrorBanner message={error} /></View> : null}
        <ScrollView key={tab} style={styles.homeScroll} contentContainerStyle={styles.homeScrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={COLORS.blue} />}>
          {tab === 'schedule' ? <FacultyMobileSchedule dashboard={dashboard} onShowSummary={() => setSummaryOpen(true)} /> : null}
          {tab === 'subjects' ? <FacultyMobileSubject dashboard={dashboard} /> : null}
          {tab === 'notifications' ? <FacultyMobileNotifications dashboard={dashboard} /> : null}
        </ScrollView>
        <BottomNavigation activeTab={tab} onChangeTab={setTab} />
        {profileOpen ? <ProfileMenu dashboard={dashboard} busy={busy} onClose={() => setProfileOpen(false)} onSettings={() => { setProfileOpen(false); setSettingsOpen(true) }} onSignOut={() => void onSignOut()} /> : null}
        {summaryOpen ? <ScheduleSummarySheet dashboard={dashboard} onClose={() => setSummaryOpen(false)} /> : null}
        {settingsOpen ? <FacultyMobileSettings dashboard={dashboard} onClose={() => setSettingsOpen(false)} onSaveProfile={onSaveProfile} onChangePassword={onChangePassword} onSaveSecurity={onSaveSecurity} onSaveNotifications={onSaveNotifications} onUploadFacultyPhoto={onUploadFacultyPhoto} onRemoveFacultyPhoto={onRemoveFacultyPhoto} /> : null}
      </View>
    </SafeAreaView>
  )
}

function BottomNavigation({ activeTab, onChangeTab }: { activeTab: FacultyTab; onChangeTab: (tab: FacultyTab) => void }) {
  const items: { key: FacultyTab; icon: string; title: string }[] = [
    { key: 'schedule', icon: '▦', title: 'My Schedule' },
    { key: 'subjects', icon: '▤', title: 'My Subjects' },
    { key: 'notifications', icon: '◉', title: 'Notifications' },
  ]
  return (
    <View style={styles.bottomNav}>
      {items.map(item => <Pressable key={item.key} onPress={() => onChangeTab(item.key)} style={styles.navItem}>
        <Text style={[styles.navIcon, activeTab === item.key && styles.navActive]}>{item.icon}</Text>
        <Text style={[styles.navLabel, activeTab === item.key && styles.navActive]}>{item.title}</Text>
        {activeTab === item.key ? <View style={styles.navIndicator} /> : null}
      </Pressable>)}
    </View>
  )
}
