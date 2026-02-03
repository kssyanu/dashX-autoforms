# Arquitetura Técnica Detalhada - DashX

**Data:** 31 de Janeiro de 2026
**Versão:** 1.0
**Foco:** N8N Workflows, Integrações de APIs e Fluxos de Dados

---

## 1. STACK TÉCNICO COMPLETO

### 1.1 Frontend

```yaml
Framework: Next.js 14.2+ (App Router)
Linguagem: TypeScript 5.3+
Estilo: Tailwind CSS 3.4+
Componentes: shadcn/ui
Gráficos: Recharts 2.x
Forms: React Hook Form + Zod
State: Zustand (ou React Context para casos simples)
Fetch: Native fetch + SWR (para cache)
Autenticação: NextAuth.js v5

Dev Tools:
  - ESLint + Prettier
  - Husky (pre-commit hooks)
  - Jest + React Testing Library
  - Playwright (E2E tests)
```

### 1.2 Backend (N8N)

```yaml
Plataforma: N8N 1.25+
Deployment:
  - Opção 1: N8N Cloud ($20-50/mês)
  - Opção 2: Self-hosted (Docker no Railway/Render)

Banco N8N: PostgreSQL 15+
Execução: Queue mode (para múltiplos workers)

Nodes Principais:
  - Webhook Trigger
  - HTTP Request
  - Facebook Graph API
  - Google Ads
  - PostgreSQL
  - Function (JavaScript)
  - Schedule Trigger (Cron)
  - Email (SMTP)
  - AWS S3 / Cloudflare R2
```

### 1.3 Infraestrutura

```yaml
Frontend Hosting: Vercel (ou Netlify)
N8N Hosting:
  - Railway.app (recomendado para self-hosted)
  - Render.com (alternativa)
  - N8N Cloud (managed)

Banco de Dados:
  - Supabase PostgreSQL (free tier + $10/mês depois)
  - Neon PostgreSQL (alternativa)

Storage:
  - Cloudflare R2 (compatível S3, mais barato)
  - AWS S3 (alternativa clássica)

Cache (opcional):
  - Upstash Redis (serverless, $0-10/mês)

Monitoring:
  - Sentry (error tracking)
  - Vercel Analytics (frontend)
  - BetterStack (uptime monitoring)
```

---

## 2. ARQUITETURA DE COMUNICAÇÃO

### 2.1 Fluxo de Dados Geral

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Browser   │  │  API Routes │  │  Server     │       │
│  │  Components │←→│  (Next.js)  │←→│  Actions    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│         ↓                ↓                 ↓              │
└─────────┼────────────────┼─────────────────┼──────────────┘
          │                │                 │
          │         ┌──────▼──────┐         │
          │         │  NextAuth   │         │
          │         │  (Sessions) │         │
          │         └──────┬──────┘         │
          │                │                 │
          │        ┌───────▼────────┐        │
          └────────►  Webhook Call  ◄────────┘
                   │  (com JWT)     │
                   └───────┬────────┘
                           │
                   ┌───────▼────────┐
                   │  N8N Webhooks  │
                   │  + API Gateway │
                   └───────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼───────┐
│  Meta Graph    │ │  Google Ads    │ │  Instagram   │
│  API v19.0     │ │  API v15       │ │  Graph API   │
└───────┬────────┘ └───────┬────────┘ └──────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   N8N Workflow   │
                  │   Processing     │
                  └────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼───────┐
│  PostgreSQL    │ │  Redis Cache   │ │  S3/R2       │
│  (Historical)  │ │  (Temporary)   │ │  (Files)     │
└────────────────┘ └────────────────┘ └──────────────┘
```

### 2.2 Endpoints e Webhooks

#### **Frontend → N8N (Webhooks)**

```typescript
// Estrutura padrão de chamada de webhook

interface WebhookRequest {
  endpoint: string;
  method: 'POST' | 'GET';
  headers: {
    'Authorization': string; // Bearer JWT
    'Content-Type': 'application/json';
  };
  body: object;
}

