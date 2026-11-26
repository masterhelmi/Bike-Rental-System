import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminClient = createAdminClient()
    const actualReturnTime = new Date().toISOString()

    console.log('Processing rental return ID:', id)

    // Get current rental
    const { data: rental, error: fetchError } = await adminClient
      .from('rentals')
      .select(`
        *,
        bike:bikes(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !rental) {
      console.error('Rental not found:', fetchError)
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      )
    }

    // Check if rental can be returned
    if (rental.status !== 'active' && rental.status !== 'overdue') {
      return NextResponse.json(
        { error: 'Rental cannot be returned in current status' },
        { status: 400 }
      )
    }

    // Calculate overdue minutes
    const endTime = new Date(rental.end_time)
    const returnTime = new Date(actualReturnTime)
    const overdueMs = returnTime.getTime() - endTime.getTime()
    const overdueMinutes = Math.max(0, Math.floor(overdueMs / (1000 * 60)))

    console.log('Overdue minutes:', overdueMinutes)

    // Calculate penalty using SQL function
    const { data: penaltyResult, error: penaltyError } = await adminClient
      .rpc('calculate_late_penalty', {
        end_time: rental.end_time,
        actual_return_time: actualReturnTime
      })

    if (penaltyError) {
      console.error('Error calculating penalty:', penaltyError)
      return NextResponse.json(
        { error: 'Failed to calculate penalty' },
        { status: 500 }
      )
    }

    const penaltyAmount = penaltyResult || 0
    const penaltyTier = await adminClient.rpc('get_penalty_tier', {
      overdue_minutes: overdueMinutes
    })

    console.log('Penalty amount:', penaltyAmount, 'Tier:', penaltyTier)

    // Update rental with return details
    const rentalUpdateData: any = {
      actual_return_time: actualReturnTime,
      overdue_minutes: overdueMinutes,
      penalty_amount: penaltyAmount,
      updated_at: actualReturnTime
    }

    // Set status based on whether there's a penalty
    if (penaltyAmount > 0) {
      rentalUpdateData.status = 'completed_with_penalty'
    } else {
      rentalUpdateData.status = 'completed'
    }

    const { data: updatedRental, error: updateError } = await adminClient
      .from('rentals')
      .update(rentalUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating rental:', updateError)
      throw updateError
    }

    // Create penalty record if there's a penalty
    let penaltyRecord = null
    if (penaltyAmount > 0) {
      const { data: penalty, error: penaltyInsertError } = await adminClient
        .from('penalties')
        .insert({
          rental_id: rental.id,
          user_id: rental.user_id,
          amount: penaltyAmount,
          overdue_minutes: overdueMinutes,
          penalty_tier: penaltyTier,
          status: 'pending'
        })
        .select()
        .single()

      if (penaltyInsertError) {
        console.error('Error creating penalty record:', penaltyInsertError)
        // Don't throw error as rental was already updated
      } else {
        penaltyRecord = penalty
        console.log('Penalty record created successfully')
      }
    }

    // Update bike status back to available
    if (rental.bike_id) {
      const { error: bikeUpdateError } = await adminClient
        .from('bikes')
        .update({ status: 'available' })
        .eq('id', rental.bike_id)

      if (bikeUpdateError) {
        console.error('Error updating bike status:', bikeUpdateError)
        // Don't throw error as rental was already updated
      } else {
        console.log('Bike status updated to available')
      }
    }

    return NextResponse.json({
      data: updatedRental,
      penalty: penaltyRecord,
      message: penaltyAmount > 0
        ? `Rental returned with penalty: Rp ${penaltyAmount.toLocaleString('id-ID')}`
        : 'Rental returned successfully without penalty'
    })
  } catch (error) {
    console.error('Error processing rental return:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process rental return: ${errorMessage}` },
      { status: 500 }
    )
  }
}
