import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')
    const bikeId = searchParams.get('bike_id')

    let query = supabase
      .from('queue')
      .select(`
        *,
        user:profiles(*),
        bike:bikes(*, bike_type:bike_types(*)),
        bike_type:bike_types(*),
        assigned_bike:bikes(*, bike_type:bike_types(*))
      `)
      .order('position', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (bikeId) {
      query = query.eq('bike_id', bikeId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { user_id, bike_id, bike_type_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Check if user already in queue
    const { data: existingQueue } = await supabase
      .from('queue')
      .select('*')
      .eq('user_id', user_id)
      .in('status', ['waiting', 'notified'])
      .single()

    if (existingQueue) {
      return NextResponse.json(
        { error: 'User already in queue' },
        { status: 400 }
      )
    }

    // If bike_id specified, check if bike is available
    if (bike_id) {
      const { data: bike } = await supabase
        .from('bikes')
        .select('*')
        .eq('id', bike_id)
        .single()

      if (!bike) {
        return NextResponse.json(
          { error: 'Bike not found' },
          { status: 404 }
        )
      }

      if (bike.status === 'available') {
        // Direct assignment if bike is available
        const { data: bikeType } = await supabase
          .from('bike_types')
          .select('*')
          .eq('id', bike.bike_type_id)
          .single()

        const hourlyRate = bikeType?.hourly_rate || 5000
        const startTime = new Date()
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

        // Update bike status
        await supabase
          .from('bikes')
          .update({ status: 'rented' })
          .eq('id', bike_id)

        // Create rental
        const { data: rental, error: rentalError } = await supabase
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

        if (rentalError) throw rentalError

        return NextResponse.json({ 
          data: rental, 
          direct_assignment: true,
          message: 'Bike assigned directly without queue'
        }, { status: 201 })
      }
    }

    // Insert into queue
    const { data, error } = await supabase
      .from('queue')
      .insert({
        user_id,
        bike_id: bike_id || null,
        bike_type_id: bike_type_id || null
      })
      .select(`
        *,
        user:profiles(*),
        bike:bikes(*, bike_type:bike_types(*)),
        bike_type:bike_types(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error joining queue:', error)
    return NextResponse.json(
      { error: 'Failed to join queue' },
      { status: 500 }
    )
  }
}