
export const UserRole = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
  REVIEWER: 'REVIEWER',
  VENDOR: 'VENDOR',
  AUTHOR: 'AUTHOR'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const PaperStatus = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED'
} as const;

export type PaperStatus = typeof PaperStatus[keyof typeof PaperStatus];

export const ConferenceStatus = {
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED'
} as const;

export type ConferenceStatus = typeof ConferenceStatus[keyof typeof ConferenceStatus];
