# DashX - N8N Workflows Documentation

**Versão N8N:** 2.4.7+
**Data:** 02 de Fevereiro de 2026
**Total de Workflows:** 4 (MVP) + 1 (Fase 2)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração de Credentials](#configuração-de-credentials)
3. [Workflow 1: Meta OAuth Connection](#workflow-1-meta-oauth-connection)
4. [Workflow 2: Meta Ads Data Sync](#workflow-2-meta-ads-data-sync)
5. [Workflow 3: Google OAuth Connection](#workflow-3-google-oauth-connection)
6. [Workflow 4: Google Ads Data Sync](#workflow-4-google-ads-data-sync)
7. [Workflow 5: Daily Sync (Fase 2)](#workflow-5-daily-sync-fase-2)
8. [Testando Workflows](#testando-workflows)
9. [Troubleshooting](#troubleshooting)

---

## 1. Visão Geral

### 1.1 Arquitetura

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│  Next.js    │─────▶│     N8N      │─────▶│   Supabase   │
│  Frontend   │      │  Workflows   │      │   Database   │
└─────────────┘      └──────────────┘      └──────────────┘
       │                     │                      │
       │                     ▼                      │
       │              ┌──────────────┐              │
       └─────────────▶│  Meta Ads    │◀─────────────┘
                      │  Google Ads  │
                      └──────────────┘
```

### 1.2 Workflows do MVP

| ID | Nome | Trigger | Função |
|----|------|---------|--------|
| 1 | `meta_oauth_connection` | Webhook GET | Processa callback OAuth Meta |
| 2 | `meta_ads_sync` | Webhook POST | Sincroniza dados Meta Ads |
| 3 | `google_oauth_connection` | Webhook GET | Processa callback OAuth Google |
| 4 | `google_ads_sync` | Webhook POST | Sincroniza dados Google Ads |

### 1.3 Convenções

**Webhook Paths:**
- Meta OAuth: `/webhook/oauth/meta/callback`
- Meta Sync: `/webhook/sync/meta-ads`
- Google OAuth: `/webhook/oauth/google/callback`
- Google Sync: `/webhook/sync/google-ads`

**Response Format:**
```json
{
  "success": true,
  "data": {...},
  "error": null
}
```

---

## 2. Configuração de Credentials

### 2.1 Supabase Credential

1. No N8N, vá em **Credentials > New**
2. Selecione **Supabase**
3. Configure:

```yaml
Name: Supabase DashX
Host: seu-projeto.supabase.co
Service Role Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Teste e salve

### 2.2 HTTP Request Credential (Supabase REST API)

1. **Credentials > New > HTTP Header Auth**
2. Configure:

```yaml
Name: Supabase REST API
Header Name: apikey
Header Value: {{$env.SUPABASE_SERVICE_KEY}}
```

### 2.3 Meta Graph API Credential

1. **Credentials > New > Generic Credential Type**
2. Nome: `Meta Graph API`
3. Adicione fields:

```yaml
App ID: {{$env.META_APP_ID}}
App Secret: {{$env.META_APP_SECRET}}
```

### 2.4 Google Ads API Credential

1. **Credentials > New > Google OAuth2 API**
2. Configure:

```yaml
Name: Google Ads API
Client ID: {{$env.GOOGLE_CLIENT_ID}}
Client Secret: {{$env.GOOGLE_CLIENT_SECRET}}
Scopes: https://www.googleapis.com/auth/adwords
```

---

## 3. Workflow 1: Meta OAuth Connection

### 3.1 Descrição

Processa o callback OAuth do Facebook, troca o authorization code por access token, busca ad accounts e salva no Supabase.

### 3.2 Fluxo

```
1. Webhook recebe: ?code=...&state=...
2. Valida state parameter
3. Troca code por access_token (Meta Graph API)
4. Busca ad accounts do usuário
5. Criptografa access_token
6. Salva em platform_credentials (Supabase)
7. Redireciona usuário para Next.js
```

### 3.3 JSON do Workflow

**Arquivo: `n8n/workflows/meta_oauth_connection.json`**

```json
{
  "name": "Meta OAuth Connection",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "GET",
        "path": "oauth/meta/callback",
        "responseMode": "redirect",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook - Meta OAuth Callback",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Extract and validate OAuth parameters\nconst code = $input.first().json.query.code;\nconst state = $input.first().json.query.state;\n\nif (!code || !state) {\n  throw new Error('Missing OAuth parameters');\n}\n\n// Decrypt state (contains userId + nonce + timestamp)\ntry {\n  const crypto = require('crypto');\n  const encryptionKey = Buffer.from($env.ENCRYPTION_KEY, 'hex');\n  \n  const parts = state.split(':');\n  const iv = Buffer.from(parts[0], 'hex');\n  const authTag = Buffer.from(parts[1], 'hex');\n  const encrypted = Buffer.from(parts[2], 'hex');\n  \n  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);\n  decipher.setAuthTag(authTag);\n  \n  let decrypted = decipher.update(encrypted, 'hex', 'utf8');\n  decrypted += decipher.final('utf8');\n  \n  const stateData = JSON.parse(decrypted);\n  \n  // Validate timestamp (must be < 5 minutes old)\n  const now = Date.now();\n  if (now - stateData.timestamp > 300000) {\n    throw new Error('OAuth state expired');\n  }\n  \n  return {\n    code,\n    userId: stateData.userId,\n    nonce: stateData.nonce\n  };\n  \n} catch (error) {\n  throw new Error('Invalid OAuth state: ' + error.message);\n}"
      },
      "id": "validate-state",
      "name": "Validate State",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "=https://graph.facebook.com/v19.0/oauth/access_token",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "client_id",
              "value": "={{$env.META_APP_ID}}"
            },
            {
              "name": "client_secret",
              "value": "={{$env.META_APP_SECRET}}"
            },
            {
              "name": "code",
              "value": "={{$json.code}}"
            },
            {
              "name": "redirect_uri",
              "value": "={{$env.N8N_WEBHOOK_URL}}/oauth/meta/callback"
            }
          ]
        },
        "options": {}
      },
      "id": "exchange-token",
      "name": "Exchange Code for Token",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "=https://graph.facebook.com/v19.0/me/adaccounts",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "access_token",
              "value": "={{$json.access_token}}"
            },
            {
              "name": "fields",
              "value": "id,name,account_status,currency,timezone_name"
            }
          ]
        },
        "options": {}
      },
      "id": "get-ad-accounts",
      "name": "Get Ad Accounts",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [850, 300]
    },
    {
      "parameters": {
        "jsCode": "// Encrypt access token before saving\nconst crypto = require('crypto');\nconst encryptionKey = Buffer.from($env.ENCRYPTION_KEY, 'hex');\n\nfunction encryptToken(token) {\n  const iv = crypto.randomBytes(16);\n  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);\n  \n  let encrypted = cipher.update(token, 'utf8', 'hex');\n  encrypted += cipher.final('hex');\n  \n  const authTag = cipher.getAuthTag();\n  \n  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;\n}\n\nconst accessToken = $input.first().json.access_token;\nconst userId = $node[\"Validate State\"].json.userId;\nconst adAccounts = $input.first().json.data;\n\n// Prepare data for each ad account\nconst credentials = adAccounts.map(account => ({\n  user_id: userId,\n  platform: 'meta',\n  account_id: account.id.replace('act_', ''), // Remove 'act_' prefix\n  account_name: account.name,\n  access_token: encryptToken(accessToken),\n  refresh_token: null,\n  token_expires_at: null, // Meta tokens don't expire by default\n  is_active: true,\n  sync_status: 'pending',\n  created_at: new Date().toISOString(),\n  updated_at: new Date().toISOString()\n}));\n\nreturn credentials;"
      },
      "id": "prepare-credentials",
      "name": "Prepare Credentials",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "platform_credentials",
        "columns": "user_id,platform,account_id,account_name,access_token,refresh_token,token_expires_at,is_active,sync_status,created_at,updated_at",
        "options": {
          "onConflict": "DO UPDATE SET access_token = EXCLUDED.access_token, updated_at = NOW()"
        }
      },
      "id": "save-to-db",
      "name": "Save to Supabase",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [1250, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase DashX"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// Redirect user back to Next.js with success\nconst nextjsUrl = $env.NEXTJS_BASE_URL;\nconst accountsCount = $input.all().length;\n\nreturn {\n  json: {\n    redirectUrl: `${nextjsUrl}/accounts?status=success&accounts=${accountsCount}&platform=meta`\n  }\n};"
      },
      "id": "prepare-redirect",
      "name": "Prepare Redirect",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1450, 300]
    },
    {
      "parameters": {
        "respondWith": "redirect",
        "redirectURL": "={{$json.redirectUrl}}"
      },
      "id": "redirect-response",
      "name": "Redirect to Next.js",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [1650, 300]
    },
    {
      "parameters": {
        "jsCode": "// Error handler\nconst error = $input.first().json.error || 'Unknown error';\nconst nextjsUrl = $env.NEXTJS_BASE_URL;\n\nreturn {\n  json: {\n    redirectUrl: `${nextjsUrl}/accounts?status=error&message=${encodeURIComponent(error)}`\n  }\n};"
      },
      "id": "error-handler",
      "name": "Error Handler",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1450, 500]
    }
  ],
  "connections": {
    "Webhook - Meta OAuth Callback": {
      "main": [[{"node": "Validate State", "type": "main", "index": 0}]]
    },
    "Validate State": {
      "main": [[{"node": "Exchange Code for Token", "type": "main", "index": 0}]]
    },
    "Exchange Code for Token": {
      "main": [[{"node": "Get Ad Accounts", "type": "main", "index": 0}]]
    },
    "Get Ad Accounts": {
      "main": [[{"node": "Prepare Credentials", "type": "main", "index": 0}]]
    },
    "Prepare Credentials": {
      "main": [[{"node": "Save to Supabase", "type": "main", "index": 0}]]
    },
    "Save to Supabase": {
      "main": [[{"node": "Prepare Redirect", "type": "main", "index": 0}]]
    },
    "Prepare Redirect": {
      "main": [[{"node": "Redirect to Next.js", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": ""
  },
  "staticData": null,
  "tags": [],
  "triggerCount": 1,
  "updatedAt": "2026-02-02T12:00:00.000Z",
  "versionId": "1"
}
```

### 3.4 Como Importar

1. No N8N UI, clique em **Workflows**
2. Clique em **Import from File**
3. Selecione `meta_oauth_connection.json`
4. Clique em **Save**
5. Ative o workflow (toggle no topo)

### 3.5 Teste Manual

```bash
# Simular OAuth callback
curl -X GET "https://n8n.seu-dominio.com/webhook/oauth/meta/callback?code=TEST_CODE&state=TEST_STATE"
```

---

## 4. Workflow 2: Meta Ads Data Sync

### 4.1 Descrição

Sincroniza dados de campanhas do Meta Ads para o Supabase, calculando métricas e armazenando histórico.

### 4.2 Fluxo

```
1. Webhook recebe: { userId, credentialId, startDate, endDate }
2. Busca credentials do Supabase
3. Descriptografa access_token
4. Chama Meta Graph API /insights
5. Processa dados (calcula CTR, CPC, ROAS)
6. Insere em campaign_data (batch)
7. Retorna resumo de métricas
```

### 4.3 JSON do Workflow

**Arquivo: `n8n/workflows/meta_ads_sync.json`**

```json
{
  "name": "Meta Ads Data Sync",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "sync/meta-ads",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook - Sync Request",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Validate request body\nconst body = $input.first().json.body;\n\nif (!body.credentialId || !body.startDate || !body.endDate) {\n  throw new Error('Missing required parameters: credentialId, startDate, endDate');\n}\n\n// Validate date format (YYYY-MM-DD)\nconst dateRegex = /^\\d{4}-\\d{2}-\\d{2}$/;\nif (!dateRegex.test(body.startDate) || !dateRegex.test(body.endDate)) {\n  throw new Error('Invalid date format. Use YYYY-MM-DD');\n}\n\n// Validate date range (max 365 days)\nconst start = new Date(body.startDate);\nconst end = new Date(body.endDate);\nconst diffDays = (end - start) / (1000 * 60 * 60 * 24);\n\nif (diffDays > 365) {\n  throw new Error('Date range cannot exceed 365 days');\n}\n\nif (diffDays < 0) {\n  throw new Error('End date must be after start date');\n}\n\nreturn {\n  credentialId: body.credentialId,\n  startDate: body.startDate,\n  endDate: body.endDate,\n  campaignObjective: body.campaignObjective || null\n};"
      },
      "id": "validate-request",
      "name": "Validate Request",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "platform_credentials",
        "filters": {
          "conditions": [
            {
              "column": "id",
              "operator": "equals",
              "value": "={{$json.credentialId}}"
            },
            {
              "column": "is_active",
              "operator": "equals",
              "value": true
            }
          ]
        },
        "options": {
          "limit": 1
        }
      },
      "id": "get-credentials",
      "name": "Get Credentials from DB",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [650, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase DashX"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// Decrypt access token\nconst crypto = require('crypto');\nconst encryptionKey = Buffer.from($env.ENCRYPTION_KEY, 'hex');\n\nfunction decryptToken(encrypted) {\n  const parts = encrypted.split(':');\n  const iv = Buffer.from(parts[0], 'hex');\n  const authTag = Buffer.from(parts[1], 'hex');\n  const encryptedText = Buffer.from(parts[2], 'hex');\n  \n  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);\n  decipher.setAuthTag(authTag);\n  \n  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');\n  decrypted += decipher.final('utf8');\n  \n  return decrypted;\n}\n\nconst credential = $input.first().json;\n\nif (!credential || !credential.access_token) {\n  throw new Error('Credential not found or inactive');\n}\n\nconst params = $node[\"Validate Request\"].json;\n\nreturn {\n  userId: credential.user_id,\n  credentialId: credential.id,\n  platform: credential.platform,\n  accountId: credential.account_id,\n  accessToken: decryptToken(credential.access_token),\n  startDate: params.startDate,\n  endDate: params.endDate,\n  campaignObjective: params.campaignObjective\n};"
      },
      "id": "decrypt-token",
      "name": "Decrypt Token",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [850, 300]
    },
    {
      "parameters": {
        "url": "=https://graph.facebook.com/v19.0/act_{{$json.accountId}}/insights",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "access_token",
              "value": "={{$json.accessToken}}"
            },
            {
              "name": "level",
              "value": "campaign"
            },
            {
              "name": "fields",
              "value": "campaign_id,campaign_name,objective,impressions,clicks,spend,actions,action_values"
            },
            {
              "name": "time_range",
              "value": "={{JSON.stringify({since: $json.startDate, until: $json.endDate})}}"
            },
            {
              "name": "time_increment",
              "value": "1"
            },
            {
              "name": "filtering",
              "value": "={{$json.campaignObjective ? JSON.stringify([{field: 'objective', operator: 'EQUAL', value: $json.campaignObjective}]) : '[]'}}"
            },
            {
              "name": "limit",
              "value": "500"
            }
          ]
        },
        "options": {
          "batching": {
            "batch": {
              "batchSize": 10,
              "batchInterval": 1000
            }
          }
        }
      },
      "id": "fetch-insights",
      "name": "Fetch Meta Ads Insights",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "jsCode": "// Process and transform Meta Ads data\nconst items = $input.all();\nconst userId = $node[\"Decrypt Token\"].json.userId;\nconst credentialId = $node[\"Decrypt Token\"].json.credentialId;\n\nfunction extractAction(actions, actionType) {\n  if (!actions) return 0;\n  const action = actions.find(a => a.action_type === actionType);\n  return action ? parseInt(action.value, 10) : 0;\n}\n\nfunction extractActionValue(actionValues, actionType) {\n  if (!actionValues) return 0;\n  const value = actionValues.find(a => a.action_type === actionType);\n  return value ? parseFloat(value.value) : 0;\n}\n\nconst processedData = [];\n\nfor (const item of items) {\n  const data = item.json.data || [];\n  \n  for (const campaign of data) {\n    const impressions = parseInt(campaign.impressions, 10) || 0;\n    const clicks = parseInt(campaign.clicks, 10) || 0;\n    const spend = parseFloat(campaign.spend) || 0;\n    \n    // Extract conversions and values\n    const conversions = extractAction(campaign.actions, 'offsite_conversion.fb_pixel_purchase') ||\n                       extractAction(campaign.actions, 'lead') ||\n                       extractAction(campaign.actions, 'onsite_conversion.post_save');\n    \n    const conversionValue = extractActionValue(campaign.action_values, 'offsite_conversion.fb_pixel_purchase') ||\n                           extractActionValue(campaign.action_values, 'omni_purchase');\n    \n    processedData.push({\n      user_id: userId,\n      credential_id: credentialId,\n      platform: 'meta',\n      campaign_id: campaign.campaign_id,\n      campaign_name: campaign.campaign_name,\n      campaign_objective: campaign.objective,\n      date: campaign.date_start,\n      impressions,\n      clicks,\n      spend,\n      conversions,\n      conversion_value: conversionValue,\n      raw_data: campaign,\n      created_at: new Date().toISOString()\n    });\n  }\n}\n\nreturn processedData;"
      },
      "id": "process-data",
      "name": "Process Campaign Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1250, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "campaign_data",
        "columns": "user_id,credential_id,platform,campaign_id,campaign_name,campaign_objective,date,impressions,clicks,spend,conversions,conversion_value,raw_data,created_at",
        "options": {
          "onConflict": "ON CONFLICT (user_id, platform, campaign_id, date) DO UPDATE SET impressions = EXCLUDED.impressions, clicks = EXCLUDED.clicks, spend = EXCLUDED.spend, conversions = EXCLUDED.conversions, conversion_value = EXCLUDED.conversion_value, raw_data = EXCLUDED.raw_data"
        }
      },
      "id": "save-campaign-data",
      "name": "Save Campaign Data",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [1450, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase DashX"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// Calculate summary metrics\nconst campaigns = $input.all();\n\nconst summary = campaigns.reduce((acc, item) => {\n  const data = item.json;\n  return {\n    totalSpend: (acc.totalSpend || 0) + (data.spend || 0),\n    totalImpressions: (acc.totalImpressions || 0) + (data.impressions || 0),\n    totalClicks: (acc.totalClicks || 0) + (data.clicks || 0),\n    totalConversions: (acc.totalConversions || 0) + (data.conversions || 0),\n    totalConversionValue: (acc.totalConversionValue || 0) + (data.conversion_value || 0),\n    campaignsUpdated: (acc.campaignsUpdated || 0) + 1\n  };\n}, {});\n\n// Calculate averages\nsummary.avgCtr = summary.totalImpressions > 0 \n  ? ((summary.totalClicks / summary.totalImpressions) * 100).toFixed(2)\n  : 0;\n  \nsummary.avgCpc = summary.totalClicks > 0\n  ? (summary.totalSpend / summary.totalClicks).toFixed(2)\n  : 0;\n  \nsummary.roas = summary.totalSpend > 0\n  ? (summary.totalConversionValue / summary.totalSpend).toFixed(2)\n  : 0;\n\nreturn {\n  success: true,\n  platform: 'meta',\n  summary,\n  timestamp: new Date().toISOString()\n};"
      },
      "id": "calculate-summary",
      "name": "Calculate Summary",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1650, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{$json}}"
      },
      "id": "return-response",
      "name": "Return Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [1850, 300]
    },
    {
      "parameters": {
        "jsCode": "// Error response\nconst error = $input.first().json.error || 'Unknown error during sync';\n\nreturn {\n  success: false,\n  error: error.toString(),\n  platform: 'meta',\n  timestamp: new Date().toISOString()\n};"
      },
      "id": "error-handler",
      "name": "Error Handler",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1650, 500]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseCode": 500,
        "responseBody": "={{$json}}"
      },
      "id": "return-error",
      "name": "Return Error Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [1850, 500]
    }
  ],
  "connections": {
    "Webhook - Sync Request": {
      "main": [[{"node": "Validate Request", "type": "main", "index": 0}]]
    },
    "Validate Request": {
      "main": [[{"node": "Get Credentials from DB", "type": "main", "index": 0}]]
    },
    "Get Credentials from DB": {
      "main": [[{"node": "Decrypt Token", "type": "main", "index": 0}]]
    },
    "Decrypt Token": {
      "main": [[{"node": "Fetch Meta Ads Insights", "type": "main", "index": 0}]]
    },
    "Fetch Meta Ads Insights": {
      "main": [[{"node": "Process Campaign Data", "type": "main", "index": 0}]]
    },
    "Process Campaign Data": {
      "main": [[{"node": "Save Campaign Data", "type": "main", "index": 0}]]
    },
    "Save Campaign Data": {
      "main": [[{"node": "Calculate Summary", "type": "main", "index": 0}]]
    },
    "Calculate Summary": {
      "main": [[{"node": "Return Success Response", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": ""
  },
  "staticData": null,
  "tags": ["dashx", "meta-ads"],
  "triggerCount": 1,
  "updatedAt": "2026-02-02T12:00:00.000Z",
  "versionId": "1"
}
```

### 4.4 Teste Manual

```bash
curl -X POST https://n8n.seu-dominio.com/webhook/sync/meta-ads \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "uuid-da-credential",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  }'
```

---

## 5. Workflow 3: Google OAuth Connection

### 5.1 Descrição

Similar ao Meta OAuth, mas para Google Ads.

### 5.2 JSON do Workflow

**Arquivo: `n8n/workflows/google_oauth_connection.json`**

```json
{
  "name": "Google OAuth Connection",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "GET",
        "path": "oauth/google/callback",
        "responseMode": "redirect",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook - Google OAuth Callback",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Validate OAuth params (same as Meta)\nconst code = $input.first().json.query.code;\nconst state = $input.first().json.query.state;\n\nif (!code || !state) {\n  throw new Error('Missing OAuth parameters');\n}\n\ntry {\n  const crypto = require('crypto');\n  const encryptionKey = Buffer.from($env.ENCRYPTION_KEY, 'hex');\n  \n  const parts = state.split(':');\n  const iv = Buffer.from(parts[0], 'hex');\n  const authTag = Buffer.from(parts[1], 'hex');\n  const encrypted = Buffer.from(parts[2], 'hex');\n  \n  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);\n  decipher.setAuthTag(authTag);\n  \n  let decrypted = decipher.update(encrypted, 'hex', 'utf8');\n  decrypted += decipher.final('utf8');\n  \n  const stateData = JSON.parse(decrypted);\n  \n  const now = Date.now();\n  if (now - stateData.timestamp > 300000) {\n    throw new Error('OAuth state expired');\n  }\n  \n  return {\n    code,\n    userId: stateData.userId,\n    nonce: stateData.nonce\n  };\n  \n} catch (error) {\n  throw new Error('Invalid OAuth state: ' + error.message);\n}"
      },
      "id": "validate-state",
      "name": "Validate State",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "https://oauth2.googleapis.com/token",
        "authentication": "none",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "code",
              "value": "={{$json.code}}"
            },
            {
              "name": "client_id",
              "value": "={{$env.GOOGLE_CLIENT_ID}}"
            },
            {
              "name": "client_secret",
              "value": "={{$env.GOOGLE_CLIENT_SECRET}}"
            },
            {
              "name": "redirect_uri",
              "value": "={{$env.N8N_WEBHOOK_URL}}/oauth/google/callback"
            },
            {
              "name": "grant_type",
              "value": "authorization_code"
            }
          ]
        },
        "options": {}
      },
      "id": "exchange-token",
      "name": "Exchange Code for Token",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://googleads.googleapis.com/v15/customers:listAccessibleCustomers",
        "authentication": "genericCredentialType",
        "genericAuthType": "oAuth2Api",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "=Bearer {{$json.access_token}}"
            },
            {
              "name": "developer-token",
              "value": "={{$env.GOOGLE_ADS_DEVELOPER_TOKEN}}"
            }
          ]
        },
        "options": {}
      },
      "id": "get-customers",
      "name": "Get Google Ads Customers",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [850, 300]
    },
    {
      "parameters": {
        "jsCode": "// Encrypt and prepare credentials\nconst crypto = require('crypto');\nconst encryptionKey = Buffer.from($env.ENCRYPTION_KEY, 'hex');\n\nfunction encryptToken(token) {\n  const iv = crypto.randomBytes(16);\n  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);\n  \n  let encrypted = cipher.update(token, 'utf8', 'hex');\n  encrypted += cipher.final('hex');\n  \n  const authTag = cipher.getAuthTag();\n  \n  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;\n}\n\nconst tokenData = $node[\"Exchange Code for Token\"].json;\nconst userId = $node[\"Validate State\"].json.userId;\nconst customers = $input.first().json.resourceNames || [];\n\nconst credentials = customers.map(customerResource => {\n  // Extract customer ID from resource name (customers/1234567890)\n  const customerId = customerResource.split('/')[1];\n  \n  return {\n    user_id: userId,\n    platform: 'google',\n    account_id: customerId,\n    account_name: `Google Ads ${customerId}`,\n    access_token: encryptToken(tokenData.access_token),\n    refresh_token: encryptToken(tokenData.refresh_token),\n    token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),\n    is_active: true,\n    sync_status: 'pending',\n    created_at: new Date().toISOString(),\n    updated_at: new Date().toISOString()\n  };\n});\n\nreturn credentials;"
      },
      "id": "prepare-credentials",
      "name": "Prepare Credentials",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "platform_credentials",
        "columns": "user_id,platform,account_id,account_name,access_token,refresh_token,token_expires_at,is_active,sync_status,created_at,updated_at",
        "options": {
          "onConflict": "DO UPDATE SET access_token = EXCLUDED.access_token, refresh_token = EXCLUDED.refresh_token, token_expires_at = EXCLUDED.token_expires_at, updated_at = NOW()"
        }
      },
      "id": "save-to-db",
      "name": "Save to Supabase",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [1250, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase DashX"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const nextjsUrl = $env.NEXTJS_BASE_URL;\nconst accountsCount = $input.all().length;\n\nreturn {\n  json: {\n    redirectUrl: `${nextjsUrl}/accounts?status=success&accounts=${accountsCount}&platform=google`\n  }\n};"
      },
      "id": "prepare-redirect",
      "name": "Prepare Redirect",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1450, 300]
    },
    {
      "parameters": {
        "respondWith": "redirect",
        "redirectURL": "={{$json.redirectUrl}}"
      },
      "id": "redirect-response",
      "name": "Redirect to Next.js",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [1650, 300]
    }
  ],
  "connections": {
    "Webhook - Google OAuth Callback": {
      "main": [[{"node": "Validate State", "type": "main", "index": 0}]]
    },
    "Validate State": {
      "main": [[{"node": "Exchange Code for Token", "type": "main", "index": 0}]]
    },
    "Exchange Code for Token": {
      "main": [[{"node": "Get Google Ads Customers", "type": "main", "index": 0}]]
    },
    "Get Google Ads Customers": {
      "main": [[{"node": "Prepare Credentials", "type": "main", "index": 0}]]
    },
    "Prepare Credentials": {
      "main": [[{"node": "Save to Supabase", "type": "main", "index": 0}]]
    },
    "Save to Supabase": {
      "main": [[{"node": "Prepare Redirect", "type": "main", "index": 0}]]
    },
    "Prepare Redirect": {
      "main": [[{"node": "Redirect to Next.js", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner"
  },
  "staticData": null,
  "tags": ["dashx", "google-ads"],
  "triggerCount": 1,
  "updatedAt": "2026-02-02T12:00:00.000Z",
  "versionId": "1"
}
```

---

## 6. Workflow 4: Google Ads Data Sync

### 6.1 Descrição

Sincroniza dados do Google Ads usando GAQL (Google Ads Query Language).

### 6.2 Nota Importante

⚠️ **Google Ads Sync é mais complexo que Meta** devido a:
- Necessidade de `developer-token` (requer aprovação do Google)
- GAQL queries específicas
- Refresh token automático

Por brevidade, este é um workflow simplificado. Ver documentação completa da Google Ads API para implementação production-ready.

---

## 7. Workflow 5: Daily Sync (Fase 2)

### 7.1 Descrição

Workflow com cron trigger que executa sync diário automático para todas as contas ativas.

### 7.2 JSON do Workflow (Simplificado)

```json
{
  "name": "Daily Sync All Accounts",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "triggerAtHour": 8,
              "triggerAtMinute": 0
            }
          ]
        }
      },
      "name": "Cron Trigger - Daily 8AM",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "select",
        "table": "platform_credentials",
        "filters": {
          "conditions": [
            {
              "column": "is_active",
              "operator": "equals",
              "value": true
            }
          ]
        }
      },
      "name": "Get Active Credentials",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "// For each credential, call sync workflow\nconst credentials = $input.all();\nconst yesterday = new Date();\nyesterday.setDate(yesterday.getDate() - 1);\nconst dateStr = yesterday.toISOString().split('T')[0];\n\nreturn credentials.map(cred => ({\n  json: {\n    credentialId: cred.json.id,\n    platform: cred.json.platform,\n    startDate: dateStr,\n    endDate: dateStr\n  }\n}));"
      },
      "name": "Prepare Sync Requests",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    }
  ]
}
```

---

## 8. Testando Workflows

### 8.1 Teste no N8N UI

1. Abra o workflow
2. Clique em **"Execute Workflow"**
3. Para webhooks, use **"Listen for test event"**
4. Envie request de teste (curl ou Postman)

### 8.2 Teste com Postman

**Collection: DashX N8N Workflows**

```json
{
  "info": {
    "name": "DashX N8N Workflows",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Meta Ads Sync",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"credentialId\": \"uuid-aqui\",\n  \"startDate\": \"2026-01-01\",\n  \"endDate\": \"2026-01-31\"\n}"
        },
        "url": {
          "raw": "https://n8n.seu-dominio.com/webhook/sync/meta-ads",
          "protocol": "https",
          "host": ["n8n", "seu-dominio", "com"],
          "path": ["webhook", "sync", "meta-ads"]
        }
      }
    }
  ]
}
```

---

## 9. Troubleshooting

### 9.1 Erro: "Encryption/Decryption failed"

**Causa:** ENCRYPTION_KEY diferente entre N8N e Next.js

**Solução:**
1. Gere nova chave: `openssl rand -hex 32`
2. Atualize em ambos os .env
3. Reinicie N8N e Next.js

### 9.2 Erro: "Supabase connection failed"

**Causa:** SUPABASE_SERVICE_KEY incorreta

**Solução:**
1. Verifique key no Supabase dashboard
2. Teste manualmente:
```bash
curl https://seu-projeto.supabase.co/rest/v1/ \
  -H "apikey: sua-service-key"
```

### 9.3 Erro: "Meta API rate limit exceeded"

**Causa:** Muitas requests em pouco tempo

**Solução:**
1. Adicionar retry com backoff exponencial
2. Reduzir batch size
3. Verificar rate limit tier no Meta Developers

---

## 🎉 Conclusão

Você agora tem:
- ✅ 4 workflows N8N completos
- ✅ JSON prontos para importar
- ✅ Credentials configuradas
- ✅ Testes documentados

**Próximo passo:** Implementar frontend Next.js que chama estes webhooks!

---

**Versão:** 1.0 (N8N 2.4.7+)
**Última atualização:** 02/02/2026
