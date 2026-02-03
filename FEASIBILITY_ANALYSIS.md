# Análise de Viabilidade - DashX Marketing Dashboard

**Data:** 31 de Janeiro de 2026
**Versão:** 1.0
**Status:** Análise Inicial

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Objetivo Principal
Painel administrativo para gestão de relatórios de marketing digital com integração nativa com Meta Ads e Google Ads, utilizando N8N como backend de automação e APIs.

### 1.2 Proposta de Valor
- **Automatização de Relatórios:** Eliminação de processos manuais de coleta de dados
- **Centralização de Dados:** Unificação de métricas de múltiplas plataformas
- **Escalabilidade:** Arquitetura preparada para crescimento de usuários
- **Personalização:** Relatórios customizáveis por período e objetivo de campanha

---

## 2. ANÁLISE DE VIABILIDADE TÉCNICA

### 2.1 Viabilidade: ✅ ALTA (85%)

#### 2.1.1 Pontos Fortes
- **N8N é ideal para este caso de uso:**
  - Conectores nativos para Meta Ads API e Google Ads API
  - Webhooks para comunicação frontend-backend
  - Suporte a cron jobs para automações programadas
  - Interface visual para criação de fluxos
  - Suporte a autenticação OAuth2
  - Possibilidade de exportar/importar workflows via JSON

- **Frontend moderno pode consumir N8N facilmente:**
  - N8N expõe endpoints REST e webhooks
  - Autenticação via API keys ou tokens
  - Possibilidade de criar APIs personalizadas

- **APIs das plataformas são maduras:**
  - Meta Marketing API bem documentada
  - Google Ads API com SDKs oficiais
  - Instagram Graph API para dados orgânicos

#### 2.1.2 Desafios Identificados

**🔴 CRÍTICO - Configuração Automática de Fluxos N8N**
- **Problema:** N8N não foi projetado para ser configurado programaticamente pelo frontend
- **Risco:** Alto - Esta funcionalidade pode ser complexa ou inviável
- **Alternativas:**
  1. **Workflows Pré-configurados (RECOMENDADO):**
     - Criar templates de workflows no N8N
     - Frontend apenas ativa/desativa e parametriza workflows existentes
     - Usuário configura credenciais no N8N uma vez

  2. **N8N API (Parcial):**
     - N8N expõe API REST para gerenciar workflows
     - Frontend pode criar/atualizar workflows via API
     - Requer autenticação e permissões adequadas
     - Documentação: https://docs.n8n.io/api/

  3. **Híbrido:**
     - Templates base no N8N
     - Frontend faz clonagem e parametrização via API

**🟡 MODERADO - Limitações de Rate Limit**
- Meta Ads API: 200 chamadas/hora por usuário (pode ser aumentado)
- Google Ads API: 15.000 operações/dia (tier básico)
- Instagram Graph API: 200 chamadas/hora
- **Solução:** Implementar cache e agregação de dados no N8N

**🟡 MODERADO - Autenticação Multi-Plataforma**
- Requer OAuth2 para Meta e Google
- Tokens precisam ser renovados periodicamente
- **Solução:** N8N gerencia tokens, frontend apenas inicia fluxo de autenticação

**🟢 BAIXO - Armazenamento de Dados**
- N8N não é um banco de dados
- Dados históricos precisam ser armazenados externamente
- **Solução:** Integrar com PostgreSQL ou MongoDB via N8N

---

## 3. ARQUITETURA PROPOSTA

### 3.1 Stack Tecnológico Recomendado

#### **Frontend**
```
Framework: Next.js 14+ (App Router)
Linguagem: TypeScript
UI Library: shadcn/ui + Tailwind CSS
Charts: Recharts ou Chart.js
State Management: Zustand ou React Context
API Client: Axios ou fetch nativo
Autenticação: NextAuth.js (para sessões de usuário)
```

**Justificativa:**
- Next.js oferece SSR/SSG para performance
- TypeScript para segurança de tipos
- shadcn/ui para componentes consistentes e customizáveis
- NextAuth.js facilita OAuth com Meta/Google

