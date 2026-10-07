import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for:', email)

    // Login user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: 401 }
      )
    }

    console.log('Login successful for:', email)

    return NextResponse.json({ 
      success: true,
      user: data.user,
      session: data.session,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}