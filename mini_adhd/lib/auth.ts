import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET as string | undefined
const COOKIE_NAME = 'focusflow_token'

export function signJwt(payload: object, expiresIn: string = '7d') {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set. Add it to .env.local and restart the dev server.')
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any)
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    if (!JWT_SECRET) return null
    return jwt.verify(token, JWT_SECRET) as T
  } catch {
    return null
  }
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, '', { httpOnly: true, expires: new Date(0), path: '/' })
}

export function getUserFromCookie<T = any>(): T | null {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyJwt<T>(token)
}