// Exemplo: Gerar relatório de Meta Ads
const generateMetaAdsReport = async (params: ReportParams) => {
  const response = await fetch(`${N8N_BASE_URL}/webhook/meta-ads-report`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: session.user.id,
      accountId: params.accountId,
      startDate: params.startDate,
      endDate: params.endDate,
      campaignObjective: params.objective,
      metrics: params.metrics,
    }),
  });

  return response.json();
};
```

#### **N8N Webhook Endpoints (a serem criados)**

```
POST /webhook/meta-ads-report          → Gerar relatório Meta Ads
POST /webhook/google-ads-report        → Gerar relatório Google Ads
POST /webhook/instagram-organic-report → Gerar relatório Instagram
POST /webhook/connect-meta-oauth       → Callback OAuth Meta
POST /webhook/connect-google-oauth     → Callback OAuth Google
POST /webhook/refresh-credentials      → Renovar tokens
GET  /webhook/report-status/:id        → Status de processamento
POST /webhook/schedule-automation      → Criar/atualizar automação
DELETE /webhook/delete-automation/:id  → Deletar automação
```

---

## 3. WORKFLOWS N8N DETALHADOS

### 3.1 Workflow: Meta Ads Report

**Arquivo:** `meta_ads_report.json`

```json
{
  "name": "Meta Ads Custom Report",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "meta-ads-report",
        "responseMode": "responseNode",
        "options": {
          "allowedOrigins": "https://dashx.seudominio.com"
        }
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Validar JWT e extrair userId\nconst jwt = $input.item.json.headers.authorization?.replace('Bearer ', '');\nif (!jwt) throw new Error('Unauthorized');\n\n// Validar dados de entrada\nconst { userId, accountId, startDate, endDate } = $input.item.json.body;\nif (!userId || !accountId || !startDate || !endDate) {\n  throw new Error('Missing required parameters');\n}\n\nreturn {\n  json: {\n    userId,\n    accountId,\n    startDate,\n    endDate,\n    campaignObjective: $input.item.json.body.campaignObjective || null,\n    metrics: $input.item.json.body.metrics || ['impressions', 'clicks', 'spend'],\n    timestamp: new Date().toISOString()\n  }\n};"
      },
      "name": "Validate Input",
      "type": "n8n-nodes-base.function",
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT access_token, account_id FROM platform_credentials WHERE user_id = $1 AND platform = 'meta' AND is_active = true LIMIT 1",
        "additionalFields": {
          "queryParameters": "={{ [$node[\"Validate Input\"].json[\"userId\"]] }}"
        }
      },
      "name": "Get Meta Credentials",
      "type": "n8n-nodes-base.postgres",
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://graph.facebook.com/v19.0/act_{{ $node[\"Get Meta Credentials\"].json[\"account_id\"] }}/insights",
        "authentication": "genericCredentialType",
        "genericAuthType": "oAuth2Api",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "fields",
              "value": "={{ $node[\"Validate Input\"].json[\"metrics\"].join(',') }},campaign_name,campaign_id"
            },
            {
              "name": "time_range",
              "value": "={{ JSON.stringify({since: $node[\"Validate Input\"].json[\"startDate\"], until: $node[\"Validate Input\"].json[\"endDate\"]}) }}"
            },
            {
              "name": "level",
              "value": "campaign"
            },
            {
              "name": "limit",
              "value": "100"
            }
          ]
        },
        "options": {
          "timeout": 30000
        }
      },
      "name": "Fetch Meta Insights",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300]
    },
    {
      "parameters": {
        "functionCode": "// Processar e calcular métricas\nconst rawData = $input.item.json.data;\nconst campaigns = [];\n\nlet totalImpressions = 0;\nlet totalClicks = 0;\nlet totalSpend = 0;\nlet totalConversions = 0;\n\nrawData.forEach(campaign => {\n  const impressions = parseInt(campaign.impressions || 0);\n  const clicks = parseInt(campaign.clicks || 0);\n  const spend = parseFloat(campaign.spend || 0);\n  const conversions = parseInt(campaign.conversions || 0);\n  \n  const ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) : 0;\n  const cpc = clicks > 0 ? (spend / clicks).toFixed(2) : 0;\n  const cpl = conversions > 0 ? (spend / conversions).toFixed(2) : 0;\n  \n  campaigns.push({\n    id: campaign.campaign_id,\n    name: campaign.campaign_name,\n    impressions,\n    clicks,\n    spend,\n    conversions,\n    ctr: parseFloat(ctr),\n    cpc: parseFloat(cpc),\n    cpl: parseFloat(cpl)\n  });\n  \n  totalImpressions += impressions;\n  totalClicks += clicks;\n  totalSpend += spend;\n  totalConversions += conversions;\n});\n\nconst summary = {\n  totalImpressions,\n  totalClicks,\n  totalSpend: totalSpend.toFixed(2),\n  totalConversions,\n  avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,\n  avgCpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0,\n  avgCpl: totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : 0\n};\n\nreturn {\n  json: {\n    userId: $node[\"Validate Input\"].json[\"userId\"],\n    reportType: 'meta_ads',\n    startDate: $node[\"Validate Input\"].json[\"startDate\"],\n    endDate: $node[\"Validate Input\"].json[\"endDate\"],\n    summary,\n    campaigns,\n    generatedAt: new Date().toISOString()\n  }\n};"
      },
      "name": "Process Data",
      "type": "n8n-nodes-base.function",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "reports",
        "columns": "user_id, report_type, report_name, start_date, end_date, metrics, status",
        "additionalFields": {
          "values": "={{ [\n            $node[\"Process Data\"].json[\"userId\"],\n            'meta_ads',\n            'Meta Ads Report - ' + $node[\"Process Data\"].json[\"startDate\"] + ' to ' + $node[\"Process Data\"].json[\"endDate\"],\n            $node[\"Process Data\"].json[\"startDate\"],\n            $node[\"Process Data\"].json[\"endDate\"],\n            JSON.stringify($node[\"Process Data\"].json),\n            'completed'\n          ] }}"
        }
      },
      "name": "Save Report to DB",
      "type": "n8n-nodes-base.postgres",
      "position": [1250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO campaign_data (user_id, platform, campaign_id, campaign_name, date, impressions, clicks, spend, conversions, ctr, cpc, cpl, raw_data) VALUES {{ $json.values }} ON CONFLICT (user_id, platform, campaign_id, date) DO UPDATE SET impressions = EXCLUDED.impressions, clicks = EXCLUDED.clicks, spend = EXCLUDED.spend",
        "additionalFields": {}
      },
      "name": "Save Campaign Data",
      "type": "n8n-nodes-base.postgres",
      "position": [1250, 450]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({\n  success: true,\n  reportId: $node[\"Save Report to DB\"].json[\"id\"],\n  summary: $node[\"Process Data\"].json[\"summary\"],\n  campaigns: $node[\"Process Data\"].json[\"campaigns\"],\n  generatedAt: $node[\"Process Data\"].json[\"generatedAt\"]\n}) }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $node[\"Fetch Meta Insights\"].json[\"error\"] }}",
              "operation": "isNotEmpty"
            }
          ]
        }
      },
      "name": "Check for Errors",
      "type": "n8n-nodes-base.if",
      "position": [850, 500]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseCode": 500,
        "responseBody": "={{ JSON.stringify({\n  success: false,\n  error: 'Failed to fetch Meta Ads data',\n  details: $node[\"Fetch Meta Insights\"].json[\"error\"].message\n}) }}"
      },
      "name": "Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 500]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Validate Input", "type": "main", "index": 0}]]
    },
    "Validate Input": {
      "main": [[{"node": "Get Meta Credentials", "type": "main", "index": 0}]]
    },
    "Get Meta Credentials": {
      "main": [[{"node": "Fetch Meta Insights", "type": "main", "index": 0}]]
    },
    "Fetch Meta Insights": {
      "main": [
        [
          {"node": "Process Data", "type": "main", "index": 0},
          {"node": "Check for Errors", "type": "main", "index": 0}
        ]
      ]
    },
    "Process Data": {
      "main": [
        [
          {"node": "Save Report to DB", "type": "main", "index": 0},
          {"node": "Save Campaign Data", "type": "main", "index": 0}
        ]
      ]
    },
    "Save Report to DB": {
      "main": [[{"node": "Respond to Webhook", "type": "main", "index": 0}]]
    },
    "Check for Errors": {
      "main": [[{"node": "Error Response", "type": "main", "index": 0}]]
    }
  }
}
```

### 3.2 Workflow: OAuth Meta Ads Connection

**Arquivo:** `meta_oauth_flow.json`

```json
{
  "name": "Meta OAuth Connection",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "GET",
        "path": "connect-meta-oauth",
        "responseMode": "responseNode"
      },
      "name": "OAuth Callback Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Extrair código de autorização da query string\nconst code = $input.item.json.query.code;\nconst state = $input.item.json.query.state; // userId criptografado\n\nif (!code) {\n  throw new Error('Authorization code not found');\n}\n\nreturn {\n  json: {\n    code,\n    userId: state, // Decodificar userId do state\n    timestamp: new Date().toISOString()\n  }\n};"
      },
      "name": "Extract Auth Code",
      "type": "n8n-nodes-base.function",
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "https://graph.facebook.com/v19.0/oauth/access_token",
        "method": "POST",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "client_id",
              "value": "={{ $env.META_APP_ID }}"
            },
            {
              "name": "client_secret",
              "value": "={{ $env.META_APP_SECRET }}"
            },
            {
              "name": "redirect_uri",
              "value": "={{ $env.N8N_WEBHOOK_URL }}/webhook/connect-meta-oauth"
            },
            {
              "name": "code",
              "value": "={{ $node[\"Extract Auth Code\"].json[\"code\"] }}"
            }
          ]
        }
      },
      "name": "Exchange Code for Token",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://graph.facebook.com/v19.0/me/adaccounts",
        "authentication": "genericCredentialType",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "access_token",
              "value": "={{ $node[\"Exchange Code for Token\"].json[\"access_token\"] }}"
            },
            {
              "name": "fields",
              "value": "id,name,account_status"
            }
          ]
        }
      },
      "name": "Fetch Ad Accounts",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300]
    },
    {
      "parameters": {
        "functionCode": "// Criptografar access_token antes de salvar\nconst crypto = require('crypto');\nconst algorithm = 'aes-256-gcm';\nconst key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');\n\nfunction encrypt(text) {\n  const iv = crypto.randomBytes(16);\n  const cipher = crypto.createCipheriv(algorithm, key, iv);\n  let encrypted = cipher.update(text, 'utf8', 'hex');\n  encrypted += cipher.final('hex');\n  const authTag = cipher.getAuthTag();\n  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;\n}\n\nconst accessToken = $node[\"Exchange Code for Token\"].json[\"access_token\"];\nconst encryptedToken = encrypt(accessToken);\n\nconst adAccounts = $node[\"Fetch Ad Accounts\"].json.data;\nconst records = adAccounts.map(account => ({\n  userId: $node[\"Extract Auth Code\"].json[\"userId\"],\n  platform: 'meta',\n  accessToken: encryptedToken,\n  accountId: account.id,\n  accountName: account.name,\n  isActive: true\n}));\n\nreturn records.map(r => ({ json: r }));"
      },
      "name": "Encrypt and Prepare Data",
      "type": "n8n-nodes-base.function",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "platform_credentials",
        "columns": "user_id, platform, access_token, account_id, account_name, is_active",
        "options": {
          "onConflict": "DO UPDATE SET access_token = EXCLUDED.access_token, updated_at = NOW()"
        }
      },
      "name": "Save Credentials",
      "type": "n8n-nodes-base.postgres",
      "position": [1250, 300]
    },
    {
      "parameters": {
        "respondWith": "redirect",
        "redirectUrl": "https://dashx.seudominio.com/dashboard?connection=meta&status=success"
      },
      "name": "Redirect to Frontend",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1450, 300]
    }
  ]
}
```

### 3.3 Workflow: Scheduled Daily Data Sync

**Arquivo:** `daily_data_sync.json`

```json
{
  "name": "Daily Campaign Data Sync",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 8 * * *"
            }
          ]
        }
      },
      "name": "Cron Trigger (Daily 8AM)",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT DISTINCT user_id, account_id, access_token FROM platform_credentials WHERE is_active = true AND platform = 'meta'"
      },
      "name": "Get Active Accounts",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300]
    },
    {
      "parameters": {
        "batchSize": 5,
        "options": {
          "timeout": 60000
        }
      },
      "name": "Loop Over Accounts",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://graph.facebook.com/v19.0/act_{{ $json.account_id }}/insights",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "fields",
              "value": "impressions,clicks,spend,conversions,campaign_name,campaign_id"
            },
            {
              "name": "time_range",
              "value": "={{ JSON.stringify({since: new Date(Date.now() - 86400000).toISOString().split('T')[0], until: new Date(Date.now() - 86400000).toISOString().split('T')[0]}) }}"
            },
            {
              "name": "level",
              "value": "campaign"
            }
          ]
        }
      },
      "name": "Fetch Yesterday Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "campaign_data",
        "options": {
          "onConflict": "DO UPDATE SET impressions = EXCLUDED.impressions"
        }
      },
      "name": "Save to Database",
      "type": "n8n-nodes-base.postgres",
      "position": [1050, 300]
    },
    {
      "parameters": {},
      "name": "Continue Loop",
      "type": "n8n-nodes-base.noOp",
      "position": [850, 500]
    }
  ]
}
```

---

## 4. INTEGRAÇÕES DE API

### 4.1 Meta Marketing API

**Base URL:** `https://graph.facebook.com/v19.0`

