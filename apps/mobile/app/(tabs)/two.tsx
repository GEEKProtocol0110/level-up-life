import { useEffect, useMemo, useState } from 'react';
import { Button, ScrollView, StyleSheet } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchChildren, getOrCreateFamily } from '@level-up-life/api';
import { ageYears, walletMode } from '@level-up-life/core';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';

export default function WalletScreen() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  const familyQuery = useQuery({
    queryKey: ['wallet-family', session?.user.id],
    queryFn: async () => getOrCreateFamily(supabase, session!.user.id, 'My Family'),
    enabled: !!session,
  });

  const childrenQuery = useQuery({
    queryKey: ['wallet-children', familyQuery.data?.id],
    queryFn: async () => fetchChildren(supabase, familyQuery.data!.id),
    enabled: !!familyQuery.data?.id,
  });

  const firstChild = useMemo(() => childrenQuery.data?.[0] ?? null, [childrenQuery.data]);
  const gate = firstChild ? walletMode(ageYears(firstChild.birthdate)) : null;

  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Wallet (Coming Later)</Text>
        <Text style={styles.subtitle}>Sign in on Today tab to load your family.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Wallet (Coming Later)</Text>
          <Text style={styles.subtitle}>Age-appropriate gate preview</Text>
        </View>
        <Button title="Refresh" onPress={() => queryClient.invalidateQueries({ queryKey: ['wallet-children'] })} />
      </View>

      <View style={styles.card}>
        {firstChild ? (
          <>
            <Text style={styles.sectionTitle}>{firstChild.display_name}</Text>
            <Text style={styles.subtitle}>Age {ageYears(firstChild.birthdate)}</Text>
            <Text style={styles.subtitle}>Wallet mode: {gate}</Text>
            <Text style={styles.subtitle}>Real wallet features will unlock automatically by age with parent controls.</Text>
          </>
        ) : (
          <Text style={styles.subtitle}>Add a child on Today tab to preview wallet gate.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
