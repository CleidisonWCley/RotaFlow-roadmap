export type Trail = {
  id: string;
  name: string;
  description: string;
  category: string;
  questionCount: number;
  completedCount: number;
  icon: 'architecture' | 'web' | 'database';
};

const localTrails: Trail[] = [
  { id: 'software-architecture', name: 'Arquitetura de Software', description: 'Camadas, padrões, coesão, acoplamento e microsserviços.', category: 'Engenharia de Software', questionCount: 20, completedCount: 8, icon: 'architecture' },
  { id: 'web-development', name: 'Desenvolvimento Web', description: 'Fundamentos de aplicações web, APIs e experiência do usuário.', category: 'Desenvolvimento', questionCount: 24, completedCount: 4, icon: 'web' },
  { id: 'databases', name: 'Banco de Dados', description: 'Modelagem, SQL, normalização e consultas eficientes.', category: 'Dados', questionCount: 18, completedCount: 0, icon: 'database' },
];

export async function getTrails(): Promise<Trail[]> {
  // Substitua este retorno por fetch('/api/trails') quando a API estiver pronta.
  return localTrails;
}