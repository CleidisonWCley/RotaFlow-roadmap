export interface Trilha {
  id: string;
  titulo: string;
  descricao?: string;
  categoria?: string;
}

export interface Modulo {
  id: string;
  id_trilha: string;
  titulo: string;
  indice_ordem: number;
}

export interface Topico {
  id: string;
  id_modulo: string;
  titulo: string;
  resumo_texto?: string;
  conteudos?: string; 
  eh_opcional: boolean;
  indice_ordem: number;
}

export interface ProgressoUsuario {
  id?: string;
  id_usuario: string;
  id_topico: string;
  concluido: boolean;
  atualizado_em?: string;
}