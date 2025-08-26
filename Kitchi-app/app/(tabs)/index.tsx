import { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

import Auth from '../../components/Auth'
import Account from '../../components/Account'
import Dashboard from '../../components/Dashboard'


export default function Index() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen to auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  // If the user is logged in, show their Account screen
  if (session && session.user) {
    return <Account key={session.user.id} session={session} />
  }

  // If the user is not logged in, show the Auth (login) screen
  return (
    <View style={styles.container}>
      {/* <Auth /> */}
      <Dashboard />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
})