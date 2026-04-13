import { NextResponse, type NextRequest } from 'next/server'

// Auth desactivada temporalmente — acceso directo sin login
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request })
}
