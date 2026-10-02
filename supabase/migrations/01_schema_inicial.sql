-- 1. TABELA DE PERFIS (Herda a chave de auth.users)
CREATE TABLE public.perfis (
  id uuid NOT NULL,
  nome_completo text NOT NULL,
  foco_estudo text DEFAULT 'tecnologia_da_informacao'::text,
  criado_em timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT perfis_pkey PRIMARY KEY (id),
  CONSTRAINT perfis_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. TABELA DE TRILHAS
CREATE TABLE public.trilhas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  categoria text DEFAULT 'Geral'::text,
  CONSTRAINT trilhas_pkey PRIMARY KEY (id)
);

-- 3. TABELA DE MÓDULOS
CREATE TABLE public.modulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_trilha uuid NOT NULL,
  titulo text NOT NULL,
  indice_ordem integer NOT NULL,
  CONSTRAINT modulos_pkey PRIMARY KEY (id),
  CONSTRAINT modulos_id_trilha_fkey FOREIGN KEY (id_trilha) REFERENCES public.trilhas(id) ON DELETE CASCADE
);

-- 4. TABELA DE TÓPICOS
CREATE TABLE public.topicos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_modulo uuid NOT NULL,
  titulo text NOT NULL,
  resumo_texto text,
  eh_opcional boolean DEFAULT false,
  indice_ordem integer NOT NULL,
  conteudos text,
  CONSTRAINT topicos_pkey PRIMARY KEY (id),
  CONSTRAINT topicos_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.modulos(id) ON DELETE CASCADE
);

-- 5. TABELA DE PROGRESSO DOS ALUNOS (Ligada a public.perfis)
CREATE TABLE public.progresso_alunos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL,
  id_topico uuid NOT NULL,
  status text DEFAULT 'pendente'::text,
  atualizado_em timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  concluido boolean DEFAULT true,
  CONSTRAINT progresso_alunos_pkey PRIMARY KEY (id),
  -- LIGAÇÃO ALINHADA COM O DIAGRAMA (Aponte para public.perfis):
  CONSTRAINT progresso_alunos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.perfis(id) ON DELETE CASCADE,
  CONSTRAINT progresso_alunos_id_topico_fkey FOREIGN KEY (id_topico) REFERENCES public.topicos(id) ON DELETE CASCADE,
  CONSTRAINT unique_usuario_topico UNIQUE (id_usuario, id_topico)
);

-- 6. FUNÇÃO E TRIGGER DE AUTOMAÇÃO (PL/pgSQL)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome_completo, foco_estudo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nome_completo', 'Estudante de TI'),
    COALESCE(NEW.raw_user_meta_data->>'foco_estudo', 'TECNOLOGIA_DA_INFORMACAO')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    nome_completo = EXCLUDED.nome_completo,
    foco_estudo = EXCLUDED.foco_estudo;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();