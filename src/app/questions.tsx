import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '../services/supabase';

const Header = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <View style={styles.header}>
    <Pressable onPress={onBack} hitSlop={10}>
      <Text style={styles.backArrow}>‹</Text>
    </Pressable>
    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
    <View style={styles.headerSpacer} />
  </View>
);

export default function QuestionsScreen() {
  const router = useRouter();
  const { topicoId } = useLocalSearchParams<{ topicoId: string }>();
  const [topico, setTopico] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopico() {
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

    if (topicoId) fetchTopico();
  }, [topicoId]);

  async function handleConcluirTopico() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    Alert.alert('Aviso', 'Você precisa estar logado para salvar seu progresso.');
    return;
  }

  // Grava o progresso do aluno na tabela 'progresso_alunos'
  const { error } = await supabase
    .from('progresso_alunos')
    .upsert({
      id_usuario: user.id,
      id_topico: topicoId,
      concluido: true,
      status: 'concluido',
      atualizado_em: new Date().toISOString()
    }, { onConflict: 'id_usuario,id_topico' });

  if (!error) {
    Alert.alert('Parabéns!', 'Tópico marcado como concluído.');
    router.back();
  } else {
    Alert.alert('Erro', 'Não foi possível salvar seu progresso: ' + error.message);
  }
}
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Carregando..." onBack={() => router.back()} />
        <ActivityIndicator size="large" color="#6C5CE7" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!topico) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Tópico" onBack={() => router.back()} />
        <Text style={styles.notFoundText}>Tópico não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    // Ajustado edges para incluir 'bottom'
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header title={topico.titulo} onBack={() => router.back()} />

      <ScrollView style={styles.card} contentContainerStyle={styles.cardContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.bodyText}>
          {topico.conteudos || topico.resumo_texto || 'Conteúdo explicativo em desenvolvimento.'}
        </Text>
      </ScrollView>

      {/* Container fixo inferior com margem de segurança */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleConcluirTopico} style={styles.button}>
          <Text style={styles.buttonText}>Marcar como Concluído</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0E15', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 8 },
  backArrow: { color: '#FFF', fontSize: 30, lineHeight: 30, width: 28 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  headerSpacer: { width: 28 },
  card: { flex: 1, backgroundColor: '#1A1C29', borderRadius: 12, marginBottom: 12 },
  cardContent: { padding: 16, paddingBottom: 24 },
  bodyText: { fontSize: 15, color: '#E0E0E0', lineHeight: 24 },
  notFoundText: { color: '#FFF', textAlign: 'center', marginTop: 20 },
  bottomContainer: { paddingTop: 4, paddingBottom: 8 },
  button: { backgroundColor: '#6C5CE7', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});