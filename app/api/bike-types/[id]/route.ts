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
      .from('bike_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching bike type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bike type' },
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
      .from('bike_types')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating bike type:', error)
    return NextResponse.json(
      { error: 'Failed to update bike type' },
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

    // Check if bike type is being used
    const { data: bikesWithThisType } = await supabase
      .from('bikes')
      .select('id')
      .eq('bike_type_id', id)
      .limit(1)

    if (bikesWithThisType && bikesWithThisType.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bike type that is being used by bikes' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('bike_types')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bike type:', error)
    return NextResponse.json(
      { error: 'Failed to delete bike type' },
      { status: 500 }
    )
  }
}