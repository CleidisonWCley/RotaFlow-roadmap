import React, { useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';

// ❌ ANTES (Legado / Depreciado):
// import { Pressable, SafeAreaView, ScrollView, ... } from 'react-native';

// ✅ DEPOIS (Recomendado):
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppPalette, MaxContentWidth } from '@/constants/theme';
import { supabase } from '@/services/supabase';

export default function ReviewScreen() {
  const { topicoId } = useLocalSearchParams<{ topicoId: string }>();
  const [topico, setTopico] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function fetchTopicoReview() {
      if (!topicoId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('topicos')
        .select('*')
        .eq('id', topicoId)
        .single();

      if (!error && data) {
        setTopico(data);
      }
      setLoading(false);
    }

    fetchTopicoReview();
  }, [topicoId]);

  async function handleMarcarConcluido() {
    try {
      setSalvando(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Aviso', 'Você precisa estar logado para salvar seu progresso.');
        return;
      }

      const { error } = await supabase
        .from('progresso_alunos')
        .upsert({
          id_usuario: user.id,
          id_topico: topicoId,
          status: 'concluido',
          atualizado_em: new Date().toISOString()
        }, { onConflict: 'id_usuario,id_topico' });

      if (!error) {
        Alert.alert('Sucesso!', 'Tópico marcado como concluído.');
        router.back();
      } else {
        Alert.alert('Erro', 'Não foi possível salvar seu progresso: ' + error.message);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={AppPalette.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <SymbolView name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_left' }} size={20} tintColor={AppPalette.text} />
        </Pressable>
        <ThemedText style={styles.eyebrow}>RESUMO PARA REVISÃO</ThemedText>
        <ThemedText style={styles.title}>{topico?.titulo || 'Arquitetura de Software'}</ThemedText>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.lessonIcon}>
              <SymbolView name={{ ios: 'book', android: 'menu_book', web: 'book' }} size={21} tintColor={AppPalette.accent} />
            </View>
            <View>
              <ThemedText style={styles.cardTitle}>Pontos-chave</ThemedText>
              <ThemedText style={styles.muted}>Leitura rápida de revisão</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.point}>
            {topico?.resumo_texto || topico?.conteudos || 'Conteúdo explicativo e resumo do tópico.'}
          </ThemedText>

          <View style={styles.tip}>
            <SymbolView name={{ ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' }} size={18} tintColor="#f0ca5c" />
            <ThemedText style={styles.tipText}>Dica ENADE: relacione cada conceito aos contextos práticos e trade-offs da solução.</ThemedText>
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.completeButton} onPress={handleMarcarConcluido} disabled={salvando}>
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <ThemedText style={styles.completeText}>Marcar como Concluído</ThemedText>
            <SymbolView name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }} size={19} tintColor="#fff" />
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppPalette.background },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: 24, gap: 10 },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: AppPalette.backgroundElement, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  eyebrow: { color: AppPalette.accent, fontSize: 12 },
  title: { color: AppPalette.text, fontSize: 28, lineHeight: 36, marginBottom: 10 },
  card: { backgroundColor: AppPalette.backgroundElement, borderColor: AppPalette.border, borderWidth: 1, borderRadius: 24, padding: 20, gap: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: AppPalette.accentSoft },
  cardTitle: { color: AppPalette.text, fontSize: 18 },
  muted: { color: AppPalette.textSecondary, fontSize: 13 },
  point: { color: AppPalette.text, fontSize: 14, lineHeight: 21 },
  tip: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: AppPalette.accentSoft, borderRadius: 12, padding: 14 },
  tipText: { color: AppPalette.textSecondary, fontSize: 12, lineHeight: 18, flex: 1 },
  completeButton: { height: 56, marginHorizontal: 24, marginBottom: 12, borderRadius: 16, backgroundColor: AppPalette.accent, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  completeText: { color: '#fff', fontSize: 16 },
});