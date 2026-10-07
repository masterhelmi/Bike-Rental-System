'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bike } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Email atau password salah')
        return
      }

      // Login successful
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bike className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">BikeShare</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Login</h2>
          <p className="text-gray-600 mt-2">Masuk untuk mulai menggunakan BikeShare</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  )
}