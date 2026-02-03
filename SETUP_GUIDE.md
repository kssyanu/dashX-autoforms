# DashX - Guia de Setup Completo

**Versão:** 1.0
**Data:** 02 de Fevereiro de 2026
**Tempo Estimado:** 2-3 horas

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup Supabase](#setup-supabase)
3. [Setup N8N Self-Hosted](#setup-n8n-self-hosted)
4. [Configuração OAuth Apps](#configuração-oauth-apps)
5. [Setup Projeto Next.js](#setup-projeto-nextjs)
6. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
7. [Execução e Testes](#execução-e-testes)
8. [Troubleshooting](#troubleshooting)

---

## 1. Pré-requisitos

### 1.1 Ferramentas Necessárias

```bash
# Node.js (versão 20.x ou superior)
node --version  # Deve retornar v20.x.x ou superior

# npm (versão 10.x ou superior)
npm --version

# Git
git --version

# Editor de código (recomendado: VS Code)
```

### 1.2 Contas Necessárias

- ✅ [Supabase](https://supabase.com) - Conta gratuita
- ✅ [Vercel](https://vercel.com) - Conta gratuita (para deploy)
- ✅ [GitHub](https://github.com) - Para versionamento
- ✅ Meta Developers Account (já tem ✓)
- ✅ Google Cloud Account (já tem ✓)

### 1.3 Infraestrutura

- ✅ **VPS com N8N self-hosted** (já configurado)
  - RAM mínima: 2GB
  - Disco: 10GB
  - Sistema: Ubuntu 20.04+ ou Debian
  - Docker instalado
  - SSL certificate válido (Let's Encrypt)
  - IP estático (para webhooks)

---

## 2. Setup Supabase

### 2.1 Criar Projeto

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Preencha:
   - **Organization:** Selecione ou crie uma
   - **Name:** `dashx-production` (ou `dashx-dev` para desenvolvimento)
   - **Database Password:** Gere uma senha forte (guarde em local seguro)
   - **Region:** `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan:** Free tier (para MVP)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos enquanto o projeto é provisionado

### 2.2 Anotar Credenciais

Após criação, vá em **Settings > API**:

```bash
# ANOTAR ESTAS INFORMAÇÕES:

# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# anon public (API Key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role (SECRET - NUNCA COMMITAR)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:**
- `anon key` pode ser exposta no frontend
- `service_role key` deve ficar APENAS no backend (N8N)

### 2.3 Configurar Autenticação

1. Vá em **Authentication > Providers**
2. Habilite **Email**:
   - ✅ Enable Email provider
   - ✅ Confirm email (desabilitar para MVP, habilitar em produção)
   - ✅ Secure email change
   - ✅ Secure password change

3. Configure **Email Templates** (opcional):
   - Customize "Confirm signup"
   - Customize "Reset password"

### 2.4 Criar Database Schema

1. Vá em **SQL Editor**
2. Clique em **"New query"**
3. Cole o conteúdo de `supabase/migrations/20260101_initial_schema.sql`
4. Clique em **"Run"**

**Arquivo: `supabase/migrations/20260101_initial_schema.sql`**

```sql
-- ============================================
-- DashX - Initial Database Schema
-- Version: 1.0
-- Date: 2026-02-02
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  organization_id UUID, -- NULL no MVP, FK em Phase 3
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para multi-tenant (futuro)
CREATE INDEX idx_profiles_org ON profiles(organization_id)
  WHERE organization_id IS NOT NULL;

-- Trigger para criar profile automaticamente ao criar user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PLATFORM CREDENTIALS (OAuth Tokens)
-- ============================================
CREATE TABLE platform_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID, -- Multi-tenant ready

  platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'google')),
  account_id VARCHAR(255) NOT NULL,
  account_name VARCHAR(255),

  -- Encrypted tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  sync_error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform, account_id)
);

CREATE INDEX idx_credentials_user_platform ON platform_credentials(user_id, platform);
CREATE INDEX idx_credentials_active ON platform_credentials(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_credentials_org ON platform_credentials(organization_id) WHERE organization_id IS NOT NULL;

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID,
  credential_id UUID REFERENCES platform_credentials(id) ON DELETE SET NULL,

  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('meta_ads', 'google_ads', 'combined', 'instagram_organic')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  campaign_objective VARCHAR(100), -- 'conversions', 'leads', 'engagement', null = all

  summary_metrics JSONB NOT NULL DEFAULT '{}',
  -- Exemplo: {"total_spend": 5200.50, "total_impressions": 850000, "avg_ctr": 2.18}

  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,

  is_automated BOOLEAN DEFAULT false,
  automation_id UUID, -- FK to automation_schedules (Phase 2)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: end date must be after start date
  CONSTRAINT valid_date_range CHECK (period_end >= period_start),
  -- Constraint: max 365 days range
  CONSTRAINT max_date_range CHECK (period_end - period_start <= 365)
);

CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_status ON reports(status) WHERE status != 'completed';
CREATE INDEX idx_reports_org ON reports(organization_id, created_at DESC) WHERE organization_id IS NOT NULL;

-- ============================================
-- CAMPAIGN DATA (Historical Metrics)
-- ============================================
CREATE TABLE campaign_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID,
  credential_id UUID NOT NULL REFERENCES platform_credentials(id) ON DELETE CASCADE,

  platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'google')),
  campaign_id VARCHAR(255) NOT NULL,
  campaign_name VARCHAR(255),
  campaign_objective VARCHAR(100),

  date DATE NOT NULL,

  -- Core metrics
  impressions BIGINT DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend NUMERIC(12, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_value NUMERIC(12, 2) DEFAULT 0,

  -- Calculated metrics (computed on insert/update)
  ctr NUMERIC(5, 2), -- Click-through rate
  cpc NUMERIC(10, 2), -- Cost per click
  cpm NUMERIC(10, 2), -- Cost per 1000 impressions
  cpl NUMERIC(10, 2), -- Cost per lead
  roas NUMERIC(10, 2), -- Return on ad spend

  -- Raw API response (for debugging and advanced queries)
  raw_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform, campaign_id, date)
);

CREATE INDEX idx_campaign_data_user_date ON campaign_data(user_id, date DESC);
CREATE INDEX idx_campaign_data_platform ON campaign_data(platform);
CREATE INDEX idx_campaign_data_campaign ON campaign_data(campaign_id, date DESC);
CREATE INDEX idx_campaign_data_org ON campaign_data(organization_id, date DESC) WHERE organization_id IS NOT NULL;

-- ============================================
-- FUNCTIONS - Metric Calculations
-- ============================================

-- Calculate CTR (Click-Through Rate)
CREATE OR REPLACE FUNCTION calculate_ctr(p_clicks INTEGER, p_impressions BIGINT)
RETURNS NUMERIC(5, 2) AS $$
BEGIN
  IF p_impressions = 0 OR p_impressions IS NULL THEN RETURN 0; END IF;
  RETURN ROUND((p_clicks::NUMERIC / p_impressions) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate CPC (Cost Per Click)
CREATE OR REPLACE FUNCTION calculate_cpc(p_spend NUMERIC, p_clicks INTEGER)
RETURNS NUMERIC(10, 2) AS $$
BEGIN
  IF p_clicks = 0 OR p_clicks IS NULL THEN RETURN 0; END IF;
  RETURN ROUND(p_spend / p_clicks, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate CPM (Cost Per Mille / 1000 impressions)
CREATE OR REPLACE FUNCTION calculate_cpm(p_spend NUMERIC, p_impressions BIGINT)
RETURNS NUMERIC(10, 2) AS $$
BEGIN
  IF p_impressions = 0 OR p_impressions IS NULL THEN RETURN 0; END IF;
  RETURN ROUND((p_spend / p_impressions) * 1000, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate CPL (Cost Per Lead)
CREATE OR REPLACE FUNCTION calculate_cpl(p_spend NUMERIC, p_conversions INTEGER)
RETURNS NUMERIC(10, 2) AS $$
BEGIN
  IF p_conversions = 0 OR p_conversions IS NULL THEN RETURN 0; END IF;
  RETURN ROUND(p_spend / p_conversions, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate ROAS (Return On Ad Spend)
CREATE OR REPLACE FUNCTION calculate_roas(p_conversion_value NUMERIC, p_spend NUMERIC)
RETURNS NUMERIC(10, 2) AS $$
BEGIN
  IF p_spend = 0 OR p_spend IS NULL THEN RETURN 0; END IF;
  RETURN ROUND(p_conversion_value / p_spend, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TRIGGER - Auto-calculate metrics on insert/update
-- ============================================
CREATE OR REPLACE FUNCTION auto_calculate_metrics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ctr := calculate_ctr(NEW.clicks, NEW.impressions);
  NEW.cpc := calculate_cpc(NEW.spend, NEW.clicks);
  NEW.cpm := calculate_cpm(NEW.spend, NEW.impressions);
  NEW.cpl := calculate_cpl(NEW.spend, NEW.conversions);
  NEW.roas := calculate_roas(NEW.conversion_value, NEW.spend);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_metrics
  BEFORE INSERT OR UPDATE ON campaign_data
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_metrics();

-- ============================================
-- UPDATED_AT Trigger (for all tables)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON platform_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Development Only)
-- ============================================
-- Uncomment for development environment

-- INSERT INTO profiles (id, email, full_name) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'dev@excalibur.com', 'Dev User');

-- ============================================
-- RLS (Row Level Security) - Phase 3
-- ============================================
-- To be enabled in Phase 3 (Multi-tenant)

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_data ENABLE ROW LEVEL SECURITY;

-- Example policy (to be created later):
-- CREATE POLICY "Users can only see their own data"
--   ON reports FOR SELECT
--   USING (user_id = auth.uid());

-- ============================================
-- GRANTS (Permissions)
-- ============================================
-- Ensure service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Anon role (frontend) has limited access
GRANT SELECT, INSERT, UPDATE ON profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON platform_credentials TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reports TO anon, authenticated;
GRANT SELECT ON campaign_data TO anon, authenticated;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE platform_credentials IS 'OAuth credentials for Meta Ads and Google Ads';
COMMENT ON TABLE reports IS 'Generated reports with aggregated metrics';
COMMENT ON TABLE campaign_data IS 'Historical campaign metrics by day';

COMMENT ON COLUMN platform_credentials.access_token IS 'Encrypted OAuth access token (AES-256-GCM)';
COMMENT ON COLUMN campaign_data.raw_data IS 'Raw API response in JSONB format for debugging';

-- ============================================
-- END OF MIGRATION
-- ============================================
```

5. Verifique se todas as tabelas foram criadas:
   - Vá em **Table Editor**
   - Deve ver: `profiles`, `platform_credentials`, `reports`, `campaign_data`

### 2.5 Configurar Storage (para PDFs)

1. Vá em **Storage**
2. Clique em **"New bucket"**
3. Configure:
   - **Name:** `reports`
   - **Public bucket:** ❌ (privado)
   - **File size limit:** 50MB
4. Clique em **"Create bucket"**

5. Configurar políticas de acesso:

```sql
-- Permitir usuários autenticados fazerem upload de PDFs
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir usuários verem apenas seus próprios PDFs
CREATE POLICY "Users can view their own PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 3. Setup N8N Self-Hosted

### 3.1 Verificar Instalação Existente

Você já tem N8N self-hosted. Verifique se está rodando:

```bash
# SSH na VPS
ssh user@seu-vps.com

# Verificar container N8N
docker ps | grep n8n

# Deve retornar algo como:
# abc123def456   n8nio/n8n:latest   ...   Up 5 days   0.0.0.0:5678->5678/tcp
```

### 3.2 Anotar Informações N8N

```bash
# URL do N8N (com SSL)
N8N_BASE_URL=https://n8n.seu-dominio.com

# Webhook base URL
N8N_WEBHOOK_URL=https://n8n.seu-dominio.com/webhook

# N8N API Key (gerar no N8N UI)
# Vá em: Settings > API > Create API Key
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.3 Configurar Variáveis de Ambiente N8N

```bash
# Editar docker-compose.yml ou .env do N8N
nano /path/to/n8n/docker-compose.yml
```

Adicionar variáveis de ambiente:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:2.4.7  # ou versão mais recente
    restart: always
    ports:
      - "5678:5678"
    environment:
      # N8N Configuration
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.seu-dominio.com/

      # Timezone
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo

      # Executions
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

      # DashX - Supabase
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

      # DashX - Meta
      - META_APP_ID=${META_APP_ID}
      - META_APP_SECRET=${META_APP_SECRET}

      # DashX - Google
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

      # DashX - Encryption
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}

      # DashX - Next.js Callback
      - NEXTJS_BASE_URL=${NEXTJS_BASE_URL}

    volumes:
      - ./n8n_data:/home/node/.n8n
      - /etc/localtime:/etc/localtime:ro
```

Criar arquivo `.env`:

```bash
# N8N Authentication
N8N_USER=admin
N8N_PASSWORD=senha_forte_aqui
N8N_HOST=n8n.seu-dominio.com

# Supabase
SUPABASE_URL=https://abcdefg.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Meta
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456...

# Google
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# Encryption (gerar com: openssl rand -hex 32)
ENCRYPTION_KEY=64_caracteres_hexadecimais_aqui

# Next.js
NEXTJS_BASE_URL=https://dashx.seu-dominio.com
```

### 3.4 Gerar Encryption Key

```bash
# Gerar chave de 32 bytes (64 caracteres hex)
openssl rand -hex 32

# Exemplo de output:
# f3d8e9a2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0
```

Copie e cole no arquivo `.env` em `ENCRYPTION_KEY`.

### 3.5 Reiniciar N8N

```bash
# Parar N8N
docker-compose down

# Iniciar com novas variáveis
docker-compose up -d

# Ver logs
docker-compose logs -f n8n
```

### 3.6 Verificar N8N UI

1. Acesse `https://n8n.seu-dominio.com`
2. Login com credenciais do `.env`
3. Vá em **Settings > API**
4. Gere uma **API Key** se ainda não tiver
5. Anote a API key

---

## 4. Configuração OAuth Apps

### 4.1 Meta App (Facebook Developers)

Você já tem Meta App verificado. Apenas verifique as configurações:

1. Acesse [https://developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Selecione seu app
3. Vá em **App Settings > Basic**

**Anotar:**
```bash
META_APP_ID=1234567890123456
META_APP_SECRET=abcdef1234567890...
```

4. Vá em **Products > Marketing API > Tools**
5. Verifique **Permissions**:
   - ✅ `ads_read`
   - ✅ `ads_management`

6. Configurar **OAuth Redirect URIs**:
   - Vá em **App Settings > Basic**
   - Em **App Domains**, adicione: `n8n.seu-dominio.com`
   - Vá em **Products > Facebook Login > Settings**
   - Em **Valid OAuth Redirect URIs**, adicione:
     ```
     https://n8n.seu-dominio.com/webhook/oauth/meta/callback
     ```
   - Salve alterações

### 4.2 Google Cloud Project

Você já tem Google Cloud configurado. Verifique:

1. Acesse [https://console.cloud.google.com](https://console.cloud.google.com)
2. Selecione seu projeto
3. Vá em **APIs & Services > Credentials**

**Anotar:**
```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...
```

4. Clique na credencial OAuth 2.0
5. Em **Authorized redirect URIs**, adicione:
   ```
   https://n8n.seu-dominio.com/webhook/oauth/google/callback
   ```

6. Verificar que **Google Ads API** está habilitada:
   - Vá em **APIs & Services > Enabled APIs & Services**
   - Procure por "Google Ads API"
   - Se não estiver habilitada, vá em **+ ENABLE APIS AND SERVICES**
   - Procure "Google Ads API" e habilite

---

## 5. Setup Projeto Next.js

### 5.1 Criar Repositório Git

```bash
# Criar repositório no GitHub
# Vá em: https://github.com/new
# Nome: dashx
# Visibility: Private
# Initialize: ❌ (vamos fazer manualmente)

# Clonar localmente
cd ~/projetos
mkdir dashx
cd dashx
git init
git remote add origin https://github.com/seu-usuario/dashx.git
```

### 5.2 Inicializar Projeto Next.js

```bash
# Criar projeto
npx create-next-app@latest . --typescript --tailwind --app --use-npm

# Responder:
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use `src/` directory? … No
# ✔ Would you like to use App Router? … Yes
# ✔ Would you like to customize the default import alias (@/*)? … No
```

### 5.3 Instalar Dependências

```bash
# Core dependencies
npm install @supabase/supabase-js@latest
npm install @tanstack/react-query@latest
npm install zustand@latest

# UI & Forms
npm install react-hook-form@latest
npm install zod@latest
npm install @hookform/resolvers@latest

# Charts
npm install recharts@latest

# PDF Generation
npm install @react-pdf/renderer@latest

# Date handling
npm install date-fns@latest

# Icons
npm install lucide-react@latest

# Dev dependencies
npm install -D @types/node@latest
npm install -D prettier@latest
npm install -D eslint-config-prettier@latest
```

### 5.4 Setup shadcn/ui

```bash
# Inicializar shadcn/ui
npx shadcn-ui@latest init

# Responder:
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Zinc
# ✔ Would you like to use CSS variables for colors? › Yes

# Instalar componentes necessários
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
```

### 5.5 Criar Estrutura de Pastas

```bash
# Criar diretórios
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/signup
mkdir -p app/\(dashboard\)/reports/new
mkdir -p app/\(dashboard\)/reports/\[id\]
mkdir -p app/\(dashboard\)/accounts/connect/\[platform\]
mkdir -p app/\(dashboard\)/settings
mkdir -p app/api/auth
mkdir -p app/api/reports/generate
mkdir -p app/api/sync/\[platform\]
mkdir -p app/api/connect/\[platform\]
mkdir -p components/dashboard
mkdir -p components/layout
mkdir -p lib/db/queries
mkdir -p lib/n8n
mkdir -p lib/hooks
mkdir -p lib/utils
mkdir -p supabase/migrations
mkdir -p n8n/workflows
```

---

## 6. Configuração de Variáveis de Ambiente

### 6.1 Criar `.env.local`

```bash
# Na raiz do projeto Next.js
touch .env.local
```

**Arquivo: `.env.local`**

```bash
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# N8N
# ============================================
N8N_WEBHOOK_URL=https://n8n.seu-dominio.com/webhook
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gerar_com_openssl_rand_base64_32

# Gerar com: openssl rand -base64 32
# Exemplo: abc123def456ghi789jkl012mno345pqr678stu901vwx234yz=

# ============================================
# META (Facebook)
# ============================================
META_APP_ID=1234567890123456
META_APP_SECRET=abcdef1234567890...

# ============================================
# GOOGLE
# ============================================
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# ============================================
# ENCRYPTION
# ============================================
# Mesma chave usada no N8N
ENCRYPTION_KEY=64_caracteres_hexadecimais_aqui

# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=development
```

### 6.2 Criar `.env.example`

```bash
cp .env.local .env.example
```

Edite `.env.example` e substitua valores reais por placeholders:

```bash
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# N8N
N8N_WEBHOOK_URL=https://n8n.your-domain.com/webhook
N8N_API_KEY=n8n_api_key_here

# NEXTAUTH
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# META
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# GOOGLE
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ENCRYPTION
ENCRYPTION_KEY=generate_with_openssl_rand_hex_32
```

### 6.3 Atualizar `.gitignore`

```bash
# Adicionar ao .gitignore
cat >> .gitignore << 'EOF'

# Environment variables
.env
.env.local
.env.*.local
.env.production

# Supabase
supabase/.temp

# N8N workflows (optional - pode versionar se quiser)
# n8n/workflows/*.json

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
```

---

## 7. Execução e Testes

### 7.1 Iniciar Desenvolvimento

```bash
# No diretório do projeto
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 7.2 Verificar Conexão Supabase

Criar arquivo de teste:

**Arquivo: `lib/db/client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (com service role)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**Arquivo: `app/api/test/supabase/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db/client'

export async function GET() {
  try {
    // Test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Supabase connected successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

Teste:
```bash
curl http://localhost:3000/api/test/supabase
```

Deve retornar:
```json
{
  "success": true,
  "message": "Supabase connected successfully",
  "timestamp": "2026-02-02T10:30:00.000Z"
}
```

### 7.3 Verificar Conexão N8N

**Arquivo: `lib/n8n/client.ts`**

```typescript
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!
const N8N_API_KEY = process.env.N8N_API_KEY!

export async function callN8NWebhook(
  path: string,
  body: any
): Promise<any> {
  const url = `${N8N_WEBHOOK_URL}/${path}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${N8N_API_KEY}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`N8N error: ${response.statusText}`)
  }

  return response.json()
}
```

**Arquivo: `app/api/test/n8n/route.ts`**

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.N8N_WEBHOOK_URL}/health`, {
      method: 'GET'
    })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'N8N is reachable'
      })
    }

    throw new Error('N8N not responding')
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

Teste:
```bash
curl http://localhost:3000/api/test/n8n
```

### 7.4 Commit Inicial

```bash
# Adicionar arquivos
git add .

# Commit
git commit -m "chore: initial project setup

- Next.js 14 with TypeScript
- Supabase integration
- shadcn/ui components
- Database schema created
- Environment variables configured"

# Push
git push -u origin main
```

---

## 8. Troubleshooting

### 8.1 Erro: "Supabase connection failed"

**Problema:** Não consegue conectar ao Supabase

**Soluções:**
1. Verifique se as variáveis de ambiente estão corretas:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. Teste conexão manual:
   ```bash
   curl https://seu-projeto.supabase.co/rest/v1/
   ```

3. Verifique firewall/VPN

### 8.2 Erro: "N8N webhook not found"

**Problema:** Webhook retorna 404

**Soluções:**
1. Verifique se N8N está rodando:
   ```bash
   docker ps | grep n8n
   ```

2. Verifique URL do webhook no N8N UI

3. Teste webhook manualmente:
   ```bash
   curl -X POST https://n8n.seu-dominio.com/webhook/test \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### 8.3 Erro: "OAuth redirect mismatch"

**Problema:** Erro no fluxo OAuth

**Soluções:**
1. Verifique redirect URIs no Meta/Google:
   - Deve ser exatamente: `https://n8n.seu-dominio.com/webhook/oauth/meta/callback`

2. Verifique se SSL está ativo (HTTPS obrigatório)

3. Verifique logs do N8N:
   ```bash
   docker logs -f n8n_container_name
   ```

### 8.4 Erro: "Database migration failed"

**Problema:** Erro ao rodar migration SQL

**Soluções:**
1. Verifique syntax errors no SQL
2. Execute migration em partes (uma tabela por vez)
3. Verifique se `uuid-ossp` extension está habilitada:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

### 8.5 Erro: "npm install failed"

**Problema:** Dependências não instalam

**Soluções:**
1. Limpar cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Atualizar npm:
   ```bash
   npm install -g npm@latest
   ```

3. Usar Node.js 20.x:
   ```bash
   nvm install 20
   nvm use 20
   ```

---

## 🎉 Próximos Passos

Após completar este setup, você terá:

- ✅ Supabase configurado com database schema
- ✅ N8N self-hosted pronto para workflows
- ✅ OAuth apps configuradas (Meta + Google)
- ✅ Projeto Next.js inicializado
- ✅ Variáveis de ambiente configuradas
- ✅ Repositório Git criado

**Próximo documento:** [N8N_WORKFLOWS.md](N8N_WORKFLOWS.md) - Implementação dos workflows

---

**Tempo estimado total:** 2-3 horas
**Dificuldade:** Intermediária
**Última atualização:** 02/02/2026
