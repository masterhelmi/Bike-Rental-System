import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bikes')
      .select(`
        *,
        bike_type:bike_types(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching bike:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bike' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('bikes')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        bike_type:bike_types(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating bike:', error)
    return NextResponse.json(
      { error: 'Failed to update bike' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check if bike is currently rented
    const { data: activeRental } = await supabase
      .from('rentals')
      .select('*')
      .eq('bike_id', id)
      .eq('status', 'active')
      .single()

    if (activeRental) {
      return NextResponse.json(
        { error: 'Cannot delete bike that is currently rented' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('bikes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bike:', error)
    return NextResponse.json(
      { error: 'Failed to delete bike' },
      { status: 500 }
    )
  }
}