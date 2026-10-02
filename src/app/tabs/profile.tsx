import React, { useState, useCallback } from 'react';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { AppPalette } from '@/constants/theme';
import { supabase } from '@/services/supabase';

type AuthMode = 'login' | 'register';
type MessageType = 'success' | 'error';

type Perfil = {
  id: string;
  nome_completo: string | null;
  foco_estudo: string | null;
  criado_em: string;
};

export default function ProfileScreen() {
  const logo = require('@/assets/images/logoicon.png');
      
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [progresso, setProgresso] = useState({ concluidos: 0, total: 0 });
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType | null>(null);

  // Atualiza perfil e progresso toda vez que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function carregarDadosPerfil() {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (isMounted) setSession(activeSession);

        if (activeSession?.user) {
          // 1. Busca perfil do banco
          const { data: perfilData } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', activeSession.user.id)
            .single();

          if (perfilData && isMounted) setPerfil(perfilData as Perfil);

          // 2. Busca progresso do aluno (Tópicos concluídos e Total)
          const { count: concluidosCount } = await supabase
            .from('progresso_alunos')
            .select('*', { count: 'exact', head: true })
            .eq('id_usuario', activeSession.user.id)
            .or('concluido.eq.true,status.eq.concluido');

          const { count: totalCount } = await supabase
            .from('topicos')
            .select('*', { count: 'exact', head: true });

          if (isMounted) {
            setProgresso({
              concluidos: concluidosCount || 0,
              total: totalCount || 0,
            });
          }
        }
        if (isMounted) setLoading(false);
      }

      carregarDadosPerfil();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  function showMessage(type: MessageType, text: string) {
    setMessageType(type);
    setMessage(text);
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage('');
    setMessageType(null);
    setShowPassword(false);
  }

  async function handleRecuperarSenha() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      showMessage('error', 'Digite seu e-mail no campo acima para receber as instruções.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
    if (error) {
      showMessage('error', 'Erro ao enviar e-mail: ' + error.message);
    } else {
      showMessage('success', 'E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    }
    setSubmitting(false);
  }

  async function handleAuth() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password || (mode === 'register' && !name.trim())) {
      showMessage('error', mode === 'login' ? 'Informe e-mail e senha.' : 'Informe nome, e-mail e senha.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setMessageType(null);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        showMessage('error', error.message);
      } else {
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { 
          data: { 
            full_name: name.trim(),
            foco_estudo: 'TECNOLOGIA_DA_INFORMACAO'
          } 
        },
      });

      if (error) {
        const jaCadastrado = error.message.toLowerCase().includes('already registered');
        showMessage('error', jaCadastrado ? 'Este e-mail já está cadastrado. Faça login para continuar.' : error.message);
      } else if (!data.session) {
        showMessage('success', 'Conta criada com sucesso! Faça login para continuar.');
        setMode('login');
        setPassword('');
      }
    }

    setSubmitting(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Não foi possível sair', error.message);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppPalette.accent} />
      </View>
    );
  }

  if (session?.user) {
    const displayName =
      perfil?.nome_completo && perfil.nome_completo !== 'Aluno(a)'
        ? perfil.nome_completo
        : session?.user.user_metadata?.full_name ||
          session?.user.email?.split('@')[0] ||
          'Estudante de TI';

    const displayEmail = session?.user.email;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.profileContent}>
          <Image source={logo} style={styles.profileLogo} contentFit="contain" />
          <ThemedText style={styles.eyebrow}>SUA CONTA</ThemedText>
          <ThemedText style={styles.title}>Olá, {displayName}</ThemedText>
          <ThemedText style={styles.muted}>{displayEmail}</ThemedText>
          
          <ThemedText style={styles.muted}>
            Foco de estudo: {perfil?.foco_estudo || 'Tecnologia da Informação'}
          </ThemedText>

          {/* Card de Progresso com Métricas Reais do Banco */}
          <View style={styles.accountCard}>
            <ThemedText style={styles.cardTitle}>Seu progresso</ThemedText>
            <ThemedText style={styles.cardHighlight}>
              {progresso.concluidos} de {progresso.total} tópicos concluídos
            </ThemedText>
            <ThemedText style={styles.cardText}>
              {progresso.total > 0
                ? `Você já completou ${Math.round((progresso.concluidos / progresso.total) * 100)}% de todo o conteúdo disponível.`
                : 'Acompanhe suas trilhas e tópicos concluídos por aqui.'}
            </ThemedText>
          </View>

          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <ThemedText style={styles.secondaryButtonText}>Sair da conta</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
          <Image source={logo} style={styles.logo} contentFit="contain" />
          <ThemedText style={styles.eyebrow}>ROTAFLOW</ThemedText>
          <ThemedText style={styles.title}>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {mode === 'login' ? 'Entre para acompanhar sua evolução.' : 'Salve seu progresso e continue seus estudos.'}
          </ThemedText>

          <View style={styles.switcher}>
            <Pressable onPress={() => switchMode('login')} style={[styles.switchOption, mode === 'login' && styles.switchOptionActive]}>
              <ThemedText style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>Entrar</ThemedText>
            </Pressable>
            <Pressable onPress={() => switchMode('register')} style={[styles.switchOption, mode === 'register' && styles.switchOptionActive]}>
              <ThemedText style={[styles.switchText, mode === 'register' && styles.switchTextActive]}>Criar conta</ThemedText>
            </Pressable>
          </View>

          {mode === 'register' && (
            <TextInput value={name} onChangeText={setName} placeholder="Seu nome completo" placeholderTextColor={AppPalette.textSecondary} style={styles.input} autoCapitalize="words" />
          )}
          
          <TextInput value={email} onChangeText={setEmail} placeholder="E-mail" placeholderTextColor={AppPalette.textSecondary} style={styles.input} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
          
          <View style={styles.passwordContainer}>
            <TextInput 
              value={password} 
              onChangeText={setPassword} 
              placeholder="Senha" 
              placeholderTextColor={AppPalette.textSecondary} 
              style={styles.passwordInput} 
              secureTextEntry={!showPassword} 
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
               <SymbolView 
                 name={{ ios: showPassword ? 'eye.slash' : 'eye', android: showPassword ? 'visibility_off' : 'visibility', web: showPassword ? 'visibility_off' : 'visibility' }} 
                 size={20} 
                 tintColor={AppPalette.textSecondary} 
               />
            </Pressable>
          </View>

          {mode === 'login' && (
            <Pressable onPress={handleRecuperarSenha} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
              <ThemedText style={{ color: AppPalette.accent, fontSize: 13, fontWeight: '600' }}>
                Esqueci minha senha
              </ThemedText>
            </Pressable>
          )}

          {!!message && (
            <ThemedText style={[styles.message, messageType === 'success' && styles.messageSuccess]}>
              {message}
            </ThemedText>
          )}

          <Pressable onPress={handleAuth} disabled={submitting} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, submitting && styles.disabled]}>
            {submitting ? <ActivityIndicator color={AppPalette.text} /> : <ThemedText style={styles.primaryButtonText}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</ThemedText>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: AppPalette.background, flex: 1 },
  center: { alignItems: 'center', backgroundColor: AppPalette.background, flex: 1, justifyContent: 'center' },
  keyboardView: { flex: 1 },
  authContent: { alignSelf: 'center', justifyContent: 'center', maxWidth: 520, padding: 24, paddingBottom: 48, width: '100%' },
  profileContent: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  logo: { height: 104, marginBottom: 18, width: 104, alignSelf: 'center' },
  profileLogo: { height: 82, marginBottom: 18, width: 82 },
  eyebrow: { color: AppPalette.accent, fontSize: 12, letterSpacing: 0.8, textAlign: 'center' },
  title: { color: AppPalette.text, fontSize: 28, lineHeight: 36, marginTop: 6, textAlign: 'center' },
  subtitle: { color: AppPalette.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 22, marginTop: 6, textAlign: 'center' },
  muted: { color: AppPalette.textSecondary, fontSize: 14, marginTop: 4 },
  switcher: { backgroundColor: AppPalette.backgroundElement, borderRadius: 12, flexDirection: 'row', marginBottom: 14, padding: 4 },
  switchOption: { borderRadius: 9, flex: 1, padding: 11 },
  switchOptionActive: { backgroundColor: AppPalette.accentSoft },
  switchText: { color: AppPalette.textSecondary, fontSize: 14, textAlign: 'center' },
  switchTextActive: { color: AppPalette.text, fontWeight: '700' },
  input: { backgroundColor: AppPalette.backgroundElement, borderColor: AppPalette.border, borderRadius: 12, borderWidth: 1, color: AppPalette.text, fontSize: 15, marginBottom: 12, paddingHorizontal: 16, paddingVertical: 14 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppPalette.backgroundElement, borderColor: AppPalette.border, borderRadius: 12, borderWidth: 1, marginBottom: 12, paddingRight: 16 },
  passwordInput: { flex: 1, color: AppPalette.text, fontSize: 15, paddingHorizontal: 16, paddingVertical: 14 },
  eyeButton: { padding: 4 },
  message: { color: '#F1A7A7', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  messageSuccess: { color: '#8FE3A6' },
  primaryButton: { alignItems: 'center', backgroundColor: AppPalette.accent, borderRadius: 12, justifyContent: 'center', minHeight: 52, paddingHorizontal: 18 },
  primaryButtonText: { color: AppPalette.text, fontSize: 15, fontWeight: '700' },
  accountCard: { backgroundColor: AppPalette.backgroundElement, borderColor: AppPalette.border, borderRadius: 16, borderWidth: 1, marginTop: 24, maxWidth: 360, padding: 18, width: '100%' },
  cardTitle: { color: AppPalette.text, fontSize: 16, fontWeight: '700' },
  cardHighlight: { color: AppPalette.accent, fontSize: 15, fontWeight: 'bold', marginTop: 6 },
  cardText: { color: AppPalette.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  secondaryButton: { borderColor: AppPalette.border, borderRadius: 12, borderWidth: 1, marginTop: 16, paddingHorizontal: 18, paddingVertical: 14 },
  secondaryButtonText: { color: AppPalette.textSecondary, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.6 },
});