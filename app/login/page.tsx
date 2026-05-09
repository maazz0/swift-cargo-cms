// app/login/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    setErrorMsg(error.message)
    return
  }
  router.push('/dashboard')

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Swift Cargo Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  )
}