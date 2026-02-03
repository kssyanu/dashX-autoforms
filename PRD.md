# Product Requirements Document (PRD)
# DashX - Intelligent Marketing Dashboard

**Version:** 1.0
**Date:** 02 de Fevereiro de 2026
**Status:** Approved for Development
**Owner:** Agência Excalibur Ads

---

## 📋 Índice

1. [Executive Summary](#executive-summary)
2. [Product Vision & Goals](#product-vision--goals)
3. [User Personas](#user-personas)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Stack](#technical-stack)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [UI/UX Requirements](#uiux-requirements)
11. [Success Metrics](#success-metrics)
12. [Timeline & Milestones](#timeline--milestones)
13. [Risks & Assumptions](#risks--assumptions)
14. [Appendix](#appendix)

---

## 1. Executive Summary

### 1.1 Product Overview

**DashX** é uma plataforma de inteligência de marketing que centraliza, automatiza e analisa dados de campanhas do Meta Ads e Google Ads. Diferente de ferramentas tradicionais que apenas exibem dados, DashX foca em **automação de relatórios** e **insights acionáveis** para agências de marketing digital.

### 1.2 Problem Statement

**Problema Atual:**
- Agências gastam 2-4 horas/semana criando relatórios manualmente
- Dados dispersos entre Meta Ads Manager, Google Ads e planilhas
- Dificuldade em comparar performance entre plataformas
- Ausência de automação para relatórios recorrentes
- Dashboards genéricos não atendem objetivos específicos de campanha

**Solução DashX:**
- Centralização de dados em tempo real
- Geração automatizada de relatórios por objetivo de campanha
- Exportação de relatórios profissionais em PDF
- Dashboards personalizáveis por período e plataforma
- Integração via N8N para automações avançadas

### 1.3 Target Audience

**Primário:** Gestor de tráfego da Agência Excalibur Ads (uso pessoal MVP)
**Secundário (6-12 meses):** Agências de marketing digital (3-20 pessoas)
**Futuro:** Freelancers e profissionais de tráfego autônomos

### 1.4 Success Criteria

**MVP (8-10 semanas):**
- ✅ Conectar 2 contas (Meta Ads + Google Ads)
- ✅ Gerar 10+ relatórios manuais
- ✅ Economia de 2h/semana em processos manuais
- ✅ Tempo de geração de relatório < 30 segundos

**Fase 2 (SaaS - 6-12 meses):**
- ✅ 10+ organizações ativas
- ✅ 50+ relatórios automatizados/mês
- ✅ NPS > 8/10

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> "Transformar dados de marketing em decisões estratégicas, eliminando trabalho manual e entregando insights automáticos que impulsionam resultados."

### 2.2 Product Goals

**Curto Prazo (MVP - 10 semanas):**
1. Automatizar 100% dos relatórios manuais da Agência Excalibur
2. Centralizar dados de Meta Ads e Google Ads em único dashboard
3. Reduzir tempo de análise de campanhas em 60%

**Médio Prazo (Fase 2 - 6 meses):**
4. Adicionar relatórios automáticos programados (diário/semanal/mensal)
5. Integrar crescimento orgânico do Instagram
6. Implementar alertas inteligentes de performance

**Longo Prazo (Fase 3 - 12 meses):**
7. Escalar para modelo SaaS multi-tenant
8. Adicionar 5+ integrações (TikTok, LinkedIn, Shopify)
9. Implementar IA para recomendações de otimização

### 2.3 Key Differentiators

| Feature | DashX | Supermetrics | Looker Studio | Meta Ads Manager |
|---------|-------|--------------|---------------|------------------|
| **Automação de Relatórios** | ✅ N8N workflows | ⚠️ Limitado | ❌ | ❌ |
| **Multi-plataforma** | ✅ Meta + Google | ✅ | ✅ | ❌ |
| **Relatórios por Objetivo** | ✅ Conversões, Leads, Engajamento | ❌ | ⚠️ Manual | ⚠️ Parcial |
| **PDF Automático** | ✅ | ❌ | ⚠️ Via screenshot | ❌ |
| **Custo** | $0 (self-hosted MVP) | $69-239/mês | Grátis (limitado) | Grátis |
| **Customização** | ✅✅✅ Total | ⚠️ Limitado | ⚠️ Limitado | ❌ |

---

## 3. User Personas

### 3.1 Persona Primária: Lucas - Gestor de Tráfego

**Dados Demográficos:**
- Idade: 28 anos
- Cargo: Gestor de Tráfego Pago na Agência Excalibur Ads
- Experiência: 4 anos em marketing digital
- Localização: Brasil

**Contexto:**
- Gerencia 8-12 contas de clientes simultaneamente
- Cria relatórios semanais para cada cliente (2-3h/semana)
- Usa Meta Ads Manager, Google Ads e planilhas Excel
- Precisa justificar resultados e otimizar campanhas

**Objetivos:**
- Reduzir tempo gasto em relatórios
- Ter visão unificada de todas as campanhas
- Identificar rapidamente campanhas com baixa performance
- Demonstrar ROI para clientes de forma profissional

**Frustrations:**
- Alternar entre múltiplas plataformas para coletar dados
- Erros manuais ao copiar métricas para planilhas
- Relatórios genéricos não capturam objetivos específicos
- Falta de histórico consolidado de campanhas

**User Journey:**
1. Segunda-feira, 9h: Abre DashX e vê dashboard consolidado
2. Filtra por cliente e período (últimos 7 dias)
3. Identifica campanha com CPL 30% acima do ideal
4. Gera relatório detalhado da campanha
5. Exporta PDF e envia para cliente em 5 minutos

### 3.2 Persona Secundária: Carla - Diretora de Agência

**Dados Demográficos:**
- Idade: 35 anos
- Cargo: Diretora da Agência Excalibur Ads
- Experiência: 10 anos em marketing
- Localização: Brasil

**Contexto:**
- Supervisiona 3 gestores de tráfego
- Precisa de visão macro de todas as contas
- Participa de reuniões estratégicas com clientes
- Tomadora de decisão sobre renovação de contratos

**Objetivos:**
- Visão consolidada de performance de todos os clientes
- Relatórios automáticos semanais por email
- Comparação de resultados mês a mês
- Provar valor da agência para retenção de clientes

**Frustrations:**
- Depende de gestores para ter visão geral
- Dados desatualizados em reuniões com clientes
- Dificuldade em comparar performance entre clientes
- Falta de previsibilidade sobre renovações

---

## 4. User Stories

### 4.1 Epic 1: Autenticação e Onboarding

**US-001: Criar Conta**
**Como** novo usuário
**Quero** criar uma conta com email e senha
**Para** acessar o DashX de forma segura

**Critérios de Aceitação:**
- [ ] Formulário de cadastro com email, nome completo e senha
- [ ] Validação: email válido, senha mínima 8 caracteres
- [ ] Confirmação de email (opcional no MVP)
- [ ] Redirecionamento automático para dashboard após cadastro
- [ ] Mensagem de boas-vindas

**US-002: Login**
**Como** usuário existente
**Quero** fazer login com minhas credenciais
**Para** acessar meu dashboard

**Critérios de Aceitação:**
- [ ] Formulário com email e senha
- [ ] Validação de credenciais via Supabase Auth
- [ ] Mensagem de erro clara se credenciais inválidas
- [ ] Opção "Esqueci minha senha" (opcional MVP)
- [ ] Redirecionamento para /dashboard após login

**US-003: Wizard de Onboarding**
**Como** novo usuário
**Quero** ser guiado pelos primeiros passos
**Para** configurar minha conta rapidamente

**Critérios de Aceitação:**
- [ ] Modal com checklist de onboarding:
  - [ ] Conectar Meta Ads
  - [ ] Conectar Google Ads
  - [ ] Gerar primeiro relatório
- [ ] Progresso visual (0%, 33%, 66%, 100%)
- [ ] Opção "Pular tutorial"
- [ ] Pode ser reaberto em Settings

---

### 4.2 Epic 2: Conexão de Contas

**US-004: Conectar Meta Ads via OAuth**
**Como** gestor de tráfego
**Quero** conectar minha conta do Meta Ads
**Para** sincronizar dados de campanhas automaticamente

**Critérios de Aceitação:**
- [ ] Botão "Conectar Meta Ads" na página /accounts
- [ ] Redirecionamento para OAuth do Facebook
- [ ] Callback processado pelo N8N workflow
- [ ] Lista de ad accounts disponíveis exibida
- [ ] Usuário seleciona qual ad account conectar
- [ ] Credenciais salvas criptografadas no Supabase
- [ ] Confirmação visual de conexão bem-sucedida
- [ ] Card da conta aparece em "Contas Conectadas"

**Fluxo Detalhado:**
```
1. Usuário clica "Conectar Meta Ads"
2. Frontend gera state parameter (encrypted userId + nonce)
3. Redirect para: https://facebook.com/v19.0/dialog/oauth
4. Usuário autoriza permissões (ads_read, ads_management)
5. Facebook redireciona para N8N: /webhook/oauth/meta/callback?code=...&state=...
6. N8N valida state, troca code por access_token
7. N8N busca ad accounts do usuário
8. N8N salva credentials no Supabase (encrypted)
9. N8N redireciona para frontend: /accounts?status=success
10. Frontend exibe mensagem de sucesso
```

**US-005: Conectar Google Ads via OAuth**
**Como** gestor de tráfego
**Quero** conectar minha conta do Google Ads
**Para** visualizar campanhas do Google junto com Meta

**Critérios de Aceitação:**
- [ ] Similar ao US-004, mas com OAuth do Google
- [ ] Permissões: Google Ads API read access
- [ ] Suporte a múltiplas contas Google Ads (MCC)
- [ ] Validação de customer ID do Google Ads

**US-006: Visualizar Contas Conectadas**
**Como** usuário
**Quero** ver todas as minhas contas conectadas
**Para** gerenciar minhas integrações

**Critérios de Aceitação:**
- [ ] Página /accounts lista todas as contas
- [ ] Card por conta com:
  - Plataforma (Meta/Google)
  - Nome da conta
  - Account ID
  - Status da conexão (ativa/inativa)
  - Data da última sincronização
  - Botão "Sincronizar Agora"
  - Botão "Desconectar"
- [ ] Badge de status (verde = ativa, vermelho = token expirado)
- [ ] Botão "Adicionar Nova Conta"

**US-007: Desconectar Conta**
**Como** usuário
**Quero** remover uma conta conectada
**Para** revogar acesso aos meus dados

**Critérios de Aceitação:**
- [ ] Botão "Desconectar" em cada card de conta
- [ ] Modal de confirmação: "Tem certeza? Dados históricos serão mantidos."
- [ ] Ao confirmar, credential marcada como `is_active: false`
- [ ] Access token revogado na plataforma (Meta/Google)
- [ ] Card removido da lista

---

### 4.3 Epic 3: Sincronização de Dados

**US-008: Sincronizar Dados Manualmente**
**Como** gestor de tráfego
**Quero** forçar uma sincronização de dados
**Para** ter informações atualizadas no dashboard

**Critérios de Aceitação:**
- [ ] Botão "Sincronizar Dados" no dashboard
- [ ] Loading state durante sincronização (spinner + texto)
- [ ] Chamada para N8N webhook: POST /webhook/sync/meta-ads
- [ ] N8N busca dados dos últimos 30 dias (padrão)
- [ ] Dados inseridos na tabela `campaign_data`
- [ ] Atualização automática do dashboard via Tanstack Query
- [ ] Toast notification: "Dados sincronizados com sucesso"
- [ ] Timestamp "Última sincronização: há 2 minutos"

**Fluxo Técnico:**
```
1. Usuário clica "Sincronizar Dados"
2. Frontend: POST /api/sync/meta
   Body: { credentialId, startDate, endDate }
3. API Route valida session + params
4. API Route: POST ${N8N_URL}/webhook/sync/meta-ads
5. N8N busca credentials do Supabase
6. N8N chama Meta Graph API: /act_{account_id}/insights
7. N8N processa e calcula métricas (CTR, CPC, ROAS)
8. N8N insere em `campaign_data` (batch insert)
9. N8N retorna: { success: true, campaignsUpdated: 15 }
10. API Route retorna para frontend
11. Tanstack Query invalida cache
12. Dashboard recarrega com novos dados
```

**US-009: Ver Status de Sincronização**
**Como** usuário
**Quero** saber quando meus dados foram atualizados pela última vez
**Para** confiar nas métricas exibidas

**Critérios de Aceitação:**
- [ ] Badge no header do dashboard: "Última atualização: há 10 minutos"
- [ ] Se sync em andamento: spinner + "Sincronizando..."
- [ ] Se erro: ícone de alerta + "Falha na sincronização"
- [ ] Tooltip com detalhes ao passar mouse

---

### 4.4 Epic 4: Dashboard Principal

**US-010: Visualizar KPIs Principais**
**Como** gestor de tráfego
**Quero** ver métricas principais em cards destacados
**Para** ter visão rápida de performance

**Critérios de Aceitação:**
- [ ] 5 KPI cards no topo do dashboard:
  1. **Total Gasto:** R$ 12.540,00 (↑ 8% vs período anterior)
  2. **Impressões:** 850.000 (↓ 3%)
  3. **Cliques:** 18.500 (↑ 12%)
  4. **CTR:** 2,18% (↑ 0,3pp)
  5. **CPC:** R$ 0,68 (↓ R$ 0,05)
- [ ] Cada card mostra:
  - Valor atual
  - Comparação com período anterior (%, absoluto)
  - Indicador visual (↑ verde, ↓ vermelho, — cinza)
- [ ] Valores formatados (moeda BRL, percentual, números abreviados)
- [ ] Skeleton loader enquanto carrega

**US-011: Filtrar por Período**
**Como** usuário
**Quero** selecionar período de análise
**Para** ver dados de diferentes intervalos de tempo

**Critérios de Aceitação:**
- [ ] Date range picker no header do dashboard
- [ ] Opções rápidas:
  - Últimos 7 dias
  - Últimos 30 dias
  - Últimos 90 dias
  - Este mês
  - Mês passado
  - Personalizado (calendário)
- [ ] Ao selecionar, todos os dados do dashboard atualizam
- [ ] URL atualiza com query params: ?from=2026-01-01&to=2026-01-31
- [ ] Loading state durante fetch de novos dados

**US-012: Filtrar por Plataforma**
**Como** usuário
**Quero** filtrar dados por plataforma
**Para** analisar Meta e Google separadamente

**Critérios de Aceitação:**
- [ ] Tabs ou select: "Todas", "Meta Ads", "Google Ads"
- [ ] Ao selecionar, KPIs e gráficos filtram automaticamente
- [ ] URL atualiza: ?platform=meta
- [ ] Badge mostrando filtro ativo

**US-013: Visualizar Gráfico de Performance**
**Como** gestor de tráfego
**Quero** ver evolução de métricas ao longo do tempo
**Para** identificar tendências e anomalias

**Critérios de Aceitação:**
- [ ] Line chart (Recharts) com:
  - Eixo X: Data (granularidade diária/semanal/mensal)
  - Eixo Y: Métrica selecionada
  - Linhas: Meta (azul), Google (verde)
- [ ] Selector de métrica:
  - Gasto
  - Impressões
  - Cliques
  - CTR
  - CPC
- [ ] Tooltip ao passar mouse mostrando valores exatos
- [ ] Legenda com cores da plataforma
- [ ] Responsivo (mobile mostra versão simplificada)

**US-014: Ver Top Campanhas**
**Como** gestor de tráfego
**Quero** ver quais campanhas performam melhor
**Para** priorizar otimizações

**Critérios de Aceitação:**
- [ ] Tabela "Top 10 Campanhas" ordenada por:
  - ROAS (padrão)
  - Gasto
  - Conversões
  - CTR
- [ ] Colunas:
  - Nome da Campanha
  - Plataforma (badge Meta/Google)
  - Gasto
  - Impressões
  - Cliques
  - Conversões
  - CTR
  - CPC
  - ROAS
- [ ] Badge de objetivo (Conversões, Leads, Engajamento)
- [ ] Paginação se >10 campanhas
- [ ] Ordenação por coluna (clique no header)

---

### 4.5 Epic 5: Geração de Relatórios

**US-015: Criar Relatório Personalizado**
**Como** gestor de tráfego
**Quero** gerar um relatório de campanha
**Para** analisar resultados de um período específico

**Critérios de Aceitação:**
- [ ] Página /reports/new com formulário:
  - Nome do Relatório (ex: "Performance Meta Ads - Janeiro 2026")
  - Plataforma (Meta Ads, Google Ads, Ambas)
  - Período (date picker)
  - Objetivo de Campanha (opcional):
    - Conversões (E-commerce)
    - Leads - WhatsApp
    - Leads - Formulário
    - Engajamento
    - Todos
- [ ] Botão "Gerar Relatório"
- [ ] Validação:
  - Nome obrigatório
  - Data início < data fim
  - Período máximo: 365 dias
- [ ] Loading state: "Gerando relatório..."
- [ ] Ao completar: redirect para /reports/[id]

**Fluxo Técnico:**
```
1. Usuário preenche formulário e clica "Gerar"
2. Frontend valida campos
3. POST /api/reports/generate
   Body: {
     reportName: "Performance Meta Ads - Janeiro",
     platform: "meta",
     periodStart: "2026-01-01",
     periodEnd: "2026-01-31",
     campaignObjective: "conversions"
   }
4. API Route:
   a. Valida session
   b. Cria registro em `reports` (status: pending)
   c. Chama N8N: POST /webhook/sync/meta-ads
   d. Aguarda resposta do N8N
   e. Atualiza report (status: completed, summary_metrics)
   f. Retorna reportId
5. Frontend redirect para /reports/{reportId}
```

**US-016: Visualizar Relatório Gerado**
**Como** usuário
**Quero** ver detalhes do relatório criado
**Para** analisar métricas consolidadas

**Critérios de Aceitação:**
- [ ] Página /reports/[id] mostra:
  - **Header:**
    - Nome do relatório
    - Data de criação
    - Período analisado
    - Plataforma(s)
    - Status (Concluído, Processando, Erro)
  - **Resumo Executivo:**
    - Cards com métricas principais (mesmo estilo do dashboard)
    - Comparação com período anterior (opcional)
  - **Gráficos:**
    - Performance ao longo do tempo
    - Distribuição de gasto por campanha (pie chart)
  - **Tabela de Campanhas:**
    - Todas as campanhas do período
    - Ordenação e filtros
  - **Ações:**
    - Botão "Exportar PDF"
    - Botão "Compartilhar" (futuro)
    - Botão "Gerar Novamente"
- [ ] Se status = "processando": loading spinner
- [ ] Se status = "erro": mensagem de erro + botão "Tentar Novamente"

**US-017: Exportar Relatório em PDF**
**Como** gestor de tráfego
**Quero** baixar relatório em PDF
**Para** enviar para clientes ou guardar offline

**Critérios de Aceitação:**
- [ ] Botão "Exportar PDF" na página do relatório
- [ ] PDF gerado com:
  - **Capa:**
    - Logo da agência
    - Nome do relatório
    - Período
    - Data de geração
  - **Resumo Executivo:**
    - Métricas principais em formato tabela
  - **Gráfico de Performance:**
    - Imagem do line chart
  - **Tabela de Campanhas:**
    - Top 20 campanhas formatadas
  - **Rodapé:**
    - "Gerado por DashX em DD/MM/YYYY"
    - Número de página
- [ ] PDF salvo no Supabase Storage
- [ ] Link de download retornado
- [ ] Browser baixa PDF automaticamente
- [ ] Toast: "PDF gerado com sucesso"
- [ ] Tempo de geração < 10 segundos

**Fluxo Técnico:**
```
1. Usuário clica "Exportar PDF"
2. Frontend: GET /api/reports/[id]/pdf
3. API Route:
   a. Busca dados do relatório no Supabase
   b. Renderiza PDF com @react-pdf/renderer
   c. Salva no Supabase Storage: /reports/report-{id}.pdf
   d. Atualiza report.pdf_url
   e. Retorna PDF URL
4. Frontend inicia download
```

**US-018: Ver Histórico de Relatórios**
**Como** usuário
**Quero** ver todos os relatórios que já criei
**Para** acessar análises anteriores

**Critérios de Aceitação:**
- [ ] Página /reports lista todos os relatórios
- [ ] Tabela com colunas:
  - Nome do Relatório
  - Plataforma (badge)
  - Período
  - Data de Criação
  - Status
  - Ações (Visualizar, Download PDF, Deletar)
- [ ] Filtros:
  - Pesquisa por nome
  - Plataforma
  - Período de criação
- [ ] Ordenação por data (mais recentes primeiro)
- [ ] Paginação (10 relatórios por página)
- [ ] Empty state se nenhum relatório criado

---

### 4.6 Epic 6: Configurações

**US-019: Editar Perfil**
**Como** usuário
**Quero** atualizar minhas informações
**Para** manter meu perfil atualizado

**Critérios de Aceitação:**
- [ ] Página /settings/profile com campos:
  - Nome completo
  - Email (read-only)
  - Avatar (upload opcional)
- [ ] Botão "Salvar Alterações"
- [ ] Validação de nome (mínimo 3 caracteres)
- [ ] Toast de sucesso ao salvar
- [ ] Atualização na tabela `profiles`

**US-020: Alterar Senha**
**Como** usuário
**Quero** trocar minha senha
**Para** manter minha conta segura

**Critérios de Aceitação:**
- [ ] Formulário em /settings/profile:
  - Senha Atual
  - Nova Senha (mínimo 8 caracteres)
  - Confirmar Nova Senha
- [ ] Validação:
  - Senhas coincidem
  - Força da senha (mínimo médio)
- [ ] Supabase Auth atualiza senha
- [ ] Toast de confirmação
- [ ] Logout automático (usuário faz login novamente)

---

## 5. Functional Requirements

### 5.1 Autenticação e Autorização

**FR-001: Sistema de Autenticação**
- Sistema deve usar Supabase Auth para gerenciar usuários
- Suporte a email/password (OAuth social opcional futuro)
- Sessions gerenciadas via JWT tokens
- Tokens expiram em 24 horas (refresh automático)

**FR-002: Controle de Acesso**
- Todas as rotas /dashboard/* requerem autenticação
- Middleware Next.js valida session antes de renderizar
- API routes validam JWT em cada request
- Redirecionamento para /login se não autenticado

**FR-003: Multi-tenancy (Fase 3)**
- Schema preparado com `organization_id` em todas as tabelas
- Row Level Security (RLS) do Supabase para isolar dados
- Queries filtram automaticamente por organization_id

---

### 5.2 Integrações OAuth

**FR-004: Meta Ads OAuth**
- Fluxo OAuth 2.0 padrão do Facebook
- Permissões solicitadas: `ads_read`, `ads_management`
- State parameter com timestamp para CSRF protection
- Tokens armazenados criptografados (AES-256-GCM)
- Refresh automático de tokens antes de expirarem

**FR-005: Google Ads OAuth**
- OAuth 2.0 com Google Cloud Platform
- Permissões: Google Ads API read access
- Suporte a múltiplas contas (MCC - My Client Center)
- Tokens criptografados no banco

**FR-006: Revogação de Acesso**
- Ao desconectar conta, revogar tokens na plataforma
- Dados históricos mantidos (soft delete)
- Usuário pode reconectar mesma conta depois

---

### 5.3 Sincronização de Dados

**FR-007: Sync via N8N Workflows**
- N8N gerencia todas as chamadas às APIs de terceiros
- Frontend nunca chama APIs diretamente (segurança)
- N8N processa, transforma e armazena dados no Supabase

**FR-008: Estrutura de Dados**
- Dados armazenados na tabela `campaign_data`
- Granularidade: 1 registro por campanha por dia
- Métricas calculadas: CTR, CPC, CPM, CPL, ROAS
- Raw data (JSON) armazenado para auditoria

**FR-009: Sincronização Manual**
- Usuário pode forçar sync via botão "Sincronizar"
- Cooldown de 5 minutos entre syncs manuais (rate limiting)
- Sync busca últimos 30 dias por padrão

**FR-010: Sincronização Automática (Fase 2)**
- Cron job diário às 8h (horário de Brasília)
- Busca dados do dia anterior para todas as contas ativas
- Alertas por email se sync falhar

---

### 5.4 Dashboard e Visualizações

**FR-011: KPI Cards**
- Cálculo em tempo real baseado em filtros ativos
- Agregação de dados de múltiplas campanhas
- Comparação com período anterior (mesma duração)
- Cache de 15 minutos (Tanstack Query)

**FR-012: Filtros Globais**
- Filtro de período persiste na URL (query params)
- Filtro de plataforma aplica a todos os widgets
- Estado de filtros salvo em Zustand (client state)

**FR-013: Gráficos Interativos**
- Biblioteca Recharts para visualizações
- Tooltips com valores formatados
- Zoom e pan em gráficos de linha
- Exportação de gráfico como imagem (opcional)

**FR-014: Tabelas de Dados**
- Ordenação por qualquer coluna
- Paginação client-side (se <1000 registros)
- Paginação server-side (se >1000 registros)
- Busca por nome de campanha

---

### 5.5 Geração de Relatórios

**FR-015: Criação de Relatórios**
- Relatórios gerados assincronamente
- Status tracking: pending → processing → completed/failed
- N8N busca dados frescos (não apenas do cache)
- Tempo de geração: <30s para 30 dias de dados

**FR-016: Armazenamento de Relatórios**
- Metadados em tabela `reports`
- Métricas agregadas em campo `summary_metrics` (JSONB)
- Histórico ilimitado (com possibilidade de retenção futura)

**FR-017: Exportação de PDF**
- Template profissional com logo customizável
- Geração server-side (Next.js API route)
- Armazenamento no Supabase Storage
- URLs assinadas com expiração de 7 dias

**FR-018: Relatórios por Objetivo**
- Filtro por campaign objective (Meta Ads field)
- Métricas customizadas por objetivo:
  - **Conversões:** ROAS, CPA, Taxa de Conversão
  - **Leads:** CPL, Taxa de Formulário Preenchido
  - **Engajamento:** CPE, Taxa de Engajamento

---

### 5.6 N8N Workflows

**FR-019: Workflow - Meta OAuth Connection**
- Recebe callback do Facebook OAuth
- Valida state parameter
- Troca code por access_token
- Busca ad accounts do usuário
- Salva credentials criptografadas
- Redireciona usuário para frontend

**FR-020: Workflow - Meta Ads Sync**
- Recebe webhook do Next.js
- Busca credentials do Supabase
- Chama Meta Graph API `/insights`
- Calcula métricas derivadas
- Insere em `campaign_data` (batch)
- Retorna resumo de métricas

**FR-021: Workflow - Google Ads Sync**
- Similar ao FR-020
- Usa Google Ads API (GAQL queries)
- Normaliza dados para mesmo schema

**FR-022: Workflow - Daily Sync (Fase 2)**
- Cron trigger diário às 8h
- Busca todas as contas ativas
- Executa sync para cada uma
- Envia email de resumo
- Loga erros no Supabase

---

## 6. Non-Functional Requirements

### 6.1 Performance

**NFR-001: Tempo de Carregamento**
- Dashboard inicial: < 3 segundos (3G)
- Transições de página: < 1 segundo
- API responses: < 500ms (p95)
- Geração de relatório: < 30 segundos (30 dias de dados)

**NFR-002: Otimizações**
- Code splitting automático (Next.js)
- Lazy loading de componentes pesados
- Image optimization (next/image)
- Prefetch de links visíveis

**NFR-003: Caching**
- Tanstack Query cache: 15 minutos (stale time)
- Supabase Postgrest cache: 5 minutos
- CDN cache para assets estáticos: 1 ano

---

### 6.2 Segurança

**NFR-004: Autenticação**
- Senhas hasheadas com bcrypt (Supabase padrão)
- JWT tokens com secret rotacionável
- HTTPS obrigatório (TLS 1.3)
- CSRF protection (Vercel automático)

**NFR-005: Criptografia de Dados**
- Access tokens OAuth criptografados com AES-256-GCM
- Encryption key de 32 bytes armazenada em env vars
- Tokens em trânsito via HTTPS
- Backup de banco criptografado (Supabase)

**NFR-006: Rate Limiting**
- 10 requests/10s por usuário (Upstash Redis)
- 100 requests/dia para sync manual
- 429 status code se exceder limites

**NFR-007: Validação de Entrada**
- Zod schemas para validação de formulários
- Sanitização de SQL injection (Supabase automático)
- Escape de XSS (React automático)

---

### 6.3 Usabilidade

**NFR-008: Responsividade**
- Mobile-first design
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly (botões mínimo 44x44px)
- Testes em Chrome, Safari, Firefox

**NFR-009: Acessibilidade**
- WCAG 2.1 Level AA compliance
- Navegação via teclado
- Screen reader friendly (ARIA labels)
- Contraste mínimo 4.5:1

**NFR-010: Feedback de Usuário**
- Loading states em todas as ações async
- Toast notifications para confirmações
- Error messages claras e acionáveis
- Empty states com call-to-action

---

### 6.4 Escalabilidade

**NFR-011: Database**
- Supabase PostgreSQL escala até 8GB (tier Pro)
- Indexes em colunas mais consultadas
- Particionamento futuro se >10M registros

**NFR-012: Frontend**
- Vercel Edge Functions para API routes
- Automatic scaling (serverless)
- 100GB bandwidth/mês (tier Pro)

**NFR-013: N8N**
- Self-hosted em VPS (controle total)
- Pode escalar verticalmente (CPU/RAM)
- Queue system se >100 execuções simultâneas

---

### 6.5 Confiabilidade

**NFR-014: Uptime**
- Target: 99.5% uptime
- Monitoramento com UptimeRobot
- Alertas via email se downtime >5min

**NFR-015: Error Handling**
- Sentry para tracking de erros
- Error boundaries em React
- Graceful degradation (mostrar dados cached)

**NFR-016: Backup**
- Supabase backup diário automático
- Point-in-time recovery (até 7 dias)
- Export manual de workflows N8N

---

### 6.6 Manutenibilidade

**NFR-017: Code Quality**
- TypeScript strict mode
- ESLint + Prettier
- Comentários em funções complexas
- README atualizado

**NFR-018: Testing**
- Unit tests para funções críticas (70% coverage)
- E2E tests com Playwright (happy paths)
- Manual QA antes de cada deploy

**NFR-019: Documentação**
- JSDoc em funções públicas
- API documentation (endpoints)
- User guide (screenshots)
- N8N workflows documentados

---

## 7. Technical Stack

### 7.1 Frontend

```yaml
Framework: Next.js 14.2+ (App Router)
Language: TypeScript 5.3+
UI Library: shadcn/ui (Radix UI + Tailwind)
Styling: Tailwind CSS 3.4+
State Management:
  - Tanstack Query v5 (server state)
  - Zustand 4.x (client state)
Charts: Recharts 2.x
Forms: React Hook Form 7.x + Zod
PDF: @react-pdf/renderer
Date: date-fns
Icons: Lucide React
```

### 7.2 Backend

```yaml
Database: Supabase PostgreSQL 15+
Auth: Supabase Auth (managed)
Storage: Supabase Storage (PDFs)
Automation: N8N (self-hosted)
API: Next.js API Routes (Edge Runtime)
```

### 7.3 Infrastructure

```yaml
Hosting Frontend: Vercel
Hosting N8N: VPS (self-hosted)
Database: Supabase (managed)
Monitoring: Sentry + UptimeRobot
Analytics: Vercel Analytics
```

### 7.4 Third-Party APIs

```yaml
Meta Marketing API: v19.0+
Google Ads API: v15+
Instagram Graph API: v19.0 (Fase 2)
```

### 7.5 Development Tools

```yaml
Version Control: Git + GitHub
Package Manager: npm
Linting: ESLint + Prettier
Testing: Playwright (E2E), Jest (Unit)
CI/CD: GitHub Actions + Vercel
```

---

## 8. Database Schema

### 8.1 Tabelas Principais

#### **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  organization_id UUID, -- NULL no MVP, FK em Phase 3
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_org ON profiles(organization_id)
  WHERE organization_id IS NOT NULL;
```

#### **platform_credentials**
```sql
CREATE TABLE platform_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID, -- Multi-tenant ready

  platform VARCHAR(50) NOT NULL, -- 'meta', 'google'
  account_id VARCHAR(255) NOT NULL,
  account_name VARCHAR(255),

  -- Encrypted tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform, account_id)
);

CREATE INDEX idx_credentials_user_platform
  ON platform_credentials(user_id, platform);
CREATE INDEX idx_credentials_active
  ON platform_credentials(user_id, is_active)
  WHERE is_active = true;
```

#### **reports**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID,
  credential_id UUID REFERENCES platform_credentials(id) ON DELETE SET NULL,

  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'meta_ads', 'google_ads', 'combined'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  campaign_objective VARCHAR(100), -- 'conversions', 'leads', 'engagement', null

  summary_metrics JSONB NOT NULL DEFAULT '{}',
  -- { "total_spend": 5200.50, "total_impressions": 850000, ... }

  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,

  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,

  is_automated BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_user_created
  ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_status
  ON reports(status)
  WHERE status != 'completed';
```

#### **campaign_data**
```sql
CREATE TABLE campaign_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID,
  credential_id UUID NOT NULL REFERENCES platform_credentials(id) ON DELETE CASCADE,

  platform VARCHAR(50) NOT NULL,
  campaign_id VARCHAR(255) NOT NULL,
  campaign_name VARCHAR(255),
  campaign_objective VARCHAR(100),

  date DATE NOT NULL,

  -- Core metrics
  impressions BIGINT DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend DECIMAL(12, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(12, 2) DEFAULT 0,

  -- Calculated metrics
  ctr DECIMAL(5, 2), -- Click-through rate
  cpc DECIMAL(10, 2), -- Cost per click
  cpm DECIMAL(10, 2), -- Cost per 1000 impressions
  cpl DECIMAL(10, 2), -- Cost per lead
  roas DECIMAL(10, 2), -- Return on ad spend

  raw_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform, campaign_id, date)
);

CREATE INDEX idx_campaign_data_user_date
  ON campaign_data(user_id, date DESC);
CREATE INDEX idx_campaign_data_platform
  ON campaign_data(platform);
CREATE INDEX idx_campaign_data_campaign
  ON campaign_data(campaign_id, date DESC);
```

### 8.2 Funções de Cálculo

```sql
-- Function to calculate CTR
CREATE OR REPLACE FUNCTION calculate_ctr(p_clicks INTEGER, p_impressions BIGINT)
RETURNS DECIMAL(5, 2) AS $$
BEGIN
  IF p_impressions = 0 THEN RETURN 0; END IF;
  RETURN ROUND((p_clicks::DECIMAL / p_impressions) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate CPC
CREATE OR REPLACE FUNCTION calculate_cpc(p_spend DECIMAL, p_clicks INTEGER)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  IF p_clicks = 0 THEN RETURN 0; END IF;
  RETURN ROUND(p_spend / p_clicks, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate ROAS
CREATE OR REPLACE FUNCTION calculate_roas(p_conversion_value DECIMAL, p_spend DECIMAL)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  IF p_spend = 0 THEN RETURN 0; END IF;
  RETURN ROUND(p_conversion_value / p_spend, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 9. API Endpoints

### 9.1 Authentication

```
POST /api/auth/signup
Body: { email, password, fullName }
Response: { user: {...}, session: {...} }

POST /api/auth/login
Body: { email, password }
Response: { user: {...}, session: {...} }

POST /api/auth/logout
Response: { success: true }
```

### 9.2 Platform Credentials

```
GET /api/accounts
Response: { accounts: [...] }

GET /api/connect/meta
Redirect to Meta OAuth

GET /api/connect/google
Redirect to Google OAuth

DELETE /api/accounts/:credentialId
Response: { success: true }
```

### 9.3 Data Sync

```
POST /api/sync/meta
Body: { credentialId, startDate, endDate }
Response: { success: true, campaignsUpdated: 15, summary: {...} }

POST /api/sync/google
Body: { credentialId, startDate, endDate }
Response: { success: true, campaignsUpdated: 8, summary: {...} }

GET /api/sync/status/:credentialId
Response: { status: "syncing", lastSyncedAt: "..." }
```

### 9.4 Dashboard

```
GET /api/dashboard/kpis
Query: ?from=2026-01-01&to=2026-01-31&platform=meta
Response: {
  totalSpend: 12540.50,
  totalImpressions: 850000,
  totalClicks: 18500,
  avgCtr: 2.18,
  avgCpc: 0.68,
  comparison: { ... }
}

GET /api/dashboard/chart
Query: ?from=...&to=...&metric=spend&platform=all
Response: {
  data: [
    { date: "2026-01-01", meta: 520.30, google: 340.20 },
    ...
  ]
}

GET /api/dashboard/top-campaigns
Query: ?from=...&to=...&orderBy=roas&limit=10
Response: {
  campaigns: [...]
}
```

### 9.5 Reports

```
POST /api/reports/generate
Body: {
  reportName: "Performance Janeiro",
  platform: "meta",
  periodStart: "2026-01-01",
  periodEnd: "2026-01-31",
  campaignObjective: "conversions"
}
Response: { reportId: "...", status: "processing" }

GET /api/reports
Query: ?page=1&limit=10&platform=meta
Response: {
  reports: [...],
  total: 45,
  page: 1,
  pages: 5
}

GET /api/reports/:id
Response: { report: {...}, campaigns: [...] }

GET /api/reports/:id/pdf
Response: PDF file download

DELETE /api/reports/:id
Response: { success: true }
```

### 9.6 User Profile

```
GET /api/user/profile
Response: { profile: {...} }

PATCH /api/user/profile
Body: { fullName, avatarUrl }
Response: { profile: {...} }

POST /api/user/change-password
Body: { currentPassword, newPassword }
Response: { success: true }
```

---

## 10. UI/UX Requirements

### 10.1 Design System

**Color Palette:**
```css
/* Dark Theme (Default) */
--background: #0A0A0A (Interstellar Black)
--foreground: #FAFAFA
--card: #18181B (Zinc 900)
--card-foreground: #FAFAFA
--primary: #3B82F6 (Blue 500)
--primary-foreground: #FFFFFF
--secondary: #27272A (Zinc 800)
--accent: #22D3EE (Cyan 400)
--destructive: #EF4444 (Red 500)
--border: #27272A
--muted: #71717A (Zinc 500)

/* Light Theme (Opcional) */
--background: #FFFFFF
--foreground: #0A0A0A
--card: #F4F4F5 (Zinc 100)
```

**Typography:**
```css
font-family: 'Inter', 'Geist Sans', sans-serif
font-sizes:
  - text-xs: 12px
  - text-sm: 14px
  - text-base: 16px
  - text-lg: 18px
  - text-xl: 20px
  - text-2xl: 24px
  - text-3xl: 30px
```

**Spacing:**
```
Baseado em múltiplos de 4px
1 = 4px
2 = 8px
3 = 12px
4 = 16px
6 = 24px
8 = 32px
```

### 10.2 Component Library

**shadcn/ui Components a Instalar:**
- Button
- Card
- Input
- Label
- Select
- Table
- Tabs
- Badge
- Dialog
- Dropdown Menu
- Skeleton
- Toast
- Avatar
- Calendar
- Popover

### 10.3 Layout Structure

**Sidebar Navigation (Desktop):**
```
┌─────────────┬────────────────────────────┐
│ Logo        │ Header (User Menu)         │
│             │                            │
│ Dashboard   │                            │
│ Reports     │      Main Content          │
│ Accounts    │                            │
│ Settings    │                            │
│             │                            │
│             │                            │
│ [User]      │                            │
└─────────────┴────────────────────────────┘
```

**Mobile Navigation:**
- Hamburger menu (top-left)
- Bottom navigation bar (opcional)
- Drawer lateral para menu

### 10.4 Loading States

**Skeleton Loaders:**
- KPI cards: 5 skeleton cards
- Chart: shimmer effect
- Table: 10 skeleton rows

**Spinners:**
- Button loading: spinner dentro do botão
- Page loading: centered spinner + texto

### 10.5 Empty States

**Dashboard sem dados:**
```
🔌 Nenhuma conta conectada
Conecte sua primeira conta do Meta Ads ou Google Ads
[Conectar Meta Ads] [Conectar Google Ads]
```

**Reports sem histórico:**
```
📊 Nenhum relatório criado
Crie seu primeiro relatório para começar
[Criar Relatório]
```

### 10.6 Error States

**Erro de conexão:**
```
⚠️ Falha ao conectar com Meta Ads
Sua sessão expirou. Reconecte sua conta.
[Reconectar]
```

**Erro genérico:**
```
❌ Algo deu errado
Tente novamente ou entre em contato com suporte.
[Tentar Novamente]
```

---

## 11. Success Metrics

### 11.1 MVP Metrics (8-10 semanas)

**Product Metrics:**
- ✅ 2+ contas conectadas (1 Meta, 1 Google)
- ✅ 20+ relatórios gerados
- ✅ 5+ usuários beta ativos
- ✅ 90%+ uptime

**Performance Metrics:**
- ✅ Tempo de geração de relatório: < 30s (p95)
- ✅ Dashboard load time: < 3s (3G)
- ✅ API response time: < 500ms (p95)

**Quality Metrics:**
- ✅ 0 bugs críticos
- ✅ 70%+ code coverage (unit tests)
- ✅ 100% critical paths E2E tested

### 11.2 User Engagement Metrics

**Weekly Active Users (WAU):**
- Target: 5 WAU no primeiro mês
- Target: 10 WAU após 3 meses

**Report Generation Rate:**
- Target: 3+ relatórios/usuário/semana

**Retention:**
- Day 7 retention: >60%
- Day 30 retention: >40%

### 11.3 Business Metrics

**Time Saved:**
- Baseline: 2-4h/semana em relatórios manuais
- Target: 60% redução (economia de 1.5-2.5h/semana)

**NPS (Net Promoter Score):**
- Target: >8/10

**Customer Satisfaction:**
- Target: 90%+ de usuários satisfeitos ou muito satisfeitos

---

## 12. Timeline & Milestones

### 12.1 Fase 1: MVP (8-10 semanas)

#### **Sprint 1-2: Foundation (Semanas 1-2)**

**Semana 1:**
- [x] Setup projeto Next.js 14
- [x] Configurar Supabase (Auth + DB)
- [x] Criar schema inicial (migrations)
- [x] Setup shadcn/ui + Tailwind
- [x] Configurar ESLint + Prettier

**Semana 2:**
- [x] Implementar autenticação (login/signup)
- [x] Layout principal (sidebar + header)
- [x] Middleware de autenticação
- [x] Página de perfil
- [x] Deploy inicial (Vercel staging)

**Deliverables:**
- ✅ Projeto inicializado e deployado
- ✅ Usuário pode criar conta e fazer login
- ✅ Layout básico funcional

---

#### **Sprint 3-4: OAuth Integrations (Semanas 3-4)**

**Semana 3:**
- [x] Workflow N8N: Meta OAuth connection
- [x] API route: /api/connect/meta
- [x] Página: /accounts/connect/meta
- [x] Testar fluxo OAuth completo
- [x] Salvar credentials no Supabase

**Semana 4:**
- [x] Workflow N8N: Google OAuth connection
- [x] API route: /api/connect/google
- [x] Página: /accounts lista contas conectadas
- [x] Botão "Desconectar conta"
- [x] Status de sincronização

**Deliverables:**
- ✅ Usuário pode conectar Meta Ads via OAuth
- ✅ Usuário pode conectar Google Ads via OAuth
- ✅ Página de contas conectadas funcional

---

#### **Sprint 5-6: Data Sync & Reports (Semanas 5-6)**

**Semana 5:**
- [x] Workflow N8N: Meta Ads sync
- [x] Workflow N8N: Google Ads sync
- [x] API routes: /api/sync/meta, /api/sync/google
- [x] Botão "Sincronizar Dados" no dashboard
- [x] Inserir dados na tabela campaign_data

**Semana 6:**
- [x] Formulário: /reports/new
- [x] API route: /api/reports/generate
- [x] Workflow N8N: Report generation
- [x] Página: /reports/:id (visualizar relatório)
- [x] Página: /reports (histórico)

**Deliverables:**
- ✅ Sincronização manual de dados funcional
- ✅ Geração de relatórios personalizada
- ✅ Visualização de relatórios

---

#### **Sprint 7-8: Dashboard & Charts (Semanas 7-8)**

**Semana 7:**
- [x] KPI cards (5 métricas principais)
- [x] API route: /api/dashboard/kpis
- [x] Filtro de período (date picker)
- [x] Filtro de plataforma (tabs)
- [x] Comparação com período anterior

**Semana 8:**
- [x] Gráfico de performance (Recharts)
- [x] API route: /api/dashboard/chart
- [x] Tabela "Top Campanhas"
- [x] API route: /api/dashboard/top-campaigns
- [x] Responsividade mobile

**Deliverables:**
- ✅ Dashboard principal completo
- ✅ KPIs, gráficos e tabelas funcionais
- ✅ Filtros aplicados em tempo real

---

#### **Sprint 9-10: PDF Export & Polish (Semanas 9-10)**

**Semana 9:**
- [x] Implementar @react-pdf/renderer
- [x] Template de PDF profissional
- [x] API route: /api/reports/:id/pdf
- [x] Salvar PDF no Supabase Storage
- [x] Botão "Exportar PDF" funcional

**Semana 10:**
- [x] Onboarding wizard (modal)
- [x] Empty states em todas as páginas
- [x] Loading states (skeletons + spinners)
- [x] Error handling e toast notifications
- [x] E2E tests (Playwright)
- [x] Deploy produção
- [x] Convidar 5 beta users

**Deliverables:**
- ✅ Exportação de PDF funcional
- ✅ UX polida (loading, errors, empty states)
- ✅ MVP em produção
- ✅ 5 beta users testando

---

### 12.2 Fase 2: Automations (4-6 semanas após MVP)

**Features:**
- Relatórios automáticos programados (cron)
- Email notifications
- Instagram organic growth tracking
- Performance alerts
- Comparação avançada de períodos

**Timeline:** Semanas 11-16

---

### 12.3 Fase 3: Multi-tenant (4 semanas após Fase 2)

**Features:**
- Tabela `organizations`
- Backfill `organization_id`
- Row Level Security (RLS)
- Team member invitations
- Role-based permissions
- Billing integration (Stripe)

**Timeline:** Semanas 17-20

---

## 13. Risks & Assumptions

### 13.1 Risks

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Meta/Google API rate limits** | Média | Alto | Cache agressivo, batch requests, sync diário |
| **N8N downtime** | Baixa | Alto | Health checks, graceful degradation, workflows versionados |
| **OAuth token expiration** | Média | Médio | Refresh automático, alertas ao usuário |
| **Supabase vendor lock-in** | Média | Médio | Abstraction layer, workflows versionados no Git |
| **Mudanças nas APIs** | Baixa | Alto | Monitorar changelogs, testes automatizados |
| **Escalabilidade de custos** | Média | Médio | Monitorar uso, otimizar queries, migrar para self-hosted se necessário |

### 13.2 Assumptions

**Technical:**
- ✅ N8N self-hosted está configurado e acessível
- ✅ Meta App está verificado e OAuth funcional
- ✅ Google Cloud Project com Google Ads API habilitada
- ✅ VPS tem recursos suficientes para N8N (2GB RAM mínimo)

**Product:**
- ✅ Usuário primário (Agência Excalibur) validará MVP
- ✅ Relatórios manuais são suficientes para MVP
- ✅ Multi-tenancy pode ser adicionado depois (6-12 meses)
- ✅ PDF básico é aceitável (não precisa design complexo)

**Business:**
- ✅ Projeto é uso pessoal inicialmente (sem necessidade de pagamento)
- ✅ SaaS é plano de 6-12 meses (não urgente)
- ✅ 5-10 beta users serão suficientes para validação

### 13.3 Dependencies

**External:**
- Supabase (uptime >99.9%)
- Meta Marketing API (stable)
- Google Ads API (stable)
- Vercel (uptime >99.9%)

**Internal:**
- N8N self-hosted (responsabilidade do usuário)
- VPS com IP estático (para webhooks)
- SSL certificate válido no N8N

---

## 14. Appendix

### 14.1 Glossary

**Ad Account:** Conta de anúncios na plataforma (Meta ou Google)
**Campaign:** Campanha publicitária com objetivo específico
**CTR (Click-Through Rate):** Taxa de cliques (cliques/impressões * 100)
**CPC (Cost Per Click):** Custo por clique
**CPL (Cost Per Lead):** Custo por lead
**ROAS (Return on Ad Spend):** Retorno sobre investimento em anúncios
**Sync:** Sincronização de dados das APIs para o banco
**Webhook:** Endpoint HTTP que recebe notificações de eventos
**OAuth:** Protocolo de autenticação delegada
**RLS (Row Level Security):** Segurança nível de linha no PostgreSQL

### 14.2 Reference Links

**APIs:**
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Google Ads API](https://developers.google.com/google-ads/api/docs/start)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

**Tech Stack:**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [N8N Docs](https://docs.n8n.io)
- [shadcn/ui](https://ui.shadcn.com)
- [Tanstack Query](https://tanstack.com/query)

**Design:**
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

### 14.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-02 | PRD inicial criado | Claude + Agência Excalibur |

---

**Aprovações:**

| Stakeholder | Role | Signature | Date |
|-------------|------|-----------|------|
| Agência Excalibur Ads | Product Owner | ✅ Aprovado | 2026-02-02 |

---

**Próximos Passos:**
1. ✅ Criar repositório Git
2. ✅ Setup projeto Next.js
3. ✅ Configurar Supabase
4. ✅ Configurar variáveis de ambiente N8N
5. ✅ Iniciar Sprint 1 (Foundation)
