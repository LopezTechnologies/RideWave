import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const password = form.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin?error=1', request.url))
  }

  const res = NextResponse.redirect(new URL('/admin', request.url))
  res.cookies.set('admin_auth', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })
  return res
}
