export type FamilySide = 'groom' | 'bride'
export type AttendanceStatus = 'attending' | 'notAttending'
export type MealAttendance = 'yes' | 'no'

export interface RSVPPayload {
  name: string
  phone: string
  side: FamilySide
  attendance: AttendanceStatus
  attendeeCount: number
  meal: MealAttendance
  message?: string
}

export interface RSVPApiResponse {
  ok: boolean
  message: string
}
