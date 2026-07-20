import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isLoginPage = pathname === '/admin/login'

  // Authenticated user hitting the login page → send to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Unauthenticated user hitting a protected admin route → send to login
  if (!token && !isLoginPage) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
