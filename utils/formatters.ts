import type { FacultyProfile } from '../lib/api'

/** Formats a database time such as 07:30:00 as a short local 12-hour time. */
export function formatTime(value: string) {
  const [hourText = '0', minute = '00'] = value.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${minute} ${suffix}`
}

/** Match the web faculty display name by adding the highest saved degree acronym. */
export function formatFacultyName(faculty: FacultyProfile) {
  const hasDoctorate = Boolean(faculty.doctorate_degree?.trim() || faculty.doctorate_abbr?.trim())
  const hasMasters = Boolean(faculty.masters_degree?.trim() || faculty.masters_abbr?.trim())
  const postNominal = hasDoctorate
    ? faculty.doctorate_abbr?.trim()
    : hasMasters ? faculty.masters_abbr?.trim() : ''

  return postNominal ? `${faculty.name} (${postNominal})` : faculty.name
}

/** Creates initials for the profile avatar. */
export function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'F'
}