#### **Endpoints Utilizados:**

```typescript
// 1. OAuth - Obter Access Token
POST /oauth/access_token
Params:
  - client_id: META_APP_ID
  - client_secret: META_APP_SECRET
  - redirect_uri: callback URL
  - code: authorization_code

// 2. Listar Ad Accounts
GET /me/adaccounts
Params:
  - access_token
  - fields: id,name,account_status,currency,timezone_name

// 3. Obter Insights de Campanhas
GET /act_{ad_account_id}/insights
Params:
  - access_token
  - fields: impressions,clicks,spend,conversions,ctr,cpc,cpm
  - level: account | campaign | adset | ad
  - time_range: {"since":"2026-01-01","until":"2026-01-31"}
  - filtering: [{"field":"campaign.objective","operator":"EQUAL","value":"CONVERSIONS"}]
  - limit: 100
  - breakdowns: age,gender,region (opcional)

// 4. Obter Dados de Campanha Específica
GET /{campaign_id}/insights
Params: (mesmos acima)

// 5. Long-lived Token (renova a cada 60 dias)
GET /oauth/access_token
Params:
  - grant_type: fb_exchange_token
  - client_id: META_APP_ID
  - client_secret: META_APP_SECRET
  - fb_exchange_token: short_lived_token
```

#### **Métricas Disponíveis:**

