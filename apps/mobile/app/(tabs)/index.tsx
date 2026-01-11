import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  completeQuestInstance,
  createChildProfile,
  ensureQuestInstancesForToday,
  fetchChildren,
  fetchQuestInstancesForToday,
  fetchXpTotal,
  getOrCreateFamily,
  type ChildProfile,
  type Family,
  type QuestInstance,
} from '@level-up-life/api';
import { ageYears, computeLevel } from '@level-up-life/core';
import { Text } from '@/components/Themed';
import { supabase } from '@/lib/supabase';

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [childForm, setChildForm] = useState({ name: '', birthdate: '' });
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const hasSetInitialChild = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        queryClient.clear();
        setSelectedChildId(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [queryClient]);

  const familyQuery = useQuery<Family>({
    queryKey: ['family', session?.user.id],
    queryFn: async () => getOrCreateFamily(supabase, session!.user.id, 'My Family'),
    enabled: !!session,
  });

  const childrenQuery = useQuery<ChildProfile[]>({
    queryKey: ['children', familyQuery.data?.id],
    queryFn: async () => fetchChildren(supabase, familyQuery.data!.id),
    enabled: !!familyQuery.data?.id,
  });

  useEffect(() => {
    if (!hasSetInitialChild.current && (childrenQuery.data?.length ?? 0) > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedChildId(childrenQuery.data![0].id);
      hasSetInitialChild.current = true;
    }
  }, [childrenQuery.data]);

  const questsQuery = useQuery<QuestInstance[]>({
    queryKey: ['quests', selectedChildId],
    queryFn: async () => fetchQuestInstancesForToday(supabase, selectedChildId!),
    enabled: !!selectedChildId,
  });

  const xpQuery = useQuery<number>({
    queryKey: ['xp', selectedChildId],
    queryFn: async () => fetchXpTotal(supabase, selectedChildId!),
    enabled: !!selectedChildId,
  });

  const authMutation = useMutation({
    mutationFn: async () => {
      if (isSigningUp) {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });
      if (error) throw error;
    },
    onError: (err) => Alert.alert('Auth error', err.message),
  });

  const addChildMutation = useMutation({
    mutationFn: async () => {
      if (!familyQuery.data) return;
      await createChildProfile(supabase, {
        family_id: familyQuery.data.id,
        display_name: childForm.name,
        birthdate: childForm.birthdate,
      });
    },
    onSuccess: () => {
      setChildForm({ name: '', birthdate: '' });
      queryClient.invalidateQueries({ queryKey: ['children', familyQuery.data?.id] });
    },
    onError: (err) => Alert.alert('Add child failed', err.message),
  });

  const ensureTodayMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChildId) return;
      await ensureQuestInstancesForToday(supabase, selectedChildId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests', selectedChildId] });
    },
    onError: (err) => Alert.alert('Prepare quests failed', err.message),
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questInstanceId: string) => {
      await completeQuestInstance(supabase, questInstanceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests', selectedChildId] });
      queryClient.invalidateQueries({ queryKey: ['xp', selectedChildId] });
      Alert.alert('Nice!', 'Quest completed. XP awarded.');
    },
    onError: (err) => Alert.alert('Complete quest failed', err.message),
  });

  const currentChild = useMemo(() => {
    return childrenQuery.data?.find((c) => c.id === selectedChildId) ?? null;
  }, [childrenQuery.data, selectedChildId]);

  const levelInfo = useMemo(() => computeLevel(xpQuery.data ?? 0), [xpQuery.data]);

  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Level-Up Life</Text>
        <Text style={styles.subtitle}>Sign in to manage family quests.</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            value={authForm.email}
            onChangeText={(email) => setAuthForm((prev) => ({ ...prev, email }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={authForm.password}
            onChangeText={(password) => setAuthForm((prev) => ({ ...prev, password }))}
          />
          <View style={styles.row}>
            <Button
              title={authMutation.isPending ? 'Working...' : isSigningUp ? 'Sign up & Sign in' : 'Sign in'}
              onPress={() => authMutation.mutate()}
              disabled={authMutation.isPending}
            />
            <View style={{ width: 12 }} />
            <Button
              title={isSigningUp ? 'Switch to Sign in' : 'Switch to Sign up'}
              onPress={() => setIsSigningUp((prev) => !prev)}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Today&apos;s Quests</Text>
          <Text style={styles.subtitle}>Level {levelInfo.level} • XP {xpQuery.data ?? 0}</Text>
        </View>
        <Button title="Sign out" onPress={() => supabase.auth.signOut()} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Children</Text>
        <View style={styles.tagRow}>
          {childrenQuery.data?.map((child) => (
            <Button
              key={child.id}
              title={selectedChildId === child.id ? `★ ${child.display_name}` : child.display_name}
              onPress={() => setSelectedChildId(child.id)}
              color={selectedChildId === child.id ? '#2563eb' : '#0f172a'}
            />
          ))}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Name"
            value={childForm.name}
            onChangeText={(name) => setChildForm((prev) => ({ ...prev, name }))}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Birthdate YYYY-MM-DD"
            value={childForm.birthdate}
            onChangeText={(birthdate) => setChildForm((prev) => ({ ...prev, birthdate }))}
          />
          <Button title="Add" onPress={() => addChildMutation.mutate()} />
        </View>
      </View>

      {currentChild ? (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sectionTitle}>{currentChild.display_name}</Text>
              <Text style={styles.subtitle}>Age {ageYears(currentChild.birthdate)} • Level {levelInfo.level}</Text>
            </View>
            <Button
              title={ensureTodayMutation.isPending ? 'Preparing...' : "Today's quests"}
              onPress={() => ensureTodayMutation.mutate()}
              disabled={ensureTodayMutation.isPending}
            />
          </View>

          {questsQuery.data?.map((quest) => (
            <View key={quest.id} style={styles.questRow}>
              <Text style={styles.questTitle}>Quest #{quest.id.slice(0, 6)}</Text>
              {quest.status !== 'completed' ? (
                <Button
                  title="Complete"
                  onPress={() => completeQuestMutation.mutate(quest.id)}
                  color="#16a34a"
                />
              ) : (
                <Text style={styles.completedText}>Done</Text>
              )}
            </View>
          ))}

          {questsQuery.data?.length === 0 && <Text style={styles.subtitle}>No quests yet. Generate today&apos;s quests.</Text>}
        </View>
      ) : (
        <Text style={styles.subtitle}>Add or select a child to view quests.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
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
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  questTitle: {
    fontWeight: '600',
  },
  completedText: {
    color: '#16a34a',
    fontWeight: '600',
  },
});