#### **Backend (N8N)**
```
Plataforma: N8N (self-hosted ou cloud)
Banco de Dados: PostgreSQL (para dados do N8N e histórico)
Cache: Redis (opcional, para rate limiting)
Storage: AWS S3 ou Cloudflare R2 (para relatórios PDF/Excel)
```

**Justificativa:**
- N8N elimina necessidade de backend tradicional
- PostgreSQL armazena dados históricos e configurações
- S3/R2 para armazenamento escalável de relatórios

#### **Integrações**
```
Meta Marketing API v19.0+
Google Ads API v15+
Instagram Graph API
N8N REST API
Webhook endpoints
```

### 3.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Reports    │  │   Settings   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  API Layer     │                        │
│                    │  (Axios/Fetch) │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   API Gateway    │
                    │  (N8N Webhooks)  │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  Meta Ads API  │  │ Google Ads API  │  │ Instagram API  │
└────────────────┘  └─────────────────┘  └────────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │       N8N        │
                    │   Workflows      │
                    │  ┌────────────┐  │
                    │  │ Workflow 1 │  │ ← Crescimento Instagram
                    │  │ Workflow 2 │  │ ← Relatório Meta Ads
                    │  │ Workflow 3 │  │ ← Relatório Google Ads
                    │  │ Workflow 4 │  │ ← Leads WhatsApp
                    │  └────────────┘  │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  PostgreSQL    │  │     Redis       │  │    S3/R2       │
│  (Histórico)   │  │    (Cache)      │  │  (Reports)     │
└────────────────┘  └─────────────────┘  └────────────────┘
```

### 3.3 Fluxo de Dados

#### **Cenário 1: Geração Manual de Relatório**
```
1. Usuário acessa frontend → Seleciona "Relatório Meta Ads"
2. Frontend envia POST para webhook N8N com parâmetros:
   {
     "reportType": "meta_ads",
     "startDate": "2026-01-01",
     "endDate": "2026-01-31",
     "campaignObjective": "conversions"
   }
3. N8N recebe webhook → Executa workflow:
   a. Autentica com Meta Ads API usando credenciais salvas
   b. Busca dados de campanhas no período
   c. Processa e agrega métricas
   d. Salva dados no PostgreSQL
   e. Gera relatório PDF/Excel e salva no S3
   f. Retorna URL do relatório + resumo de métricas
4. Frontend recebe resposta → Exibe dashboard + link download
```

#### **Cenário 2: Relatório Automático Programado**
```
1. N8N cron trigger executa diariamente às 8h
2. Workflow busca lista de contas ativas no PostgreSQL
3. Para cada conta:
   a. Busca dados do dia anterior em todas as plataformas
   b. Calcula métricas (ROI, CPL, CTR, etc.)
   c. Salva no banco de dados
   d. Se houver alertas (ex: CPL > limite), envia notificação
4. Dados ficam disponíveis no frontend em tempo real
```

#### **Cenário 3: Configuração de Credenciais OAuth**
```
1. Usuário clica "Conectar Meta Ads" no frontend
2. Frontend redireciona para Meta OAuth:
   https://www.facebook.com/v19.0/dialog/oauth?
     client_id={app_id}&
     redirect_uri={n8n_callback}&
     scope=ads_read,ads_management
3. Usuário autoriza → Meta redireciona para N8N webhook
4. N8N recebe código de autorização → Troca por access_token
5. N8N salva token criptografado no PostgreSQL
6. N8N redireciona usuário de volta ao frontend com sucesso
```

---

## 4. ESTRUTURA DE DADOS

### 4.1 Banco de Dados PostgreSQL

#### **Tabela: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela: platform_credentials**
```sql
CREATE TABLE platform_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'meta', 'google', 'instagram'
  access_token TEXT NOT NULL, -- Criptografado
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  account_id VARCHAR(255), -- ID da conta de anúncios
  account_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id)
);
```

#### **Tabela: reports**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- 'meta_ads', 'google_ads', 'instagram_organic'
  report_name VARCHAR(255),
  campaign_objective VARCHAR(100), -- 'conversions', 'leads', 'engagement'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  metrics JSONB NOT NULL, -- { "impressions": 10000, "clicks": 500, "ctr": 5.0, ... }
  file_url TEXT, -- URL do PDF/Excel no S3
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  is_automated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela: campaign_data (dados históricos)**
```sql
CREATE TABLE campaign_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  campaign_id VARCHAR(255) NOT NULL,
  campaign_name VARCHAR(255),
  campaign_objective VARCHAR(100),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2), -- Click-through rate
  cpc DECIMAL(10, 2), -- Cost per click
  cpl DECIMAL(10, 2), -- Cost per lead
  roas DECIMAL(10, 2), -- Return on ad spend
  raw_data JSONB, -- Dados brutos da API
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform, campaign_id, date)
);

