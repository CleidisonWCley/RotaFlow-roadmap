import AsyncStorage from '@react-native-async-storage/async-storage';

// Usuário "fake" guardado localmente, usado só pra testar as telas sem
// depender de uma sessão real do Supabase.
export type LocalTestUser = {
  id: string;
  email: string;
  full_name: string;
};

const STORAGE_KEY = '@rotaflow/local-test-user';

// Só habilita esse atalho em desenvolvimento (__DEV__ é injetado pelo Metro).
// Em build de produção, isLocalTestLoginEnabled fica false e o botão
// "Entrar como usuário de teste" some da tela (veja o `isLocalTestLoginEnabled &&` no profile.tsx).
export const isLocalTestLoginEnabled = __DEV__;

// Ajuste os dados/valores conforme quiser. O `id` é fixo de propósito para
// facilitar testes repetíveis (ex: sempre a mesma linha de progresso).
const FAKE_USER: LocalTestUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'teste@rotaflow.dev',
  full_name: 'Usuário de Teste',
};

type Listener = (user: LocalTestUser | null) => void;
const listeners = new Set<Listener>();

function notify(user: LocalTestUser | null) {
  listeners.forEach((listener) => listener(user));
}

// Lê o usuário de teste salvo (se algum dia foi feito "login local").
export async function getLocalTestUser(): Promise<LocalTestUser | null> {
  if (!isLocalTestLoginEnabled) return null;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalTestUser) : null;
  } catch {
    return null;
  }
}

// Salva o usuário fake no AsyncStorage e avisa quem estiver "escutando"
// (o profile.tsx usa isso pra atualizar o estado da tela na hora).
export async function signInLocalTestUser(): Promise<LocalTestUser> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(FAKE_USER));
  notify(FAKE_USER);
  return FAKE_USER;
}

// Remove o usuário fake e avisa os listeners.
export async function signOutLocalTestUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  notify(null);
}

// Padrão "observer" simples: cada tela que chamar isso recebe atualizações
// automáticas quando alguém faz login/logout local em outro lugar do app.
export function subscribeToLocalTestAuth(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}