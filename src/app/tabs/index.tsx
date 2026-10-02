import React, { useState, useCallback } from 'react';
import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { AppPalette, MaxContentWidth } from '@/constants/theme';
import { supabase } from '@/services/supabase';

export default function HomeScreen() {
  const [perfil, setPerfil] = useState<any>(null);
  const [progresso, setProgresso] = useState({ totalTopicos: 0, concluidos: 0, percentual: 0 });
  const [ultimoTopico, setUltimoTopico] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // useFocusEffect garante que os dados atualizem sozinhos sempre que o usuário voltar a esta tela
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function carregarDadosDashboard() {
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (user && isMounted) {
            // 1. Busca perfil do usuário
            const { data: perfilData } = await supabase
              .from('perfis')
              .select('*')
              .eq('id', user.id)
              .single();

            if (perfilData && isMounted) setPerfil(perfilData);

            // 2. Busca total de tópicos cadastrados na plataforma
            const { count: totalCount } = await supabase
              .from('topicos')
              .select('*', { count: 'exact', head: true });

            // 3. Busca total de tópicos concluídos pelo usuário
            const { data: progressoData, count: concluidosCount } = await supabase
              .from('progresso_alunos')
              .select('*, topicos(*)', { count: 'exact' })
              .eq('id_usuario', user.id)
              .or('concluido.eq.true,status.eq.concluido');

            const total = totalCount || 1;
            const concluidos = concluidosCount || 0;
            const pct = Math.round((concluidos / total) * 100);

            if (isMounted) {
              setProgresso({ totalTopicos: total, concluidos, percentual: pct });

              if (progressoData && progressoData.length > 0) {
                setUltimoTopico(progressoData[progressoData.length - 1].topicos);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dashboard:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      carregarDadosDashboard();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AppPalette.accent} />
      </SafeAreaView>
    );
  }

  // Fallback de nome para garantir que exiba o nome mesmo em contas antigas de teste
  const nomeExibicao =
    perfil?.nome_completo && perfil.nome_completo !== 'Aluno(a)'
      ? perfil.nome_completo
      : 'Estudante de TI';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText style={styles.date}>{dataAtual}</ThemedText>
            <ThemedText style={styles.greeting} numberOfLines={1}>
              Olá, {nomeExibicao} 👋
            </ThemedText>
          </View>
          <View style={styles.avatar}>
            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={24} tintColor={AppPalette.accent} />
          </View>
        </View>

        {/* Card de Progresso com Layout Corrigido (Sem sobreposição) */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTextContainer}>
              <ThemedText style={styles.muted}>Seu progresso</ThemedText>
              <ThemedText style={styles.progressValue}>{progresso.percentual}% Geral</ThemedText>
            </View>
            <View style={styles.iconBox}>
              <SymbolView name={{ ios: 'trophy', android: 'emoji_events', web: 'star' }} size={22} tintColor={AppPalette.accent} />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progresso.percentual}%` }]} />
          </View>

          <ThemedText style={styles.muted}>
            {progresso.concluidos} de {progresso.totalTopicos} tópicos concluídos
          </ThemedText>
        </View>

        <View style={styles.resumeCard}>
          <ThemedText style={styles.eyebrow}>CONTINUAR DE ONDE PAROU</ThemedText>
          <View style={styles.lessonRow}>
            <View style={styles.lessonIcon}>
              <SymbolView name={{ ios: 'point.3.connected.trianglepath.dotted', android: 'account_tree', web: 'share' }} size={21} tintColor={AppPalette.accent} />
            </View>
            <View style={styles.lessonCopy}>
              <ThemedText style={styles.lessonTitle} numberOfLines={2}>
                {ultimoTopico?.titulo || 'Selecione uma Trilha'}
              </ThemedText>
              <ThemedText style={styles.muted}>
                {ultimoTopico ? 'Tópico de Estudo' : 'Explore os conteúdos do ENADE 2026'}
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (ultimoTopico?.id) {
                router.push({ pathname: '/questions', params: { topicoId: ultimoTopico.id } });
              } else {
                router.push('./(tabs)/explore');
              }
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <ThemedText style={styles.buttonText}>
              {ultimoTopico ? 'Continuar Tópico' : 'Explorar Trilhas'}
            </ThemedText>
            <SymbolView name={{ ios: 'play.fill', android: 'play_arrow', web: 'link' }} size={16} tintColor="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppPalette.background },
  content: { flex: 1, maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center', padding: 24, paddingBottom: 40, gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  headerText: { flex: 1, paddingRight: 12 },
  date: { color: AppPalette.textSecondary, fontSize: 13, textTransform: 'capitalize' },
  greeting: { color: AppPalette.text, fontSize: 25, lineHeight: 32, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: AppPalette.backgroundElement, borderWidth: 1, borderColor: AppPalette.accent, alignItems: 'center', justifyContent: 'center' },
  
  // Estilos da caixa de progresso ajustados
  progressCard: { backgroundColor: AppPalette.backgroundElement, borderRadius: 24, padding: 20, gap: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTextContainer: { flex: 1, paddingRight: 12 },
  muted: { color: AppPalette.textSecondary, fontSize: 13, lineHeight: 19 },
  progressValue: { color: AppPalette.text, fontSize: 28, lineHeight: 34, marginTop: 2, fontWeight: 'bold' },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: AppPalette.accentSoft },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: AppPalette.track, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: AppPalette.accent },

  resumeCard: { backgroundColor: AppPalette.backgroundElement, borderRadius: 24, borderWidth: 1, borderColor: AppPalette.border, padding: 20, gap: 16 },
  eyebrow: { color: AppPalette.accent, fontSize: 12, letterSpacing: 0.2 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: AppPalette.accentSoft },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: AppPalette.text, fontSize: 18, lineHeight: 24 },
  primaryButton: { height: 56, borderRadius: 16, backgroundColor: AppPalette.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pressed: { opacity: 0.78 },
});