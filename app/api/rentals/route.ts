import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('rentals')
      .select(`
        *,
        bike:bikes(*, bike_type:bike_types(*)),
        user:profiles(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching rentals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rentals' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const body = await request.json()

    const { bike_type_id, duration } = body

    // Get current user from session
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!bike_type_id) {
      return NextResponse.json(
        { error: 'bike_type_id is required' },
        { status: 400 }
      )
    }

    if (!duration || duration < 1 || duration > 3) {
      return NextResponse.json(
        { error: 'Duration must be between 1-3 hours' },
        { status: 400 }
      )
    }

    // Get bike type details
    const { data: bikeType } = await supabase
      .from('bike_types')
      .select('*')
      .eq('id', bike_type_id)
      .single()

    if (!bikeType) {
      return NextResponse.json(
        { error: 'Bike type not found' },
        { status: 404 }
      )
    }

    const hourlyRate = bikeType.hourly_rate

    // Calculate end time based on duration
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000)

    // Create rental with pending payment status using admin client to bypass RLS
    const { data, error } = await adminClient
      .from('rentals')
      .insert({
        user_id: user.id,
        bike_type_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        total_amount: hourlyRate * duration,
        payment_status: 'pending',
        status: 'pending_payment'
      })
      .select(`
        *,
        bike_type:bike_types(*)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create rental' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating rental:', error)
    return NextResponse.json(
      { error: 'Failed to create rental' },
      { status: 500 }
    )
  }
}