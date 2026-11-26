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
    const body = await request.json()
    const { reason } = body

    // Get current user (admin)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get penalty
    const { data: penalty, error: fetchError } = await adminClient
      .from('penalties')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !penalty) {
      return NextResponse.json(
        { error: 'Penalty not found' },
        { status: 404 }
      )
    }

    // Check if penalty can be waived
    if (penalty.status !== 'pending') {
      return NextResponse.json(
        { error: 'Penalty cannot be waived in current status' },
        { status: 400 }
      )
    }

    // Update penalty status to waived
    const { data, error } = await adminClient
      .from('penalties')
      .update({
        status: 'waived',
        waived_by: user.id,
        waived_reason: reason || 'No reason provided',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error waiving penalty:', error)
      throw error
    }

    // Also update rental penalty_amount to 0
    if (penalty.rental_id) {
      await adminClient
        .from('rentals')
        .update({
          penalty_amount: 0,
          status: 'completed', // Change from completed_with_penalty to completed
          updated_at: new Date().toISOString()
        })
        .eq('id', penalty.rental_id)
    }

    return NextResponse.json({
      data,
      message: 'Penalty waived successfully'
    })
  } catch (error) {
    console.error('Error waiving penalty:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to waive penalty: ${errorMessage}` },
      { status: 500 }
    )
  }
}
