//index.tsx

import { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

import Auth from '../../components/Auth';
import Account from '../../components/Account';
import Dashboard from '../../components/Dashboard';

const businessLogo = require('../../assets/images/logo.png');

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (session && session.user) {
    return <Account key={session.user.id} session={session} />;
  }

  return (
    <View style={styles.container}>
      {/* Logo at the top middle */}
      <View style={styles.logoContainer}>
        <Image source={businessLogo} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Auth screen below */}
      <View style={styles.content}>
        <Auth />
        {/* <Dashboard /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',   // center horizontally
    marginTop: 80,          // push it down from status bar a bit
    marginBottom: 0,       // space before content
  },
  logo: {
    width: 200,             // adjust as needed for your 16-inch phone
    height: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'center', // keep Auth vertically centered in remaining space
  },
});
