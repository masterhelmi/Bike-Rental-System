import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bike_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching bike types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bike types' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, hourly_rate, description } = body

    if (!name || !hourly_rate) {
      return NextResponse.json(
        { error: 'name and hourly_rate are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('bike_types')
      .insert({
        name,
        hourly_rate,
        description: description || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating bike type:', error)
    return NextResponse.json(
      { error: 'Failed to create bike type' },
      { status: 500 }
    )
  }
}