```typescript
interface MetaAdsMetrics {
  // Métricas Básicas
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  unique_clicks: number;
  spend: number;

  // Métricas de Performance
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per 1000 impressions
  cpp: number; // Cost per page engagement

  // Conversões
  conversions: number;
  cost_per_conversion: number;
  conversion_rate: number;

  // E-commerce
  purchase_roas: number; // Return on ad spend
  purchases: number;
  purchase_value: number;

  // Leads
  leads: number;
  cost_per_lead: number;

  // Engajamento
  post_engagements: number;
  post_reactions: number;
  post_comments: number;
  post_shares: number;
  video_views: number;
  video_avg_time_watched: number;
}
```

#### **Rate Limits:**

- **API Calls:** 200 chamadas por usuário por hora
- **Insights:** Limitado a 5 requests paralelos
- **Estratégia de Mitigação:**
  - Cache de 15 minutos para dados não-críticos
  - Batch requests quando possível
  - Implementar exponential backoff em 429 errors

#### **Error Handling:**

```typescript
// Erros comuns da Meta API
const META_API_ERRORS = {
  1: 'Unknown error occurred',
  2: 'Service temporarily unavailable',
  4: 'Application request limit reached',
  10: 'Permission denied',
  17: 'User request limit reached',
  190: 'Access token has expired',
  200: 'Permission error',
  368: 'Temporarily blocked for policies violations',
};

// Handler genérico
function handleMetaApiError(error: any) {
  const errorCode = error.error?.code;
  const errorMessage = META_API_ERRORS[errorCode] || 'Unknown error';

  if (errorCode === 190) {
    // Token expirado, forçar re-autenticação
    return { action: 'REAUTH', message: 'Please reconnect your Meta account' };
  }

  if (errorCode === 4 || errorCode === 17) {
    // Rate limit, tentar novamente depois
    return { action: 'RETRY', delay: 3600000, message: 'Rate limit reached, retrying in 1 hour' };
  }

  return { action: 'ERROR', message: errorMessage };
}
```

