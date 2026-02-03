# DashX - Marketing Intelligence Dashboard

Dashboard centralizado de inteligência de marketing para análise de campanhas Meta Ads e Google Ads com automações via N8N.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v3 + shadcn/ui
- **State Management**: Tanstack Query (server) + Zustand (client)
- **Backend**: Supabase (Auth + PostgreSQL + Realtime)
- **Automações**: N8N (self-hosted)
- **Charts**: Recharts

## Pré-requisitos

- Node.js 20+ e npm/yarn/pnpm
- Conta Supabase (free tier funciona)
- N8N self-hosted (VPS ou local)
- Meta App (com OAuth configurado)
- Google Cloud Project (com OAuth configurado)

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis de ambiente:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# N8N
N8N_WEBHOOK_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key

# Meta (Facebook)
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret

# Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar Supabase

Acesse o projeto no Supabase e execute o SQL do arquivo `SETUP_GUIDE.md` para criar:

- Tabelas: `profiles`, `platform_credentials`, `campaign_data`, `reports`
- Funções de cálculo de métricas (CTR, CPC, etc.)
- Triggers automáticos

### 4. Configurar N8N

Importe os workflows do arquivo `N8N_WORKFLOWS.md`:

1. Meta OAuth Connection
2. Meta Ads Data Sync
3. Google OAuth Connection
4. Google Ads Data Sync

Configure as credenciais no N8N conforme documentação.

### 5. Executar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
dashx/
├── app/
│   ├── (auth)/              # Páginas de autenticação
│   │   ├── login/
│   │   └── cadastro/
│   ├── (dashboard)/         # Páginas do dashboard
│   │   ├── dashboard/       # Página principal
│   │   ├── reports/         # Relatórios
│   │   ├── accounts/        # Contas conectadas
│   │   └── settings/        # Configurações
│   └── api/                 # API routes
│
├── components/
│   ├── auth/                # Componentes de auth
│   ├── dashboard/           # Componentes do dashboard
│   ├── layout/              # Sidebar, Header
│   └── ui/                  # shadcn/ui components
│
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── n8n/                 # N8N integration
│   └── utils.ts             # Utilities
│
└── hooks/                   # Custom React hooks
```

## Documentação Completa

- [PRD.md](./PRD.md) - Product Requirements Document
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Guia completo de setup
- [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md) - Workflows N8N detalhados
- [FEASIBILITY_ANALYSIS.md](./FEASIBILITY_ANALYSIS.md) - Análise de viabilidade

## Features MVP

- ✅ Autenticação com Supabase
- ✅ Dashboard com KPI cards
- ✅ Layout com Sidebar e Header
- 🚧 Integração OAuth Meta Ads
- 🚧 Integração OAuth Google Ads
- 🚧 Sincronização de dados via N8N
- 🚧 Geração de relatórios
- 🚧 Exportação de PDF

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção
npm run start

# Lint
npm run lint
```

## Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outros hosts

O projeto é compatível com qualquer host que suporte Next.js 14:

- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## Suporte

Para dúvidas e issues, consulte a documentação ou abra uma issue no repositório.

## Licença

Privado - Todos os direitos reservados
