import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useNavigate, Link } from 'react-router-dom'
import { User, Car } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', userType: 'Rider' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.name,
        email: form.email,
        userType: form.userType,
        rating: 5.0,
        totalTrips: 0,
        createdAt: serverTimestamp(),
      })
      navigate(form.userType === 'Driver' ? '/driver' : '/rider')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-2xl font-medium text-zinc-900 mb-1">SmartTrack</div>
          <p className="text-sm text-zinc-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Full name</label>
            <input type="text" value={form.name} onChange={set('name')} className="input-field" placeholder="Ada Okonkwo" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="ada@example.com" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={set('password')} className="input-field" placeholder="Min. 6 characters" required minLength={6} />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'Rider', Icon: User },
                { type: 'Driver', Icon: Car },
              ].map(({ type, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, userType: type }))}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                    form.userType === type
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-zinc-900 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
