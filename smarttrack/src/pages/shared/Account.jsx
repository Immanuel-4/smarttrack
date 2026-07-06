import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase/config'
import { useAuth } from '../../context/useAuth'
import { updateDoc, doc } from 'firebase/firestore'
import { LogOut, Phone } from 'lucide-react'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatMemberSince(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
}

function SkeletonProfile() {
  return (
    <div className="border border-zinc-200 rounded-lg p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-100 rounded w-36" />
          <div className="h-3 bg-zinc-100 rounded w-48" />
          <div className="h-5 bg-zinc-100 rounded w-14" />
        </div>
      </div>
    </div>
  )
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse">
      <div className="border border-zinc-200 rounded-lg p-4 h-20 bg-zinc-50" />
      <div className="border border-zinc-200 rounded-lg p-4 h-20 bg-zinc-50" />
    </div>
  )
}

export default function Account() {
  const { user, profile, loading, setProfile } = useAuth()
  const navigate = useNavigate()
  const [editingPhone, setEditingPhone] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [savingPhone, setSavingPhone] = useState(false)

  useEffect(() => {
    if (profile?.phone) {
      setPhone(profile.phone)
    }
  }, [profile])

  const validatePhone = (phoneNum) => {
    const cleaned = phoneNum.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
  }

  const handleSavePhone = async () => {
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number (10-15 digits)')
      return
    }
    setPhoneError('')
    setSavingPhone(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { phone })
      setProfile(prev => ({ ...prev, phone }))
      setEditingPhone(false)
    } catch (err) {
      setPhoneError('Failed to update phone number')
    } finally {
      setSavingPhone(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    navigate('/login')
  }

  if (!loading && !profile) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-sm text-zinc-500">Could not load account details</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-[480px] mx-auto px-4 py-6 pb-24 md:pb-6 space-y-3">

        {/* Profile card */}
        {loading || !profile ? <SkeletonProfile /> : (
          <div className="border border-zinc-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <span className="text-base font-medium text-zinc-900">
                  {getInitials(profile.name)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-medium text-zinc-900 truncate">{profile.name}</p>
                <p className="text-sm text-zinc-500 truncate">{profile.email}</p>
                <span className="inline-block mt-1.5 text-xs bg-zinc-100 text-zinc-600 rounded-md px-2 py-0.5 capitalize">
                  {profile.userType}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading || !profile ? <SkeletonStats /> : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-medium text-zinc-900">{profile.totalTrips ?? 0}</p>
              <p className="text-xs text-zinc-400 mt-1">Total trips</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-medium text-zinc-900">
                {profile.rating != null ? Number(profile.rating).toFixed(1) : '—'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Rating / 5.0</p>
            </div>
          </div>
        )}

        {/* Info list */}
        {!loading && profile && (
          <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-zinc-500">Member since</span>
              <span className="text-sm text-zinc-900">{formatMemberSince(profile.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-zinc-500">Account type</span>
              <span className="text-sm text-zinc-900 capitalize">{profile.userType}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-zinc-500">Email</span>
              <span className="text-sm text-zinc-900 truncate max-w-[200px]">{profile.email}</span>
            </div>
            <div className="p-4">
              {!editingPhone ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone size={14} strokeWidth={1.5} className="text-zinc-400" />
                    <span className="text-sm text-zinc-500">Phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-900">{profile.phone || 'Not added'}</span>
                    <button
                      onClick={() => { setEditingPhone(true); setPhone(profile.phone || '') }}
                      className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {profile.phone ? 'Edit' : 'Add'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone size={14} strokeWidth={1.5} className="text-zinc-400" />
                    <span className="text-sm text-zinc-500">Phone</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-field text-sm"
                    placeholder="+234 800 000 0000"
                  />
                  {phoneError && (
                    <p className="text-xs text-red-600">{phoneError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {savingPhone ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditingPhone(false); setPhone(profile.phone || ''); setPhoneError('') }}
                      className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sign out */}
        {!loading && (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 bg-white border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 transition-colors text-left"
          >
            <LogOut size={16} strokeWidth={1.5} className="text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-600">Sign out</span>
          </button>
        )}
      </div>
    </div>
  )
}
