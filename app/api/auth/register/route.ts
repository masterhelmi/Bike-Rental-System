import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log('Registration request body:', body)

    const { full_name, email, phone, password } = body

    // Validate required fields
    if (!email || !password || !full_name) {
      console.error('Missing required fields:', { email: !!email, password: !!password, full_name: !!full_name })
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email)
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      console.error('Password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    console.log('Attempting Supabase signup...')
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          full_name,
          phone: phone || null
        }
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Registration failed' },
        { status: 400 }
      )
    }

    console.log('Registration successful:', authData.user?.id)

    // Auto-confirm email and create profile using admin client
    if (authData.user) {
      try {
        const adminClient = createAdminClient()
        
        // Auto-confirm email
        await adminClient.auth.admin.updateUserById(authData.user.id, {
          email_confirm: true
        })
        console.log('Email auto-confirmed')

        // Create profile
        const { error: profileError } = await adminClient
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: full_name,
            phone: phone || null,
            role: 'user'
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        } else {
          console.log('Profile created successfully')
        }
      } catch (profileError) {
        console.error('Profile creation exception:', profileError)
      }
    }

    return NextResponse.json({ 
      success: true,
      user: authData.user,
      message: 'Registration successful'
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}