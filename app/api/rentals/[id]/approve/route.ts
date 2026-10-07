import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const body = await request.json()

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

    // Check if rental can be approved
    if (rental.status !== 'pending_payment') {
      return NextResponse.json(
        { error: 'Rental cannot be approved in current status' },
        { status: 400 }
      )
    }

    // Assign available bike of the selected type
    const { data: availableBike } = await adminClient
      .from('bikes')
      .select('*')
      .eq('bike_type_id', rental.bike_type_id)
      .eq('status', 'available')
      .limit(1)
      .single()

    if (!availableBike) {
      return NextResponse.json(
        { error: 'No available bike of this type' },
        { status: 400 }
      )
    }

    // Update bike status to rented
    await adminClient
      .from('bikes')
      .update({ status: 'rented' })
      .eq('id', availableBike.id)

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

    if (error) throw error

    return NextResponse.json({ 
      data,
      message: 'Rental approved successfully',
      assigned_bike: availableBike.bike_code
    })
  } catch (error) {
    console.error('Error approving rental:', error)
    return NextResponse.json(
      { error: 'Failed to approve rental' },
      { status: 500 }
    )
  }
}