### 4.2 Google Ads API

**Base URL:** `https://googleads.googleapis.com/v15`

#### **Endpoints Utilizados:**

```typescript
// 1. OAuth - Obter Access Token
POST https://oauth2.googleapis.com/token
Params:
  - client_id: GOOGLE_CLIENT_ID
  - client_secret: GOOGLE_CLIENT_SECRET
  - redirect_uri: callback URL
  - grant_type: authorization_code
  - code: authorization_code

// 2. Listar Contas de Anúncios
GET /customers:listAccessibleCustomers
Headers:
  - Authorization: Bearer {access_token}
  - developer-token: {GOOGLE_DEV_TOKEN}

// 3. Obter Dados de Campanhas (usando GAQL - Google Ads Query Language)
POST /customers/{customer_id}/googleAds:search
Headers: (mesmos acima)
Body:
  query: "SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros FROM campaign WHERE segments.date BETWEEN '2026-01-01' AND '2026-01-31'"

// 4. Refresh Token
POST https://oauth2.googleapis.com/token
Params:
  - client_id: GOOGLE_CLIENT_ID
  - client_secret: GOOGLE_CLIENT_SECRET
  - refresh_token: stored_refresh_token
  - grant_type: refresh_token
```

#### **GAQL Queries Úteis:**

