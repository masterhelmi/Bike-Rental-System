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

    console.log('Approving rental ID:', id)

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

    console.log('Rental found:', rental.status, 'bike_type_id:', rental.bike_type_id)

    // Check if rental can be approved
    if (rental.status !== 'pending_payment') {
      console.error('Rental not in pending_payment status:', rental.status)
      return NextResponse.json(
        { error: 'Rental cannot be approved in current status' },
        { status: 400 }
      )
    }

    // Check if bike_type_id exists
    if (!rental.bike_type_id) {
      console.error('Rental has no bike_type_id')
      return NextResponse.json(
        { error: 'Rental has no bike type assigned' },
        { status: 400 }
      )
    }

    // Assign available bike of the selected type
    const { data: availableBike, error: bikeError } = await adminClient
      .from('bikes')
      .select('*')
      .eq('bike_type_id', rental.bike_type_id)
      .eq('status', 'available')
      .limit(1)
      .single()

    if (bikeError || !availableBike) {
      console.error('No available bike found:', bikeError)
      return NextResponse.json(
        { error: 'No available bike of this type' },
        { status: 400 }
      )
    }

    console.log('Available bike found:', availableBike.bike_code)

    // Update bike status to rented
    const { error: bikeUpdateError } = await adminClient
      .from('bikes')
      .update({ status: 'rented' })
      .eq('id', availableBike.id)

    if (bikeUpdateError) {
      console.error('Error updating bike status:', bikeUpdateError)
      throw bikeUpdateError
    }

    console.log('Bike status updated to rented')

    // Update rental with approved status and assigned bike
    const { data, error } = await adminClient
      .from('rentals')
      .update({
        status: 'active',
        payment_status: 'paid',
        bike_id: availableBike.id,
        paid_amount: rental.total_amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating rental:', error)
      throw error
    }

    console.log('Rental updated successfully')

    // Create payment record for this rental approval
    const { error: paymentError } = await adminClient
      .from('payments')
      .insert({
        rental_id: rental.id,
        user_id: rental.user_id,
        amount: rental.total_amount,
        payment_method: 'cash', // Default payment method for admin approval
        payment_status: 'completed',
        transaction_id: `APPROVE-${rental.id.slice(0, 8)}`,
        paid_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      // Don't throw error as rental was already approved successfully
      // Log only for debugging
    } else {
      console.log('Payment record created successfully')
    }

    return NextResponse.json({
      data,
      message: 'Rental approved successfully',
      assigned_bike: availableBike.bike_code
    })
  } catch (error) {
    console.error('Error approving rental:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to approve rental: ${errorMessage}` },
      { status: 500 }
    )
  }
}