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
      .from('rentals')
      .select(`
        *,
        bike:bikes(*, bike_type:bike_types(*)),
        user:profiles(*),
        payments(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching rental:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rental' },
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

    // For completing a rental
    if (body.status === 'completed') {
      const { data: rental } = await supabase
        .from('rentals')
        .select('*')
        .eq('id', id)
        .single()

      if (!rental) {
        return NextResponse.json(
          { error: 'Rental not found' },
          { status: 404 }
        )
      }

      const { data, error } = await supabase
        .from('rentals')
        .update({
          status: 'completed',
          actual_end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ data })
    }

    // For cancelling a rental
    if (body.status === 'cancelled') {
      const { data, error } = await supabase
        .from('rentals')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ data })
    }

    // Generic update
    const { data, error } = await supabase
      .from('rentals')
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
    console.error('Error updating rental:', error)
    return NextResponse.json(
      { error: 'Failed to update rental' },
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
    const { error } = await supabase
      .from('rentals')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting rental:', error)
    return NextResponse.json(
      { error: 'Failed to delete rental' },
      { status: 500 }
    )
  }
}