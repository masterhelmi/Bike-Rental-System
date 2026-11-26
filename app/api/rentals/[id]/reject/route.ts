import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminClient = createAdminClient()

    let reason = ''
    try {
      const body = await request.json()
      reason = body.reason || ''
    } catch {
      // No body or invalid JSON, continue without reason
    }

    // Get current rental using admin client
    const { data: rental, error: fetchError } = await adminClient
      .from('rentals')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !rental) {
      console.error('Rental not found:', fetchError)
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
    const { data, error } = await adminClient
      .from('rentals')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating rental:', error)
      throw error
    }

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