import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminClient = createAdminClient()

    // Check if bike has active rental
    const { data: activeRental } = await adminClient
      .from('rentals')
      .select('*')
      .eq('bike_id', id)
      .in('status', ['active', 'overdue'])
      .maybeSingle()

    if (activeRental) {
      return NextResponse.json(
        { error: 'Cannot reset bike status - rental is still active' },
        { status: 400 }
      )
    }

    // Reset bike status to available
    const { data: updatedBike, error } = await adminClient
      .from('bikes')
      .update({ status: 'available' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error resetting bike status:', error)
      throw error
    }

    return NextResponse.json({
      data: updatedBike,
      message: 'Bike status reset to available'
    })
  } catch (error) {
    console.error('Error resetting bike status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to reset bike status: ${errorMessage}` },
      { status: 500 }
    )
  }
}
