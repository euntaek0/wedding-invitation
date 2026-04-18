import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeRsvpPayload, parseRsvpPayload } from '../lib/rsvp'

test('normalizes not attending RSVP payload', () => {
  const parsed = parseRsvpPayload({
    name: '홍길동',
    phone: '010-1234-5678',
    side: 'groom',
    attendance: 'notAttending',
    attendeeCount: 3,
    meal: 'yes',
    message: '  아쉽지만 참석이 어렵습니다.  ',
  })

  assert.equal(parsed.ok, true)

  if (!parsed.ok) {
    return
  }

  assert.deepEqual(parsed.data, {
    name: '홍길동',
    phone: '010-1234-5678',
    side: 'groom',
    attendance: 'notAttending',
    attendeeCount: 0,
    meal: 'no',
    message: '아쉽지만 참석이 어렵습니다.',
  })
})

test('rejects invalid phone format', () => {
  const parsed = parseRsvpPayload({
    name: '홍길동',
    phone: 'invalid-phone',
    side: 'groom',
    attendance: 'attending',
    attendeeCount: 1,
    meal: 'yes',
  })

  assert.equal(parsed.ok, false)

  if (parsed.ok) {
    return
  }

  assert.equal(parsed.fieldErrors.phone, 'Invalid phone format')
})

test('requires attendee count when attending', () => {
  const parsed = parseRsvpPayload({
    name: '홍길동',
    phone: '01012345678',
    side: 'bride',
    attendance: 'attending',
    attendeeCount: 0,
    meal: 'yes',
  })

  assert.equal(parsed.ok, false)

  if (parsed.ok) {
    return
  }

  assert.equal(parsed.fieldErrors.attendeeCount, 'Attendee count must be at least 1 when attending')
})

test('normalizeRsvpPayload keeps attending meal choice', () => {
  const normalized = normalizeRsvpPayload({
    name: 'Jane',
    phone: '010-9999-0000',
    side: 'bride',
    attendance: 'attending',
    attendeeCount: 2,
    meal: 'no',
    message: '  See you there  ',
  })

  assert.equal(normalized.attendeeCount, 2)
  assert.equal(normalized.meal, 'no')
  assert.equal(normalized.message, 'See you there')
})
