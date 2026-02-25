import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('focusflow_token')?.value
  const role = request.cookies.get('focusflow_role')?.value
  const isAuth = Boolean(token)
  const { pathname } = request.nextUrl

  const authPaths = ['/login', '/signup', '/educator-login', '/admin-login']
  const isAuthRoute = authPaths.some(p => pathname.startsWith(p) || pathname.startsWith(`/(${p.replace('/','')})/${p.split('/').pop()}`))
  const isDashboard = pathname.startsWith('/dashboard')

  // Redirect to login if not authenticated and trying to access dashboard
  if (!isAuth && isDashboard) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to appropriate dashboard if already authenticated and trying to access auth pages
  if (isAuth && isAuthRoute) {
    const url = request.nextUrl.clone()
    if (role === 'Admin') {
      url.pathname = '/dashboard/admin'
    } else if (role === 'Educator') {
      url.pathname = '/dashboard/educator'
    } else {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  // Role-based protection for specific dashboard paths
  if (isAuth && role) { // Only enforce if role cookie exists
    if (pathname.startsWith('/dashboard/admin') && role !== 'Admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/dashboard/educator') && role !== 'Educator' && role !== 'Admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/educator-login', '/admin-login', '/(auth)/login', '/(auth)/signup']
}

