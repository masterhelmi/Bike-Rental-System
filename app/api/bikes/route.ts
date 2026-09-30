import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const bikeTypeId = searchParams.get('bike_type_id')
    const available = searchParams.get('available')

    let query = supabase
      .from('bikes')
      .select(`
        *,
        bike_type:bike_types(*)
      `)
      .order('bike_code', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    if (bikeTypeId) {
      query = query.eq('bike_type_id', bikeTypeId)
    }

    if (available === 'true') {
      query = query.eq('status', 'available')
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching bikes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bikes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { bike_code, bike_type_id, status, current_location } = body

    if (!bike_code) {
      return NextResponse.json(
        { error: 'bike_code is required' },
        { status: 400 }
      )
    }

    // Check if bike_code already exists
    const { data: existingBike } = await supabase
      .from('bikes')
      .select('*')
      .eq('bike_code', bike_code)
      .single()

    if (existingBike) {
      return NextResponse.json(
        { error: 'Bike code already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('bikes')
      .insert({
        bike_code,
        bike_type_id: bike_type_id || null,
        status: status || 'available',
        current_location: current_location || 'Main Station'
      })
      .select(`
        *,
        bike_type:bike_types(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating bike:', error)
    return NextResponse.json(
      { error: 'Failed to create bike' },
      { status: 500 }
    )
  }
}