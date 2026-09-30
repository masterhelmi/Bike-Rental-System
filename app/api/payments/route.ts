import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const rentalId = searchParams.get('rental_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('payments')
      .select(`
        *,
        rental:rentals(*),
        user:profiles(*)
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (rentalId) {
      query = query.eq('rental_id', rentalId)
    }

    if (status) {
      query = query.eq('payment_status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { rental_id, user_id, amount, payment_method, transaction_id } = body

    if (!user_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: 'user_id, amount, and payment_method are required' },
        { status: 400 }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        rental_id: rental_id || null,
        user_id,
        amount,
        payment_method,
        payment_status: 'completed',
        transaction_id: transaction_id || null,
        paid_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // If this payment is for a rental, update rental paid_amount
    if (rental_id) {
      const { data: rental } = await supabase
        .from('rentals')
        .select('*')
        .eq('id', rental_id)
        .single()

      if (rental) {
        const newPaidAmount = rental.paid_amount + amount
        const newPaymentStatus = newPaidAmount >= rental.total_amount ? 'paid' : 'partial'

        await supabase
          .from('rentals')
          .update({
            paid_amount: newPaidAmount,
            payment_status: newPaymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', rental_id)
      }
    }

    return NextResponse.json({ data: payment }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}