```sql
-- Relatório de Campanhas por Data
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.ctr,
  metrics.average_cpc
FROM campaign
WHERE segments.date BETWEEN '2026-01-01' AND '2026-01-31'
AND campaign.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC

-- Relatório por Objetivo de Campanha
SELECT
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  metrics.impressions,
  metrics.conversions,
  metrics.cost_per_conversion
FROM campaign
WHERE campaign.advertising_channel_type IN ('SEARCH', 'DISPLAY', 'SHOPPING')

-- Relatório de E-commerce (Shopping)
SELECT
  campaign.id,
  campaign.name,
  metrics.conversions_value,
  metrics.cost_micros,
  metrics.conversions
FROM campaign
WHERE campaign.advertising_channel_type = 'SHOPPING'
```

#### **Rate Limits:**

- **API Calls:** 15.000 operações/dia (tier básico)
- **Queries:** Limitado a 30 queries/min por cliente
- **Estratégia:**
  - Usar pagination para grandes datasets
  - Agregar métricas em queries únicas
  - Cache de 30 minutos

### 4.3 Instagram Graph API

**Base URL:** `https://graph.facebook.com/v19.0`

#### **Endpoints para Dados Orgânicos:**

```typescript
// 1. Obter Instagram Business Account ID
GET /{facebook_page_id}?fields=instagram_business_account

// 2. Dados de Perfil
GET /{instagram_account_id}
Params:
  - fields: followers_count,follows_count,media_count,name,username,profile_picture_url

// 3. Insights de Perfil (últimos 30 dias)
GET /{instagram_account_id}/insights
Params:
  - metric: impressions,reach,profile_views,follower_count
  - period: day | week | days_28
  - since: timestamp
  - until: timestamp

// 4. Média (Posts)
GET /{instagram_account_id}/media
Params:
  - fields: id,caption,media_type,media_url,timestamp,like_count,comments_count

// 5. Insights de Post Específico
GET /{media_id}/insights
Params:
  - metric: engagement,impressions,reach,saved
```

#### **Métricas Orgânicas Disponíveis:**

```typescript
interface InstagramOrganicMetrics {
  // Perfil
  follower_count: number;
  following_count: number;
  media_count: number;

  // Alcance
  impressions: number;
  reach: number;
  profile_views: number;

  // Engajamento (por post)
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  engagement_rate: number; // Calculado: (likes + comments + saves) / followers * 100

  // Dados demográficos (apenas contas Business)
  audience_city: object;
  audience_country: object;
  audience_gender_age: object;
}
```

---

## 5. ESTRUTURA DE CÓDIGO FRONTEND

### 5.1 Organização de Diretórios

