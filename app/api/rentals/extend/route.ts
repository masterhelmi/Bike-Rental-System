import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const EXTENSION_DURATION = 60 // 60 minutes (1 hour)
const MAX_EXTENSIONS = 2

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { rental_id } = body

    if (!rental_id) {
      return NextResponse.json(
        { error: 'rental_id is required' },
        { status: 400 }
      )
    }

    // Get current rental
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('*')
      .eq('id', rental_id)
      .single()

    if (fetchError || !rental) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      )
    }

    // Check if rental is active
    if (rental.status !== 'active') {
      return NextResponse.json(
        { error: 'Rental is not active' },
        { status: 400 }
      )
    }

    // Check max extensions
    if (rental.extension_count >= MAX_EXTENSIONS) {
      return NextResponse.json(
        { error: 'Maximum extensions reached' },
        { status: 400 }
      )
    }

    // Check if there's queue for this bike
    const { count: queueCount } = await supabase
      .from('queue')
      .select('*', { count: 'exact', head: true })
      .eq('bike_id', rental.bike_id)
      .eq('status', 'waiting')

    if (queueCount && queueCount > 0) {
      return NextResponse.json(
        { error: 'Cannot extend: queue exists for this bike' },
        { status: 400 }
      )
    }

    // Calculate new end time
    const currentEndTime = new Date(rental.end_time)
    const newEndTime = new Date(currentEndTime.getTime() + EXTENSION_DURATION * 60 * 1000)

    // Calculate additional cost
    const { data: bike } = await supabase
      .from('bikes')
      .select('*, bike_type:bike_types(*)')
      .eq('id', rental.bike_id)
      .single()

    const hourlyRate = bike?.bike_type?.hourly_rate || 5000
    const additionalCost = hourlyRate // 1 hour extension = full hourly rate

    // Update rental
    const { data, error } = await supabase
      .from('rentals')
      .update({
        end_time: newEndTime.toISOString(),
        is_extended: true,
        extension_count: rental.extension_count + 1,
        total_amount: rental.total_amount + additionalCost,
        lock_version: rental.lock_version + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', rental_id)
      .eq('lock_version', rental.lock_version) // Optimistic locking
      .select()
      .single()

    if (error) {
      // Check if it's a version conflict
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Rental was modified by another process. Please try again.' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ 
      data,
      additional_cost: additionalCost,
      new_end_time: newEndTime.toISOString()
    })
  } catch (error) {
    console.error('Error extending rental:', error)
    return NextResponse.json(
      { error: 'Failed to extend rental' },
      { status: 500 }
    )
  }
}