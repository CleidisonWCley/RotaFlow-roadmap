import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';

export default function ModulosScreen() {
  const router = useRouter();
  const { trilhaId } = useLocalSearchParams<{ trilhaId: string }>();
  const [modulos, setModulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModulosETopicos() {
      setLoading(true);
      const { data, error } = await supabase
        .from('modulos')
        .select('*, topicos(*)')
        .eq('id_trilha', trilhaId)
        .order('indice_ordem', { ascending: true });

      if (!error && data) {
        setModulos(data);
      }
      setLoading(false);
    }

    if (trilhaId) fetchModulosETopicos();
  }, [trilhaId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Cabeçalho Fixo para os Módulos */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Módulos da Trilha</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {modulos.map((modulo) => (
          <View key={modulo.id} style={styles.moduloContainer}>
            <Text style={styles.moduloTitle}>
              {modulo.titulo}
            </Text>

            {modulo.topicos?.map((topico: any) => (
              <TouchableOpacity
                key={topico.id}
                style={styles.topicoCard}
                onPress={() => router.push({ pathname: '/questions', params: { topicoId: topico.id } })}
              >
                <Text style={styles.topicoText}>
                  {topico.titulo} {topico.eh_opcional ? '(Opcional)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0E15', paddingHorizontal: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 8 },
  backArrow: { color: '#FFF', fontSize: 30, lineHeight: 30, width: 28 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  headerSpacer: { width: 28 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 }, // Aumentado para garantir espaço com a barra de navegação
  moduloContainer: { marginBottom: 20 },
  moduloTitle: { flexShrink: 1, color: '#6C5CE7', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  topicoCard: { backgroundColor: '#1A1C29', padding: 14, borderRadius: 8, marginBottom: 8, overflow: 'hidden', width: '100%' },
  topicoText: { flexShrink: 1, color: '#FFF', fontSize: 15, lineHeight: 22 },
});