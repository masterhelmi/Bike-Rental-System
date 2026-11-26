import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Get rental to verify ownership
    const { data: rental, error: fetchError } = await adminClient
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

    // Verify user owns this rental (unless admin)
    if (rental.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this rental' },
        { status: 403 }
      )
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'pending_payment': ['cancelled', 'rejected'],
      'active': ['completed', 'overdue'],
      'overdue': ['completed', 'completed_with_penalty']
    }

    const currentStatus = rental.status
    const allowedStatuses = validTransitions[currentStatus] || []

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      )
    }

    // Update rental status
    const { data: updatedRental, error: updateError } = await adminClient
      .from('rentals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating rental:', updateError)
      throw updateError
    }

    // If cancelling a pending_payment rental, also release the bike if it was assigned
    if (status === 'cancelled' && rental.bike_id) {
      const { error: bikeUpdateError } = await adminClient
        .from('bikes')
        .update({ status: 'available' })
        .eq('id', rental.bike_id)

      if (bikeUpdateError) {
        console.error('Error updating bike status:', bikeUpdateError)
        // Don't fail the cancellation if bike update fails
      }
    }

    return NextResponse.json({
      data: updatedRental,
      message: 'Rental updated successfully'
    })
  } catch (error) {
    console.error('Error updating rental:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to update rental: ${errorMessage}` },
      { status: 500 }
    )
  }
}
