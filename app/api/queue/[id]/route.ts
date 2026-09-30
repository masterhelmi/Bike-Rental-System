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
      .from('queue')
      .select(`
        *,
        user:profiles(*),
        bike:bikes(*, bike_type:bike_types(*)),
        bike_type:bike_types(*),
        assigned_bike:bikes(*, bike_type:bike_types(*))
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching queue item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue item' },
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

    // Get current queue item for optimistic locking
    const { data: currentQueue } = await supabase
      .from('queue')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentQueue) {
      return NextResponse.json(
        { error: 'Queue item not found' },
        { status: 404 }
      )
    }

    // Handle assignment (user accepts bike)
    if (body.status === 'assigned') {
      const { data: bike } = await supabase
        .from('bikes')
        .select('*, bike_type:bike_types(*)')
        .eq('id', currentQueue.assigned_bike_id)
        .single()

      if (!bike) {
        return NextResponse.json(
          { error: 'Assigned bike not found' },
          { status: 404 }
        )
      }

      // Create rental
      const hourlyRate = bike.bike_type?.hourly_rate || 5000
      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .insert({
          user_id: currentQueue.user_id,
          bike_id: bike.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          total_amount: hourlyRate,
          payment_status: 'pending',
          status: 'active'
        })
        .select()
        .single()

      if (rentalError) throw rentalError

      // Update queue status
      const { data, error } = await supabase
        .from('queue')
        .update({
          status: 'assigned',
          lock_version: currentQueue.lock_version + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('lock_version', currentQueue.lock_version)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Queue was modified by another process. Please try again.' },
            { status: 409 }
          )
        }
        throw error
      }

      return NextResponse.json({ data, rental })
    }

    // Handle cancellation
    if (body.status === 'cancelled') {
      const { data, error } = await supabase
        .from('queue')
        .update({
          status: 'cancelled',
          position: null,
          lock_version: currentQueue.lock_version + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('lock_version', currentQueue.lock_version)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Queue was modified by another process. Please try again.' },
            { status: 409 }
          )
        }
        throw error
      }

      // Reorder remaining queue
      await supabase.rpc('reorder_queue_after_cancellation', {
        cancelled_position: currentQueue.position
      })

      return NextResponse.json({ data })
    }

    // Generic update
    const { data, error } = await supabase
      .from('queue')
      .update({
        ...body,
        lock_version: currentQueue.lock_version + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('lock_version', currentQueue.lock_version)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Queue was modified by another process. Please try again.' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating queue item:', error)
    return NextResponse.json(
      { error: 'Failed to update queue item' },
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

    // Get current queue item
    const { data: currentQueue } = await supabase
      .from('queue')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentQueue) {
      return NextResponse.json(
        { error: 'Queue item not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('queue')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Reorder remaining queue
    if (currentQueue.position) {
      await supabase
        .from('queue')
        .update({ position: currentQueue.position + 1 }) // Simplified for now
        .gt('position', currentQueue.position)
        .eq('status', 'waiting')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting queue item:', error)
    return NextResponse.json(
      { error: 'Failed to delete queue item' },
      { status: 500 }
    )
  }
}