import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const email = data.user.email?.toLowerCase()

      if (!email || !ALLOWED_EMAILS.includes(email)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=unauthorized`)
      }

      // Check if user has a workspace, create one if not
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', data.user.id)
        .limit(1)

      if (!memberships || memberships.length === 0) {
        const serviceClient = await createServiceClient()

        // Check if any workspace exists (the other user might have created one)
        const { data: existingWorkspaces } = await serviceClient
          .from('workspaces')
          .select('id')
          .limit(1)

        if (existingWorkspaces && existingWorkspaces.length > 0) {
          // Add user to existing workspace
          await serviceClient
            .from('workspace_members')
            .insert({
              workspace_id: existingWorkspaces[0].id,
              user_id: data.user.id,
              role: 'member',
            })
        } else {
          // Create new workspace
          await serviceClient.rpc('create_workspace_for_user', {
            p_name: 'Aurea Systems',
            p_user_id: data.user.id,
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
