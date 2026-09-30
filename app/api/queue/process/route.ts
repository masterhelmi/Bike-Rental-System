import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check overdue rentals first
    await supabase.rpc('check_overdue_rentals')

    // Check queue timeouts
    await supabase.rpc('check_queue_timeout')

    // Process queue assignments
    const { data, error } = await supabase.rpc('process_queue_assignment')

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      result: data
    })
  } catch (error) {
    console.error('Error processing queue:', error)
    return NextResponse.json(
      { error: 'Failed to process queue' },
      { status: 500 }
    )
  }
}