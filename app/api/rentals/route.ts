import { createClient } from '@/lib/supabase/server'
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
    const body = await request.json()

    const { user_id, bike_id, bike_type_id } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Get bike details if bike_id is provided
    let hourlyRate = 5000 // default rate
    if (bike_id) {
      const { data: bike } = await supabase
        .from('bikes')
        .select('*, bike_type:bike_types(*)')
        .eq('id', bike_id)
        .single()

      if (bike && bike.bike_type) {
        hourlyRate = bike.bike_type.hourly_rate
      }
    } else if (bike_type_id) {
      const { data: bikeType } = await supabase
        .from('bike_types')
        .select('*')
        .eq('id', bike_type_id)
        .single()

      if (bikeType) {
        hourlyRate = bikeType.hourly_rate
      }
    }

    // Calculate end time (1 hour from now)
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour

    // Create rental
    const { data, error } = await supabase
      .from('rentals')
      .insert({
        user_id,
        bike_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        total_amount: hourlyRate,
        payment_status: 'pending',
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating rental:', error)
    return NextResponse.json(
      { error: 'Failed to create rental' },
      { status: 500 }
    )
  }
}