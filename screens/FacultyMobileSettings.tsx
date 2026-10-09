import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { facultyImageUrl, type FacultyDashboard } from '../lib/api'
import { getInitials } from '../utils/formatters'
import { COLORS, styles } from '../styles/facultyStyles'

type SettingsTab = 'personal' | 'security' | 'notifications'
type PersonalInfo = Record<string, unknown>
type ContactInfo = Record<string, unknown>

/** Editable faculty settings form. Saves are sent to the Laravel mobile API. */
export function FacultyMobileSettings({ dashboard, onClose, onSaveProfile, onChangePassword, onSaveSecurity, onSaveNotifications, onUploadFacultyPhoto, onRemoveFacultyPhoto }: {
  dashboard: FacultyDashboard
  onClose: () => void
  onSaveProfile: (personal: PersonalInfo, contact: ContactInfo) => Promise<void>
  onChangePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) => Promise<void>
  onSaveSecurity: (data: { usr_session_timeout_minutes: number; usr_max_login_attempts: number }) => Promise<void>
  onSaveNotifications: (data: Record<string, boolean>) => Promise<void>
  onUploadFacultyPhoto: (uri: string, fileName: string, mimeType: string) => Promise<void>
  onRemoveFacultyPhoto: () => Promise<void>
}) {
  const profile = dashboard.faculty
  const [tab, setTab] = useState<SettingsTab>('personal')
  const [saving, setSaving] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [firstName, setFirstName] = useState(profile.first_name || '')
  const [lastName, setLastName] = useState(profile.last_name || '')
  const [middleName, setMiddleName] = useState(profile.middle_name || '')
  const [suffix, setSuffix] = useState(profile.suffix || '')
  const [employeeId, setEmployeeId] = useState(profile.employee_id || '')
  const [gender, setGender] = useState(profile.gender || '')
  const [civilStatus, setCivilStatus] = useState(profile.civil_status || '')
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth || '')
  const [nationality, setNationality] = useState(profile.nationality || '')
  const [email, setEmail] = useState(profile.email || '')
  const [phone, setPhone] = useState(profile.phone_number || '')
  const [office, setOffice] = useState(profile.address || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [timeout, setTimeoutValue] = useState(String(dashboard.settings?.session_timeout_minutes ?? 30))
  const [maxAttempts, setMaxAttempts] = useState(String(dashboard.settings?.max_login_attempts ?? 5))
  const [notifications, setNotifications] = useState({
    schedule_updates: dashboard.settings?.notifications.schedule_updates ?? true,
    new_assignments: dashboard.settings?.notifications.new_assignments ?? true,
    reminders: dashboard.settings?.notifications.reminders ?? true,
    system_announcements: dashboard.settings?.notifications.system_announcements ?? false,
  })

  useEffect(() => {
    setFirstName(profile.first_name || '')
    setLastName(profile.last_name || '')
    setMiddleName(profile.middle_name || '')
    setSuffix(profile.suffix || '')
    setEmployeeId(profile.employee_id || '')
    setGender(profile.gender || '')
    setCivilStatus(profile.civil_status || '')
    setDateOfBirth(profile.date_of_birth || '')
    setNationality(profile.nationality || '')
    setEmail(profile.email || '')
    setPhone(profile.phone_number || '')
    setOffice(profile.address || '')
    setBio(profile.bio || '')
  }, [profile])

  async function choosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85,
      })
      if (result.canceled || !result.assets[0]) return
      const asset = result.assets[0]
      const mimeType = asset.mimeType || 'image/jpeg'
      const fileName = asset.fileName || `faculty-profile.${mimeType.split('/')[1] || 'jpg'}`
      setPhotoBusy(true)
      setMessage('')
      await onUploadFacultyPhoto(asset.uri, fileName, mimeType)
      setMessage('Your profile photo was updated.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to upload your profile photo.')
    } finally {
      setPhotoBusy(false)
    }
  }

  async function removePhoto() {
    setPhotoBusy(true)
    setMessage('')
    try {
      await onRemoveFacultyPhoto()
      setMessage('Your profile photo was removed.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove your profile photo.')
    } finally {
      setPhotoBusy(false)
    }
  }

  async function save(action: () => Promise<void>, success: string) {
    setSaving(true)
    setMessage('')
    try {
      await action()
      setMessage(success)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function saveProfile() {
    const personal = {
      fac_first_name: firstName.trim(), fac_last_name: lastName.trim(), fac_middle_name: middleName.trim(),
      fac_suffix: suffix.trim(), fac_employee_id: employeeId.trim(), fac_gender: gender || null,
      fac_civil_status: civilStatus || null, fac_dob: dateOfBirth || null, fac_nationality: nationality.trim(),
    }
    const contact = { usr_email: email.trim(), fac_phone_number: phone.trim(), fac_address: office.trim(), fac_bio: bio.trim() }
    return save(() => onSaveProfile(personal, contact), 'Your profile details were saved.')
  }

  function savePassword() {
    if (newPassword.length < 8) { setMessage('Use at least 8 characters for your new password.'); return }
    if (newPassword !== confirmPassword) { setMessage('The new passwords do not match.'); return }
    return save(async () => {
      await onChangePassword({ current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmPassword })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }, 'Your password was updated.')
  }

  return (
    <View style={styles.settingsOverlay}>
      <View style={styles.settingsHeader}>
        <Pressable onPress={onClose} style={styles.settingsBack}><Text style={styles.settingsBackText}>‹</Text></Pressable>
        <Text style={styles.settingsHeaderTitle}>Settings</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.settingsTabs} contentContainerStyle={styles.settingsTabsContent}>
        <SettingsTabButton title="Personal Info" active={tab === 'personal'} onPress={() => { setTab('personal'); setMessage('') }} />
        <SettingsTabButton title="Security" active={tab === 'security'} onPress={() => { setTab('security'); setMessage('') }} />
        <SettingsTabButton title="Notifications" active={tab === 'notifications'} onPress={() => { setTab('notifications'); setMessage('') }} />
      </ScrollView>
      <ScrollView style={styles.settingsScroll} contentContainerStyle={styles.settingsContent} keyboardShouldPersistTaps="handled">
        {tab === 'personal' ? <>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>Profile Picture</Text>
            <Text style={styles.settingsCardSubtitle}>Faculty profile</Text>
            <View style={styles.settingsAvatarRow}>
              <View style={styles.settingsAvatar}>{facultyImageUrl(profile.profile_image) ? <Image source={{ uri: facultyImageUrl(profile.profile_image)! }} style={styles.settingsAvatarImage} /> : <Text style={styles.settingsAvatarText}>{getInitials(profile.name)}</Text>}</View>
              <View style={styles.settingsPhotoActions}>
                <Pressable disabled={photoBusy} onPress={() => void choosePhoto()} style={[styles.settingsPhotoButton, photoBusy && styles.disabledButton]}><Text style={styles.settingsPhotoButtonText}>{photoBusy ? 'Uploading…' : 'Upload Photo'}</Text></Pressable>
                {profile.profile_image ? <Pressable disabled={photoBusy} onPress={() => void removePhoto()} style={styles.settingsPhotoRemove}><Text style={styles.settingsPhotoRemoveText}>Remove</Text></Pressable> : null}
              </View>
            </View>
          </View>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>Personal Information</Text>
            <Text style={styles.settingsCardSubtitle}>Update your name and details</Text>
            <View style={styles.formColumns}><FormField label="First Name" value={firstName} onChangeText={setFirstName} /><FormField label="Last Name" value={lastName} onChangeText={setLastName} /></View>
            <View style={styles.formColumns}><FormField label="Middle Name" value={middleName} onChangeText={setMiddleName} /><FormField label="Suffix" value={suffix} onChangeText={setSuffix} /></View>
            <FormField label="Employee ID" value={employeeId} onChangeText={setEmployeeId} />
            <FormField label="Rank / Title" value={profile.rank || 'Faculty Member'} editable={false} />
            <ChoiceField label="Gender" value={gender} options={['Male', 'Female', 'Prefer not to say']} onChange={setGender} />
            <ChoiceField label="Civil Status" value={civilStatus} options={['Single', 'Married', 'Widowed']} onChange={setCivilStatus} />
            <View style={styles.formColumns}><FormField label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" /><FormField label="Nationality" value={nationality} onChangeText={setNationality} /></View>
          </View>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>Contact & Office</Text>
            <Text style={styles.settingsCardSubtitle}>How others can reach you</Text>
            <FormField label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <FormField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <FormField label="Office Location" value={office} onChangeText={setOffice} />
            <FormField label="Department" value={profile.program || profile.college || 'Not assigned'} editable={false} />
            <FormField label="Bio / About" value={bio} onChangeText={setBio} multiline />
            <SaveButton title="Save Changes" busy={saving} onPress={saveProfile} />
          </View>
        </> : null}

        {tab === 'security' ? <>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>Change Password</Text>
            <Text style={styles.settingsCardSubtitle}>Update your faculty account password</Text>
            <FormField label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry secureVisible={showCurrentPassword} onToggleSecure={() => setShowCurrentPassword(value => !value)} />
            <FormField label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="At least 8 characters" secureTextEntry secureVisible={showNewPassword} onToggleSecure={() => setShowNewPassword(value => !value)} />
            <FormField label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" secureTextEntry secureVisible={showConfirmPassword} onToggleSecure={() => setShowConfirmPassword(value => !value)} />
            <SaveButton title="Update Password" busy={saving} onPress={savePassword} />
          </View>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsCardTitle}>Session Settings</Text>
            <Text style={styles.settingsCardSubtitle}>Manage your login preferences</Text>
            <ChoiceField label="Session Timeout" value={timeout} displayValue={timeout === '999999' ? 'Never' : timeout === '60' ? '1 hour' : `${timeout} minutes`} options={['15', '30', '60', '999999']} displayOptions={['15 minutes', '30 minutes', '1 hour', 'Never']} onChange={setTimeoutValue} />
            <ChoiceField label="Max Login Attempts" value={maxAttempts} options={['3', '5', '10']} onChange={setMaxAttempts} />
            <SaveButton title="Save Changes" busy={saving} onPress={() => save(() => onSaveSecurity({ usr_session_timeout_minutes: Number(timeout), usr_max_login_attempts: Number(maxAttempts) }), 'Security settings were saved.')} />
          </View>
        </> : null}

        {tab === 'notifications' ? <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>Notification Preferences</Text>
          <Text style={styles.settingsCardSubtitle}>Choose what alerts you receive</Text>
          <NotificationToggle title="Schedule Updates" description="When your schedule is modified" value={notifications.schedule_updates} onChange={value => setNotifications(current => ({ ...current, schedule_updates: value }))} />
          <NotificationToggle title="New Assignments" description="When a new subject is assigned to you" value={notifications.new_assignments} onChange={value => setNotifications(current => ({ ...current, new_assignments: value }))} />
          <NotificationToggle title="Reminders" description="Deadlines and important announcements" value={notifications.reminders} onChange={value => setNotifications(current => ({ ...current, reminders: value }))} />
          <NotificationToggle title="System Announcements" description="General system updates" value={notifications.system_announcements} onChange={value => setNotifications(current => ({ ...current, system_announcements: value }))} />
          <SaveButton title="Save Preferences" busy={saving} onPress={() => save(() => onSaveNotifications({
            faculty_notif_schedule_updates: notifications.schedule_updates,
            faculty_notif_new_assignments: notifications.new_assignments,
            faculty_notif_reminders: notifications.reminders,
            faculty_notif_system_announcements: notifications.system_announcements,
          }), 'Notification preferences were saved.')} />
        </View> : null}
        {message ? <Text style={styles.settingsFeedback}>{message}</Text> : null}
      </ScrollView>
    </View>
  )
}