CREATE INDEX idx_campaign_data_user_date ON campaign_data(user_id, date DESC);
CREATE INDEX idx_campaign_data_platform ON campaign_data(platform);
```

#### **Tabela: automation_schedules**
```sql
CREATE TABLE automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workflow_id VARCHAR(255) NOT NULL, -- ID do workflow no N8N
  workflow_name VARCHAR(255) NOT NULL,
  schedule_cron VARCHAR(100) NOT NULL, -- Ex: '0 8 * * *' (diário às 8h)
  report_type VARCHAR(50) NOT NULL,
  campaign_objective VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela: instagram_organic_data**
```sql
CREATE TABLE instagram_organic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  instagram_account_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, instagram_account_id, date)
);
```

### 4.2 Estrutura de Workflows N8N

#### **Workflow 1: Instagram Organic Growth Report**
```json
{
  "name": "Instagram_Organic_Growth",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook Trigger",
      "webhookId": "instagram-organic-report",
      "parameters": {
        "path": "instagram-organic-report",
        "method": "POST"
      }
    },
    {
      "type": "n8n-nodes-base.instagram",
      "name": "Get Instagram Insights",
      "parameters": {
        "operation": "getInsights",
        "metrics": ["impressions", "reach", "profile_views", "follower_count"]
      }
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Save to Database",
      "parameters": {
        "operation": "insert",
        "table": "instagram_organic_data"
      }
    },
    {
      "type": "n8n-nodes-base.respondToWebhook",
      "name": "Return Response"
    }
  ]
}
```

#### **Workflow 2: Meta Ads Report by Date Range**
```json
{
  "name": "Meta_Ads_Custom_Report",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook Trigger",
      "parameters": {
        "path": "meta-ads-report"
      }
    },
    {
      "type": "n8n-nodes-base.facebookGraph",
      "name": "Get Campaign Insights",
      "parameters": {
        "resource": "insights",
        "fields": ["impressions", "clicks", "spend", "conversions"]
      }
    },
    {
      "type": "n8n-nodes-base.function",
      "name": "Calculate Metrics",
      "parameters": {
        "functionCode": "// Calcular CTR, CPC, ROAS, etc."
      }
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Save Report Data"
    },
    {
      "type": "n8n-nodes-base.googleDrive",
      "name": "Generate PDF Report"
    },
    {
      "type": "n8n-nodes-base.respondToWebhook",
      "name": "Return Report URL"
    }
  ]
}
```

---

## 5. FEATURES PRINCIPAIS E SECUNDÁRIAS

### 5.1 MVP (Minimum Viable Product) - Fase 1 (2-3 meses)

#### **Autenticação e Onboarding**
- [ ] Login com email/senha (NextAuth.js)
- [ ] Conectar conta Meta Ads (OAuth)
- [ ] Conectar conta Google Ads (OAuth)
- [ ] Conectar Instagram Business Account
- [ ] Dashboard de boas-vindas com checklist de setup

#### **Relatórios Manuais Básicos**
- [ ] Relatório de Meta Ads por data personalizada
- [ ] Relatório de Google Ads por data personalizada
- [ ] Visualização de métricas principais:
  - Impressões, Cliques, Gastos
  - CTR, CPC, Conversões
  - Comparação com período anterior
- [ ] Exportar relatório em PDF

#### **Dashboard Principal**
- [ ] Visão geral de todas as contas conectadas
- [ ] Gráficos de performance (últimos 7/30/90 dias)
- [ ] Métricas em cards (estilo KPI)
- [ ] Filtros por data e plataforma

