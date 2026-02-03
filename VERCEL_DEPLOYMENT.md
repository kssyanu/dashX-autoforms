# Guia de Deploy - Vercel

## 🚀 Deploy Automático via Vercel Dashboard

### 1. Importar Projeto do GitHub

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta GitHub (se ainda não estiver conectada)
3. Selecione o repositório **kssyanu/dashX-autoforms**
4. Clique em "Import"

### 2. Configurar Variáveis de Ambiente

Na tela de configuração do projeto, adicione as seguintes variáveis de ambiente:

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### N8N
```
N8N_WEBHOOK_URL=https://seu-n8n.com
N8N_API_KEY=sua-api-key
```

#### Meta (Facebook)
```
META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
```

#### Google
```
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

#### Encryption
```
ENCRYPTION_KEY=sua-chave-de-32-bytes-hex
```

#### App URL (será gerado pela Vercel)
```
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
```

> **Nota**: A variável `NEXT_PUBLIC_APP_URL` pode ser configurada após o primeiro deploy, quando você souber a URL final.

### 3. Configurações do Build

A Vercel detecta automaticamente as configurações do Next.js, mas você pode verificar:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (ou `next build`)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install`
- **Node Version**: 20.x (automático)

### 4. Deploy

Clique em **Deploy** e aguarde o build completar (~2-3 minutos).

---

## 🔄 Deploy via CLI (Alternativa)

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

```bash
# Deploy de preview (staging)
vercel

# Deploy de produção
vercel --prod
```

### 4. Adicionar variáveis de ambiente

```bash
# Via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# ... repita para todas as variáveis

# Ou via dashboard: https://vercel.com/<seu-user>/<projeto>/settings/environment-variables
```

---

## ✅ Pós-Deploy

### 1. Atualizar URLs de Callback

Depois do primeiro deploy, atualize as URLs de callback nos seus provedores OAuth:

#### Meta App (Facebook Developer Console)

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Selecione seu app
3. Vá em **Settings > Basic**
4. Em **App Domains**, adicione: `seu-projeto.vercel.app`
5. Em **Products > Facebook Login > Settings**:
   - **Valid OAuth Redirect URIs**: `https://seu-projeto.vercel.app/api/auth/callback/meta`

#### Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Selecione seu projeto
3. Vá em **APIs & Services > Credentials**
4. Edite seu OAuth 2.0 Client ID
5. Em **Authorized redirect URIs**, adicione: `https://seu-projeto.vercel.app/api/auth/callback/google`

#### N8N Webhooks

Atualize as URLs de callback no N8N:

- Meta OAuth: `https://seu-n8n.com/webhook/oauth/meta/callback`
- Google OAuth: `https://seu-n8n.com/webhook/oauth/google/callback`

### 2. Atualizar NEXT_PUBLIC_APP_URL

1. Vá em [Vercel Dashboard > Seu Projeto > Settings > Environment Variables](https://vercel.com)
2. Edite `NEXT_PUBLIC_APP_URL`
3. Mude de `http://localhost:3000` para `https://seu-projeto.vercel.app`
4. Salve e faça um novo deploy

### 3. Testar Autenticação

1. Acesse `https://seu-projeto.vercel.app`
2. Clique em "Cadastre-se"
3. Crie uma conta de teste
4. Faça login
5. Verifique se o dashboard carrega corretamente

---

## 🔧 Configurações Adicionais (Opcional)

### Custom Domain

1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS records conforme instruções da Vercel
4. Aguarde propagação (~24-48h)

### Preview Deployments

Cada push em branches que não sejam `main` cria um preview deployment automaticamente.

URL do preview: `https://seu-projeto-<branch>-<user>.vercel.app`

### Environment Variables por Ambiente

Você pode ter variáveis diferentes para:
- **Production**: Deploy da branch `main`
- **Preview**: Deploy de outras branches
- **Development**: Variáveis locais (não usadas na Vercel)

### Logs e Monitoring

Acesse os logs em tempo real:
- **Dashboard**: [Vercel Dashboard > Seu Projeto > Deployments](https://vercel.com)
- **CLI**: `vercel logs <deployment-url>`

---

## 🚨 Troubleshooting

### Build Failed

**Erro**: `Module not found: Can't resolve '@/...'`

**Solução**: Verificar `tsconfig.json` e `paths` mapping.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Environment Variables não carregam

**Problema**: Variáveis `NEXT_PUBLIC_*` não estão disponíveis no client.

**Solução**:
1. Verificar se o nome começa com `NEXT_PUBLIC_`
2. Fazer um novo deploy após adicionar variáveis
3. Verificar no Network tab do DevTools se o valor está correto

### Supabase Connection Error

**Erro**: `Failed to fetch user` ou `Invalid API key`

**Solução**:
1. Verificar se `NEXT_PUBLIC_SUPABASE_URL` está correto
2. Verificar se `NEXT_PUBLIC_SUPABASE_ANON_KEY` é o **anon key** (não service role)
3. Verificar se o projeto Supabase está ativo

### Redirect Loop no Login

**Problema**: Usuário fica em loop entre `/login` e `/dashboard`

**Solução**:
1. Limpar cookies do navegador
2. Verificar middleware em [middleware.ts](middleware.ts)
3. Verificar se `NEXT_PUBLIC_APP_URL` está correto

---

## 📊 Performance Tips

### Edge Runtime (Opcional)

Para melhor performance global, você pode usar Edge Runtime em algumas rotas:

```typescript
// app/api/some-route/route.ts
export const runtime = 'edge'
```

### ISR (Incremental Static Regeneration)

Para páginas que não mudam frequentemente:

```typescript
// app/dashboard/page.tsx
export const revalidate = 60 // revalidate a cada 60 segundos
```

### Image Optimization

Next.js otimiza imagens automaticamente, mas você pode configurar:

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}
```

---

## 🔐 Segurança

### Environment Variables

- ✅ **NUNCA** commite variáveis de ambiente no Git
- ✅ Use `NEXT_PUBLIC_*` apenas para dados públicos
- ✅ Service keys devem ser variáveis privadas (sem `NEXT_PUBLIC_`)

### Headers de Segurança

A Vercel adiciona headers de segurança automaticamente, mas você pode customizar:

```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}
```

---

## 📈 Monitoramento

### Vercel Analytics

Habilite analytics gratuitamente:

1. Vá em **Settings > Analytics**
2. Clique em "Enable"
3. Instale o pacote:

```bash
npm install @vercel/analytics
```

4. Adicione no `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Speed Insights

Para métricas de performance:

```bash
npm install @vercel/speed-insights
```

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 🎯 Checklist Final

Antes de marcar como "deploy completo":

- [ ] Build passou sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] `NEXT_PUBLIC_APP_URL` atualizado com URL de produção
- [ ] OAuth callbacks atualizados (Meta + Google)
- [ ] Teste de cadastro funciona
- [ ] Teste de login funciona
- [ ] Dashboard carrega corretamente
- [ ] Custom domain configurado (opcional)
- [ ] Analytics habilitado (opcional)

---

## 🆘 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

Criado por Claude Code - DashX v0.1.0
