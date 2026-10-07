import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { reason } = body

    // Get current rental
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !rental) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      )
    }

    // Check if rental can be rejected
    if (rental.status !== 'pending_payment') {
      return NextResponse.json(
        { error: 'Rental cannot be rejected in current status' },
        { status: 400 }
      )
    }

    // Update rental status to rejected
    const { data, error } = await supabase
      .from('rentals')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      data,
      message: 'Rental rejected successfully'
    })
  } catch (error) {
    console.error('Error rejecting rental:', error)
    return NextResponse.json(
      { error: 'Failed to reject rental' },
      { status: 500 }
    )
  }
}