#### **Infraestrutura N8N**
- [ ] Setup de N8N (self-hosted ou cloud)
- [ ] 3 workflows principais:
  1. Meta Ads Report
  2. Google Ads Report
  3. Instagram Organic Growth
- [ ] Webhook endpoints documentados
- [ ] Sistema de logs e error handling

### 5.2 Fase 2 - Automação e Objetivos (3-4 meses após MVP)

#### **Relatórios por Objetivo de Campanha**
- [ ] Filtro por objetivo: Conversões, Leads, Engajamento
- [ ] Métricas específicas por objetivo:
  - **E-commerce:** ROAS, AOV, Taxa de Conversão
  - **Leads WhatsApp:** CPL, Taxa de Resposta
  - **Leads Formulário:** CPL, Taxa de Preenchimento
  - **Engajamento:** Curtidas, Comentários, Compartilhamentos

#### **Automações Programadas**
- [ ] Configurar relatórios automáticos (diário/semanal/mensal)
- [ ] Notificações por email quando relatório estiver pronto
- [ ] Alertas de performance (ex: "CPL aumentou 30% esta semana")
- [ ] Dashboard de histórico de relatórios automatizados

#### **Crescimento Orgânico Instagram**
- [ ] Relatório de crescimento de seguidores
- [ ] Análise de engajamento por post
- [ ] Melhores horários para postar
- [ ] Hashtags mais efetivas

### 5.3 Fase 3 - Avançado e Escalabilidade (4-6 meses após Fase 2)

#### **Recursos Avançados**
- [ ] Comparação entre campanhas (A/B testing insights)
- [ ] Previsões de performance com ML básico
- [ ] Recomendações de otimização automáticas
- [ ] Templates de relatórios personalizáveis
- [ ] White-label (se for escalar para agências)

#### **Multi-usuário e Permissões**
- [ ] Sistema de times/workspaces
- [ ] Permissões granulares (admin, editor, viewer)
- [ ] Compartilhamento de relatórios via link
- [ ] Comentários e anotações em relatórios

#### **Integrações Extras**
- [ ] TikTok Ads
- [ ] LinkedIn Ads
- [ ] Twitter/X Ads
- [ ] Shopify (para dados de vendas)
- [ ] Google Analytics 4

---

## 6. DESAFIOS POTENCIAIS E MITIGAÇÕES

### 6.1 Desafios Técnicos

| Desafio | Severidade | Mitigação |
|---------|-----------|-----------|
| **Configuração Automática de N8N** | 🔴 ALTA | Usar workflows pré-configurados + N8N API para parametrização |
| **Rate Limits das APIs** | 🟡 MÉDIA | Implementar cache, agregação de dados e retry logic |
| **Renovação de Tokens OAuth** | 🟡 MÉDIA | N8N tem gerenciamento automático de tokens, implementar fallback manual |
| **Processamento de Grandes Volumes** | 🟡 MÉDIA | Processar dados em batches, usar Redis para filas |
| **Sincronização de Dados Históricos** | 🟢 BAIXA | Limitar importação inicial a 90 dias, processar em background |

### 6.2 Desafios de Produto

| Desafio | Severidade | Mitigação |
|---------|-----------|-----------|
| **Complexidade de Setup Inicial** | 🟡 MÉDIA | Criar wizard de onboarding intuitivo com vídeos explicativos |
| **Diferenças entre APIs** | 🟡 MÉDIA | Normalizar métricas no backend, documentar diferenças |
| **UX para Não-Técnicos** | 🟡 MÉDIA | Design minimalista, tooltips explicativos, templates prontos |
| **Escalabilidade de Custos (N8N)** | 🟢 BAIXA | N8N self-hosted é gratuito, cobrar por usuário no futuro |

### 6.3 Desafios de Negócio

| Desafio | Severidade | Mitigação |
|---------|-----------|-----------|
| **Dependência de N8N** | 🟡 MÉDIA | Documentar arquitetura, manter workflows versionados |
| **Mudanças nas APIs de Terceiros** | 🟡 MÉDIA | Monitorar changelogs, ter layer de abstração |
| **Competição com Ferramentas Existentes** | 🟢 BAIXA | Foco em automação e personalização (diferencial) |

---

