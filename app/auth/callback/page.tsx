'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (data.session) {
          router.push('/dashboard')
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memproses autentikasi...</p>
      </div>
    </div>
  )
}