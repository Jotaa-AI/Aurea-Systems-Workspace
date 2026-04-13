'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { validateEmail } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { allowed } = await validateEmail(email)
    if (!allowed) {
      setError('Este email no tiene acceso al workspace.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Aurea Systems
          </h1>
          <p className="text-sm text-muted-foreground">
            Workspace
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <div className="space-y-1 text-center">
              <p className="font-medium">Revisa tu email</p>
              <p className="text-sm text-muted-foreground">
                Hemos enviado un magic link a <strong>{email}</strong>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSent(false); setEmail('') }}
            >
              Usar otro email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar magic link'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
