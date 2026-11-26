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
    const { payment_method, transaction_id } = body

    // Get current user
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

    // Check if penalty can be paid
    if (penalty.status !== 'pending') {
      return NextResponse.json(
        { error: 'Penalty cannot be paid in current status' },
        { status: 400 }
      )
    }

    // Update penalty status to paid
    const { data: updatedPenalty, error: updateError } = await adminClient
      .from('penalties')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating penalty:', updateError)
      throw updateError
    }

    // Create payment record
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .insert({
        rental_id: penalty.rental_id,
        user_id: penalty.user_id,
        amount: penalty.amount,
        payment_method: payment_method || 'cash',
        payment_status: 'completed',
        transaction_id: transaction_id || `PENALTY-${penalty.id.slice(0, 8)}`,
        paid_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      // Don't throw error as penalty was already updated
    }

    return NextResponse.json({
      data: updatedPenalty,
      payment,
      message: 'Penalty paid successfully'
    })
  } catch (error) {
    console.error('Error paying penalty:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to pay penalty: ${errorMessage}` },
      { status: 500 }
    )
  }
}