function SettingsTabButton({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.settingsTab, active && styles.settingsTabActive]}><Text style={[styles.settingsTabText, active && styles.settingsTabTextActive]}>{title}</Text></Pressable>
}

function FormField({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, secureVisible, onToggleSecure, multiline, editable = true }: {
  label: string; value: string; onChangeText?: (value: string) => void; placeholder?: string
  keyboardType?: 'default' | 'email-address' | 'phone-pad'; secureTextEntry?: boolean; secureVisible?: boolean; onToggleSecure?: () => void; multiline?: boolean; editable?: boolean
}) {
  return <View style={styles.settingsField}><Text style={styles.settingsFieldLabel}>{label}</Text>
    {secureTextEntry ? <View style={styles.settingsSecureRow}>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#98A6BA" keyboardType={keyboardType || 'default'} secureTextEntry={!secureVisible} editable={editable} autoCapitalize="none" style={styles.settingsSecureInput} />
      <Pressable onPress={onToggleSecure} style={styles.settingsEyeButton} accessibilityRole="button" accessibilityLabel={secureVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}><Text style={styles.settingsEyeText}>{secureVisible ? '◎' : '◉'}</Text></Pressable>
    </View> : <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#98A6BA"
      keyboardType={keyboardType || 'default'} multiline={multiline} editable={editable}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      style={[styles.settingsInput, multiline && styles.settingsMultiline, !editable && styles.settingsReadOnly]}
    />}
  </View>
}

