# RotaFlow

> Aplicativo mobile de trilhas de estudo em Tecnologia da Informação, com conteúdo baseado na matriz oficial do **ENADE 2026**.

![React Native](https://img.shields.io/badge/React_Native-Expo_Router-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-%E2%89%A5%2018-339933?logo=node.js&logoColor=white)

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Cursos contemplados](#-cursos-contemplados)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#️-tecnologias)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Banco de dados](#️-banco-de-dados)
- [Como executar localmente](#-como-executar-localmente)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Equipe](#-equipe)

---

## 📌 Sobre o projeto

O **RotaFlow** organiza o conteúdo programático de Tecnologia da Informação em **cursos, módulos e tópicos de estudo**, permitindo que o estudante navegue livremente pelo conteúdo e acompanhe o próprio progresso.

O objetivo do produto é disponibilizar, em ambiente de produção, uma plataforma mobile construída com **React Native (Expo Router)** e integrada ao **Supabase (PostgreSQL / BaaS)**.

Na versão atual, o conteúdo está **100% concentrado na matriz oficial do ENADE 2026**.

---

## 🎓 Cursos contemplados

| # | Curso | Tipo |
| :-: | :--- | :--- |
| 1 | Sistemas de Informação | Bacharelado |
| 2 | Ciência da Computação | Bacharelado |
| 3 | Engenharia de Computação | Bacharelado |
| 4 | Análise e Desenvolvimento de Sistemas (ADS) | Tecnologia |
| 5 | Gestão da Tecnologia da Informação (GTI) | Tecnologia |
| 6 | Redes de Computadores | Tecnologia |

---

## ✨ Funcionalidades

- Autenticação de usuários com Supabase Auth e sessão persistida localmente
- Navegação em 4 níveis: **Trilhas → Módulos → Tópicos → Conteúdo**
- Leitura de conteúdo didático estruturado em **Markdown**
- Resumo do progresso do aluno

### Fluxo de navegação

| Nível | Tela | Arquivo |
| :-: | :--- | :--- |
| 1 | Trilhas do ENADE 2026 | `src/app/(tabs)/explore.tsx` |
| 2 e 3 | Módulos e Tópicos | `src/app/modulos.tsx` |
| 4 | Leitura do conteúdo didático | `src/app/questions.tsx` |
| — | Resumo de progresso | `src/app/review.tsx` |

---

## Tecnologias

| Camada | Tecnologia |
| :--- | :--- |
| Front-end mobile | React Native, Expo Router, TypeScript |
| Back-end (BaaS) | Supabase (PostgreSQL, Supabase Auth) |
| Sessão local | `@react-native-async-storage/async-storage` |
| Conteúdo didático | Textos estruturados em Markdown |

---

## Estrutura do repositório

```text
rotaflow/
├── assets/                       # Recursos visuais e ícones
├── src/                          # Código-fonte da aplicação
│   ├── app/                      # Navegação e telas (Expo Router)
│   │   ├── (tabs)/
│   │   │   └── explore.tsx       # Nível 1: Trilhas do ENADE 2026
│   │   ├── modulos.tsx           # Níveis 2 e 3: Módulos e Tópicos
│   │   ├── questions.tsx         # Nível 4: Leitura do conteúdo didático
│   │   └── review.tsx            # Resumo de progresso do aluno
│   └── services/
│       └── supabase.ts           # Conexão com a API do Supabase
├── supabase/                     # Infraestrutura e scripts do banco
│   ├── migrations/
│   │   └── 01_schema_inicial.sql # DDL: tabelas, FKs, trigger e RLS
│   └── seeds/
│       └── 01_dados_de_teste.sql # Carga inicial das trilhas
├── .env.example                  # Modelo das variáveis de ambiente
├── .gitignore                    # Proteção de credenciais e dependências
├── package.json                  # Dependências do Node.js
└── README.md                     # Documentação do repositório
```

---

## Banco de dados

O repositório adota o padrão **Database Migration as Code**: toda a infraestrutura relacional está versionada em scripts `.sql` dentro do projeto.

| Script | Conteúdo |
| :--- | :--- |
| `supabase/migrations/01_schema_inicial.sql` | Tabelas, chaves estrangeiras, trigger e políticas de RLS (Row Level Security) |
| `supabase/seeds/01_dados_de_teste.sql` | Povoamento da matriz ENADE 2026 (trilhas, módulos e tópicos) |

---

## Como executar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) **versão 18 ou superior**
- Aplicativo **Expo Go** no celular **ou** um navegador web no PC
- Um projeto criado no [Supabase](https://supabase.com/)

### Passo a passo

**Clonar o repositório**

```bash
git clone https://github.com/CleidisonWCley/RotaFlow-roadmap.git
cd rotaflow
```

**Instalar as dependências**

O comando abaixo lê o `package.json` e baixa todas as bibliotecas necessárias (Expo, Supabase JS, Async Storage etc.):

```bash
npm install
```

**3. Configurar as variáveis de ambiente**

```bash
cp .env.example .env
```

Abra o `.env` e preencha com as credenciais do seu projeto no Supabase (**Project Settings → API**). Veja a seção [Variáveis de ambiente](#-variáveis-de-ambiente).

**4. Preparar o banco de dados (Supabase)**

No **SQL Editor** do painel do Supabase, execute os scripts **nesta ordem**:

1. `supabase/migrations/01_schema_inicial.sql` — cria o esquema relacional e os triggers
2. `supabase/seeds/01_dados_de_teste.sql` — popula a matriz ENADE 2026

**5. Iniciar a aplicação**

```bash
npx expo start
```

Depois, escaneie o QR Code com o Expo Go ou pressione `w` para abrir no navegador.

---

## Variáveis de ambiente

O arquivo `.env.example` serve de modelo. Você precisará, no mínimo, da **URL do projeto** e da **chave pública (anon key)** do Supabase.

> ⚠️ **Nunca** faça commit do arquivo `.env` nem exponha a `service_role key` no aplicativo. O `.gitignore` já protege o `.env`.

---

## Equipe

| Integrante | Função no projeto |
| :--- | :--- |
| **Marcos França Gino Gonçalves** | Product Owner (P.O.) e Curador de Conteúdo |
| **Cleidison Raimundo dos Santos Lima** | Backend e Engenharia de Dados |
| **Victor Gabriel Cabral da Silva** | Frontend e UI/UX |
| **Fernando Luiz Jales da Rocha** | Documentação Técnica |
| **Marcelo Felipe Beckman** | Pesquisa de Editais e Materiais de Estudo |

---

<p align="center">Projeto acadêmico • RotaFlow • ENADE 2026</p>
