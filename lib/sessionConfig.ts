import { SessionOptions } from 'iron-session';

export interface SessionData {
  token?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env['SESSION_SECRET'] || process.env['NEXTAUTH_SECRET'] || 'snappyfresh-session-secret-must-be-at-least-32-chars-long!!',
  cookieName: '__sf_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