function ChoiceField({ label, value, options, displayValue, displayOptions, onChange }: {
  label: string; value: string; options: string[]; displayValue?: string; displayOptions?: string[]; onChange: (value: string) => void
}) {
  return <View style={styles.settingsField}><Text style={styles.settingsFieldLabel}>{label}</Text><View style={styles.choiceRow}>{options.map((option, index) => {
    const selected = option === value
    return <Pressable key={option} onPress={() => onChange(option)} style={[styles.choiceChip, selected && styles.choiceChipActive]}><Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>{displayOptions?.[index] || option}</Text></Pressable>
  })}</View>{displayValue ? <Text style={styles.currentChoice}>Selected: {displayValue}</Text> : null}</View>
}

function NotificationToggle({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.notificationSetting}><View style={{ flex: 1, paddingRight: 10 }}><Text style={styles.notificationSettingTitle}>{title}</Text><Text style={styles.notificationSettingDescription}>{description}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: '#CBD5E1', true: COLORS.blue }} thumbColor={COLORS.white} /></View>
}

function SaveButton({ title, busy, onPress }: { title: string; busy: boolean; onPress: () => void }) {
  return <Pressable disabled={busy} onPress={onPress} style={[styles.settingsSaveButton, busy && styles.disabledButton]}><Text style={styles.settingsSaveText}>{busy ? 'Saving…' : title}</Text></Pressable>
}
