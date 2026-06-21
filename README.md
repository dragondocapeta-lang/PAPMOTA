# FORA DO RADAR

**Descobre clubes de futebol que o mundo ainda não conhece**

Um projeto web completo para descobrir e explorar clubes de futebol de países pouco conhecidos ou com pouca visibilidade mediática.

## Sobre o Projeto

FORA DO RADAR é uma plataforma que permite descobrir clubes de futebol de todo o mundo, especialmente aqueles que não recebem a atenção mediática que merecem. Desde clubes europeus em pequenos países até equipas africanas com histria fascinantes.

## Tecnologias Utilizadas

- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Design moderno, responsivo e com animações subtis
- **JavaScript Vanilla** - Sem frameworks, código puro e organizado
- **Supabase** - Base de dados PostgreSQL e autenticação
- **Vite** - Build tool moderna e rápida

## Estrutura do Projeto

```
/fora-do-radar
│
├── index.html              # Página inicial
│
├── pages/
│   ├── paises.html         # Lista de países
│   ├── ligas.html          # Ligas de um país
│   ├── clubes.html        # Clubes de uma liga
│   ├── clube.html          # Detalhes do clube
│   ├── login.html          # Login
│   ├── register.html       # Registo
│   ├── forgot-password.html # Recuperação de password
│   └── update-password.html # Atualizar password
│
├── css/
│   ├── style.css           # Estilos globais
│   ├── auth.css            # Estilos de autenticação
│   ├── paises.css          # Estilos da página de países
│   ├── ligas.css           # Estilos da página de ligas
│   ├── clubes.css          # Estilos da página de clubes
│   └── clube.css           # Estilos da página do clube
│
├── js/
│   ├── main.js             # Script principal
│   ├── supabase.js         # Configuração do Supabase
│   ├── auth.js             # Sistema de autenticação
│   ├── paises.js           # Lógica da página de países
│   ├── ligas.js            # Lógica da página de ligas
│   ├── clubes.js           # Lógica da página de clubes
│   └── clube.js            # Lógica da página do clube
│
└── README.md
```

## Base de Dados

### Tabelas

#### `continentes`
- `id` - Identificador único
- `nome` - Nome do continente

#### `paises`
- `id` - Identificador único
- `nome` - Nome do país
- `bandeira` - Emoji da bandeira
- `continente_id` - Referência ao continente

#### `ligas`
- `id` - Identificador único
- `nome` - Nome da liga
- `pais_id` - Referência ao país

#### `clubes`
- `id` - Identificador único
- `nome` - Nome do clube
- `escudo` - Emoji/símbolo do escudo
- `fundacao` - Ano de fundação
- `estadio` - Nome do estádio
- `cidade` - Cidade
- `descricao` - Descrição do clube
- `liga_id` - Referncia à liga

#### `perfis`
- `id` - UUID (referência ao utilizador)
- `nome` - Nome do utilizador
- `email` - Email do utilizador
- `criado_em` - Data de criação

## Funcionalidades

### Navegação
- Exploração por países, ligas e clubes
- Filtros por continente
- Sistema de pesquisa global
- Breadcrumbs para navegação fácil

### Autenticação
- Registo de novos utilizadores
- Login com email e password
- Recuperação de password
- Perfis de utilizador

### Segurança
- Validação de formulários
- Sanitização de inputs
- Proteção contra XSS
- Row Level Security (RLS) no Supabase

### Design
- Tema escuro com tons de azul e verde neon
- Layout responsivo (mobile-first)
- Animações e micro-interações
- Loading skeletons

## Como Executar Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório ou descarregue os ficheiros

2. Instale as dependncias:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra o navegador em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os ficheiros serão gerados na pasta `dist/`.

## Configuração do Supabase

As credenciais do Supabase são configuradas automaticamente no ambiente de desenvolvimento.

Se quiser configurar manualmente, crie um ficheiro `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Criar Tabelas

As tabelas são criadas automaticamente através das migrações SQL incluídas no projeto. As migraçes criam:
- Estrutura completa da base de dados
- Relacionamentos entre tabelas
- Políticas de segurança (RLS)
- Dados iniciais (continentes, países, ligas e clubes)
- Trigger para criar perfis automaticamente

## Aprender com o Projeto

Este projeto foi criado com objectivo educacional. Cada ficheiro contém comentários detalhados explicando:

- O propósito de cada ficheiro
- Como cada função funciona
- A ligação com o Supabase
- A estrutura da base de dados
- Boas práticas de programação

## Dados Incluídos

O projeto inclui dados reais de:
- 6 continentes
- 35 países
- 38 ligas
- 50+ clubes

Todos os clubes incluídos existem na vida real e representam clubes menos conhecidos de diversos cantos do mundo.

## Contribuir

Sinta-se à vontade para contribuir com:
- Mais clubes
- Correções de dados
- Melhorias no código
- Traduções
- Sugestões

## Licença

MIT License - Sinta-se livre para usar e modificar.

---

**FORA DO RADAR** - Descobre clubes que o mundo ainda não conhece