```
dashx/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── reports/
│   │   │   ├── page.tsx          # Lista de relatórios
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Criar relatório
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Visualizar relatório
│   │   ├── automations/
│   │   │   ├── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── accounts/         # Contas conectadas
│   │       └── team/             # Membros (Fase 3)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth config
│   │   ├── reports/
│   │   │   ├── generate/
│   │   │   │   └── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── webhooks/             # Receber callbacks do N8N
│   │       └── n8n/
│   │           └── route.ts
│   └── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/
│   │   ├── MetricsCard.tsx
│   │   ├── PerformanceChart.tsx
│   │   └── CampaignTable.tsx
│   ├── reports/
│   │   ├── ReportFilters.tsx
│   │   ├── ReportSummary.tsx
│   │   └── ExportPdfButton.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── LoadingScreen.tsx
├── lib/
│   ├── db/
│   │   ├── prisma.ts
│   │   └── queries/
│   │       ├── reports.ts
│   │       ├── users.ts
│   │       └── credentials.ts
│   ├── n8n/
│   │   ├── client.ts             # N8N webhook client
│   │   ├── workflows.ts          # Helpers para chamar workflows
│   │   └── types.ts              # TypeScript interfaces
│   ├── utils/
│   │   ├── format.ts             # Formatação de números, datas
│   │   ├── calculations.ts       # CTR, CPC, etc.
│   │   └── validation.ts         # Zod schemas
│   └── hooks/
│       ├── useReports.ts
│       ├── useAccounts.ts
│       └── useAutomations.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── assets/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### 5.2 Exemplo de Código: N8N Client

```typescript
// lib/n8n/client.ts

interface N8NWebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class N8NClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.N8N_WEBHOOK_URL!;
    this.apiKey = process.env.N8N_API_KEY!;
  }

  private async callWebhook<T>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'POST',
    body?: object
  ): Promise<N8NWebhookResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'N8N webhook failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('N8N Client Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Gerar relatório de Meta Ads
  async generateMetaAdsReport(params: {
    userId: string;
    accountId: string;
    startDate: string;
    endDate: string;
    campaignObjective?: string;
  }) {
    return this.callWebhook('meta-ads-report', 'POST', params);
  }

  // Gerar relatório de Google Ads
  async generateGoogleAdsReport(params: {
    userId: string;
    customerId: string;
    startDate: string;
    endDate: string;
  }) {
    return this.callWebhook('google-ads-report', 'POST', params);
  }

  // Criar automação programada
  async createAutomation(params: {
    userId: string;
    reportType: string;
    schedule: string; // cron expression
  }) {
    return this.callWebhook('schedule-automation', 'POST', params);
  }
}

export const n8nClient = new N8NClient();
```

### 5.3 Exemplo de Código: Server Action para Gerar Relatório

```typescript
// app/api/reports/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { n8nClient } from '@/lib/n8n/client';
import { z } from 'zod';

const generateReportSchema = z.object({
  platform: z.enum(['meta', 'google', 'instagram']),
  accountId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  campaignObjective: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validar body
    const body = await req.json();
    const validatedData = generateReportSchema.parse(body);

    // Chamar N8N apropriado baseado na plataforma
    let result;
    if (validatedData.platform === 'meta') {
      result = await n8nClient.generateMetaAdsReport({
        userId: session.user.id,
        accountId: validatedData.accountId,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        campaignObjective: validatedData.campaignObjective,
      });
    } else if (validatedData.platform === 'google') {
      result = await n8nClient.generateGoogleAdsReport({
        userId: session.user.id,
        customerId: validatedData.accountId,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Generate Report Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 6. SEGURANÇA E AUTENTICAÇÃO

### 6.1 NextAuth.js Configuration

```typescript
// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
```

### 6.2 Proteção de Rotas

```typescript
// middleware.ts

import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reports/:path*',
    '/automations/:path*',
    '/settings/:path*',
    '/api/reports/:path*',
    '/api/automations/:path*',
  ],
};
```

---

## 7. PERFORMANCE E OTIMIZAÇÕES

### 7.1 Cache Strategy (SWR)

```typescript
// lib/hooks/useReports.ts

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useReports() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/reports',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // 1 minuto
    }
  );

  return {
    reports: data?.reports || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
```

### 7.2 Database Indexing

```sql
-- Índices críticos para performance

CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);
CREATE INDEX idx_campaign_data_user_date ON campaign_data(user_id, date DESC);
CREATE INDEX idx_campaign_data_platform ON campaign_data(platform);
CREATE INDEX idx_credentials_user_platform ON platform_credentials(user_id, platform);
```

---

**Documento complementar a:** `FEASIBILITY_ANALYSIS.md` e `BRAINSTORM_FEATURES.md`
**Próximo documento:** `PRD.md` (Product Requirements Document)