## 7. SEGURANÇA E COMPLIANCE

### 7.1 Autenticação e Autorização

**Frontend:**
- NextAuth.js para sessões de usuário
- JWT tokens para comunicação com N8N
- HTTPS obrigatório (TLS 1.3)

**N8N:**
- API keys para autenticação de webhooks
- Whitelist de IPs (se self-hosted)
- Criptografia de credenciais OAuth no banco

**Fluxo de Autenticação:**
```
1. Usuário faz login no frontend (NextAuth)
2. Frontend recebe session token
3. Para chamar N8N, frontend inclui: Authorization: Bearer {JWT}
4. N8N valida JWT antes de processar webhook
```

### 7.2 Proteção de Dados Sensíveis

**Credenciais OAuth:**
```typescript
// Armazenar tokens criptografados no PostgreSQL
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = process.env.ENCRYPTION_KEY; // 32 bytes

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}
```

**Variáveis de Ambiente:**
```bash
# .env.production
DATABASE_URL=postgresql://user:pass@host/db
ENCRYPTION_KEY=<32-byte-random-key>
N8N_API_KEY=<n8n-api-key>
N8N_WEBHOOK_URL=https://n8n.seudominio.com
NEXTAUTH_SECRET=<nextauth-secret>
META_APP_ID=<facebook-app-id>
META_APP_SECRET=<facebook-app-secret>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

### 7.3 Compliance (LGPD/GDPR)

**Requisitos:**
- [ ] Política de Privacidade clara
- [ ] Termo de Uso explícito
- [ ] Consentimento para uso de dados de APIs
- [ ] Direito de exclusão de dados (LGPD Art. 18)
- [ ] Logs de acesso a dados sensíveis
- [ ] Criptografia de dados em trânsito e em repouso

**Dados Pessoais Coletados:**
- Email e nome do usuário
- Tokens de acesso (Meta/Google)
- IDs de contas de anúncios
- Histórico de relatórios gerados

**Retenção de Dados:**
- Relatórios: 12 meses
- Dados de campanhas: 6 meses
- Logs de acesso: 3 meses

---

## 8. ESTIMATIVAS E ROADMAP

### 8.1 Cronograma Sugerido

#### **Fase 1: MVP (8-12 semanas)**

**Semanas 1-2: Setup e Fundação**
- [ ] Setup Next.js + TypeScript
- [ ] Configurar PostgreSQL + Prisma ORM
- [ ] Setup N8N (self-hosted ou cloud)
- [ ] Design system (shadcn/ui + Tailwind)
- [ ] Autenticação básica (NextAuth)

**Semanas 3-4: Integrações OAuth**
- [ ] OAuth Meta Ads (workflow N8N)
- [ ] OAuth Google Ads (workflow N8N)
- [ ] OAuth Instagram (workflow N8N)
- [ ] Tela de gerenciamento de contas conectadas

**Semanas 5-7: Relatórios Manuais**
- [ ] Workflow N8N: Meta Ads Report
- [ ] Workflow N8N: Google Ads Report
- [ ] Frontend: Formulário de criação de relatório
- [ ] Frontend: Dashboard de visualização
- [ ] Geração de PDF básico

**Semanas 8-10: Dashboard e Métricas**
- [ ] Dashboard principal com KPIs
- [ ] Gráficos (Recharts)
- [ ] Filtros de data
- [ ] Comparação de períodos

**Semanas 11-12: Polish e Testes**
- [ ] Error handling e loading states
- [ ] Testes de integração
- [ ] Documentação de uso
- [ ] Deploy (Vercel + Railway/Render para N8N)

#### **Fase 2: Automação (8 semanas após MVP)**

**Semanas 1-2:**
- [ ] Sistema de agendamento (cron no N8N)
- [ ] Interface de configuração de automações
- [ ] Notificações por email

**Semanas 3-4:**
- [ ] Relatórios por objetivo de campanha
- [ ] Métricas específicas por objetivo
- [ ] Instagram organic growth report

**Semanas 5-6:**
- [ ] Sistema de alertas
- [ ] Dashboard de automações ativas
- [ ] Histórico de execuções

**Semanas 7-8:**
- [ ] Otimizações de performance
- [ ] Testes de carga
- [ ] Melhorias de UX

#### **Fase 3: Avançado (12 semanas após Fase 2)**

**Semanas 1-4:**
- [ ] Sistema multi-usuário (workspaces)
- [ ] Permissões granulares
- [ ] Templates de relatórios

**Semanas 5-8:**
- [ ] Comparação de campanhas
- [ ] Insights automáticos
- [ ] Recomendações de otimização

**Semanas 9-12:**
- [ ] Integrações extras (TikTok, LinkedIn)
- [ ] White-label (opcional)
- [ ] API pública (opcional)

### 8.2 Recursos Necessários

#### **Desenvolvimento (para MVP)**
- 1 Full-stack Developer (Next.js + N8N): 12 semanas
- 1 UI/UX Designer: 4 semanas (parcial)
- 1 QA Tester: 2 semanas (parcial)

#### **Infraestrutura (custos mensais)**
- **Hosting Frontend:** Vercel (grátis para hobby, ~$20/mês Pro)
- **N8N Hosting:**
  - Self-hosted: Railway/Render (~$15-30/mês)
  - N8N Cloud: $20-50/mês
- **Banco de Dados:** Supabase/Neon (grátis tier inicial, ~$10/mês depois)
- **Storage (S3/R2):** Cloudflare R2 (~$1-5/mês)
- **Total Estimado:** $50-100/mês (início)

#### **Custos de APIs**
- Meta Marketing API: Gratuita
- Google Ads API: Gratuita
- Instagram Graph API: Gratuita
- **Nota:** Apenas custos de infraestrutura

---

## 9. ANÁLISE DE ALTERNATIVAS

### 9.1 Alternativa 1: Backend Tradicional (NestJS/Express)

**Prós:**
- Controle total sobre lógica de negócio
- Melhor performance para operações complexas
- Mais fácil de testar unitariamente

**Contras:**
- Requer desenvolvimento de integrações do zero
- Maior tempo de desenvolvimento (~4-6 semanas extras)
- Mais código para manter
- Custos de infraestrutura maiores

**Veredicto:** ❌ Não recomendado (N8N é mais eficiente para este caso)

### 9.2 Alternativa 2: Zapier/Make (Low-code comercial)

**Prós:**
- Setup ainda mais rápido
- Integrações prontas
- Suporte comercial

**Contras:**
- Custos elevados ($300-1000/mês para automações)
- Vendor lock-in severo
- Limitações de customização
- Difícil de escalar

**Veredicto:** ❌ Não recomendado (inviável economicamente)

### 9.3 Alternativa 3: N8N + Backend Híbrido

**Prós:**
- N8N para integrações e automações
- Backend tradicional para lógica de negócio complexa
- Melhor separação de responsabilidades

**Contras:**
- Maior complexidade arquitetural
- Dois sistemas para manter

**Veredicto:** ⚠️ Considerar apenas se precisar de features muito customizadas

---

## 10. RECOMENDAÇÕES FINAIS

### 10.1 Abordagem Recomendada

**✅ USAR N8N + WORKFLOWS PRÉ-CONFIGURADOS**

**Razões:**
1. **Velocidade de Desenvolvimento:** MVP em 8-12 semanas vs 16-20 com backend tradicional
2. **Custo-Benefício:** Infraestrutura ~$100/mês vs $300-500/mês com backend full
3. **Manutenibilidade:** Workflows visuais são mais fáceis de debugar
4. **Escalabilidade:** N8N suporta milhares de execuções/dia

**Implementação:**
- Frontend gerencia UX e visualização de dados
- N8N gerencia integrações, OAuth e processamento de dados
- PostgreSQL armazena dados históricos
- Frontend consome N8N via webhooks REST

### 10.2 Decisões Críticas

**1. Configuração de Workflows N8N:**
- ❌ NÃO: Frontend cria workflows dinamicamente
- ✅ SIM: Templates pré-configurados no N8N
- ✅ SIM: Frontend parametriza workflows via API (datas, filtros, etc.)
- ✅ SIM: Usuário configura OAuth manualmente uma vez

**2. Armazenamento de Dados:**
- ✅ PostgreSQL para dados históricos e configurações
- ✅ S3/R2 para relatórios PDF/Excel
- ✅ N8N database para estado de execuções

**3. Autenticação:**
- ✅ NextAuth.js para sessões de usuário no frontend
- ✅ N8N gerencia tokens OAuth de Meta/Google
- ✅ JWT para comunicação frontend ↔ N8N

### 10.3 Próximos Passos Imediatos

**Esta Semana:**
1. [ ] Criar conta no N8N Cloud (trial) OU setup self-hosted
2. [ ] Criar Meta App para OAuth (https://developers.facebook.com)
3. [ ] Criar Google Cloud Project para OAuth
4. [ ] Definir nome do domínio e setup DNS

**Semana 1 de Desenvolvimento:**
1. [ ] Setup Next.js project
2. [ ] Configurar Prisma + PostgreSQL
3. [ ] Criar primeiro workflow N8N (teste)
4. [ ] Implementar autenticação básica

**Validação Técnica (antes de começar):**
1. [ ] Testar criação manual de workflow N8N para Meta Ads
2. [ ] Testar webhook N8N → capturar response no Postman
3. [ ] Validar OAuth Meta Ads funcionando no N8N
4. [ ] Confirmar rate limits das APIs estão OK para uso previsto

---

## 11. RISCOS E MITIGAÇÕES

### 11.1 Matriz de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| N8N API não suporta parametrização necessária | Média | Alto | Fazer POC antes de desenvolver; fallback para workflows fixos |
| Rate limits bloqueando uso | Baixa | Médio | Implementar cache agressivo; upgrade de tier se necessário |
| Mudanças quebradas nas APIs Meta/Google | Baixa | Alto | Monitorar changelogs; ter layer de abstração |
| Custos de infraestrutura crescem rápido | Média | Médio | Monitorar uso; otimizar workflows; migrar para self-hosted |
| Complexidade de UX afasta usuários | Média | Alto | Testes com usuários reais desde o MVP; onboarding guiado |

### 11.2 Plano de Contingência

**Se N8N não funcionar como esperado:**
1. Avaliar Make.com (similar, mais comercial)
2. Desenvolver backend mínimo com NestJS
3. Usar apenas relatórios manuais no MVP (sem automações)

**Se APIs mudarem drasticamente:**
1. Ter versão da API fixa nos workflows
2. Criar migração gradual entre versões
3. Notificar usuários sobre mudanças necessárias

---

## 12. MÉTRICAS DE SUCESSO

### 12.1 KPIs do Produto (Fase MVP)

**Adoção:**
- 10 usuários ativos no primeiro mês
- 5 contas de anúncios conectadas
- 50 relatórios gerados no primeiro mês

**Engajamento:**
- Usuário gera pelo menos 3 relatórios/semana
- Taxa de retenção (7 dias): >60%
- Tempo médio de sessão: >10 minutos

**Técnico:**
- Uptime: >99%
- Tempo de geração de relatório: <30 segundos
- Taxa de erro de webhooks: <2%

### 12.2 KPIs de Crescimento (Fase 2+)

**Escalabilidade:**
- 100+ usuários ativos
- 1000+ relatórios gerados/mês
- 50+ automações ativas

**Receita (se monetizar):**
- Plano Básico: $29/mês
- Plano Pro: $79/mês
- Plano Agência: $199/mês

---

## CONCLUSÃO

### Viabilidade Geral: ✅ ALTA (85%)

**Pontos Fortes:**
- Arquitetura N8N é ideal para integrações
- Stack tecnológico maduro e bem documentado
- MVP rápido de desenvolver (8-12 semanas)
- Custo de infraestrutura baixo (~$100/mês)
- Escalável para centenas de usuários

**Pontos de Atenção:**
- Configuração automática de workflows N8N requer POC
- OAuth de múltiplas plataformas precisa de cuidado
- UX precisa ser muito simples para adoção

**Recomendação Final:**
✅ **PROSSEGUIR COM MVP**

Começar com workflows pré-configurados e parametrização via API. Validar com 5-10 usuários beta antes de escalar. Focar em UX simples e automações básicas no MVP.

---

**Próxima Ação:** Criar PRD (Product Requirements Document) detalhado baseado nesta análise.
