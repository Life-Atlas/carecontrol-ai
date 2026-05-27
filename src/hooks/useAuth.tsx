import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import { MOCK_ANHORIG, MOCK_BRUKARE } from '@/lib/mock-data'

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  demoMode: boolean
  demoRole: 'anhorig' | 'brukare'
  setDemoRole: (role: 'anhorig' | 'brukare') => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  signInDemo: () => void
}

const AuthContext = createContext<AuthState>({
  session: null, user: null, profile: null, loading: true,
  demoMode: false, demoRole: 'anhorig',
  setDemoRole: () => {}, signOut: async () => {},
  refreshProfile: async () => {}, signInDemo: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoActive, setDemoActive] = useState(false)
  const [demoRole, setDemoRole] = useState<'anhorig' | 'brukare'>('anhorig')

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .order('role')
    const profiles = (data || []) as Profile[]
    const picked = profiles.find(p => p.role === 'anhorig')
      || profiles.find(p => p.role === 'brukare')
      || profiles[0] || null
    setProfile(picked)
  }

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) await fetchProfile(session.user.id)
        else setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (demoActive) {
      setProfile(demoRole === 'anhorig' ? MOCK_ANHORIG : MOCK_BRUKARE)
    }
  }, [demoRole, demoActive])

  const signInDemo = () => {
    setDemoActive(true)
    setSession({ user: { id: 'mock-user-1' } } as Session)
    setProfile(demoRole === 'anhorig' ? MOCK_ANHORIG : MOCK_BRUKARE)
  }

  const signOut = async () => {
    if (demoActive) {
      setDemoActive(false)
      setSession(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (demoActive) return
    if (session?.user) await fetchProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{
      session: demoActive ? ({ user: { id: 'mock-user-1' } } as Session) : session,
      user: demoActive ? ({ id: 'mock-user-1' } as User) : (session?.user ?? null),
      profile,
      loading,
      demoMode: DEMO_MODE,
      demoRole,
      setDemoRole,
      signOut,
      refreshProfile,
      signInDemo,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
