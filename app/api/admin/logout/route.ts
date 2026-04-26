import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin', request.url))
  res.cookies.delete('admin_auth')
  return res
}
