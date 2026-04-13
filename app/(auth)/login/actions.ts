'use server'

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

export async function validateEmail(email: string): Promise<{ allowed: boolean }> {
  return { allowed: ALLOWED_EMAILS.includes(email.toLowerCase().trim()) }
}
