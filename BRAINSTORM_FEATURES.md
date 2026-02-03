# Brainstorm de Features - DashX Marketing Dashboard

**Data:** 31 de Janeiro de 2026
**Versão:** 1.0
**Objetivo:** Documentar ideias de features e user stories para o PRD

---

## 1. USER PERSONAS

### Persona 1: Maria - Social Media Manager de E-commerce
- **Idade:** 28 anos
- **Experiência:** 4 anos em marketing digital
- **Dor:** "Passo 2h por dia coletando dados de diferentes plataformas e criando relatórios no Excel"
- **Objetivo:** Automatizar relatórios para focar em estratégia
- **Habilidades Técnicas:** Intermediárias (sabe usar Meta Business Suite, mas não programa)
- **Necessidades:**
  - Relatórios de ROAS automáticos
  - Visão consolidada de Meta + Google Ads
  - Alertas quando performance cai

### Persona 2: João - Gestor de Tráfego Freelancer
- **Idade:** 32 anos
- **Experiência:** 6 anos em tráfego pago
- **Dor:** "Gerencio 15 contas de clientes, preciso de relatórios rápidos para reuniões"
- **Objetivo:** Relatórios profissionais em 1 clique
- **Habilidades Técnicas:** Avançadas (conhece APIs, mas não quer gastar tempo programando)
- **Necessidades:**
  - Templates de relatórios customizáveis
  - Exportar PDF com logo do cliente
  - Comparação mês a mês

### Persona 3: Ana - Proprietária de Agência de Marketing
- **Idade:** 38 anos
- **Experiência:** 10 anos (empreendedora)
- **Dor:** "Minha equipe gasta muito tempo em tarefas operacionais ao invés de estratégicas"
- **Objetivo:** Escalar agência com automação
- **Habilidades Técnicas:** Básicas (delega implementação técnica)
- **Necessidades:**
  - Multi-usuário (equipe de 5 pessoas)
  - Permissões de acesso
  - Dashboard executivo com ROI geral

---

## 2. USER STORIES - MVP

### 2.1 Autenticação e Setup

**US-001: Como usuário, quero criar uma conta rapidamente**
```gherkin
DADO que sou um novo usuário
QUANDO acesso a landing page e clico em "Começar Grátis"
ENTÃO devo ver um formulário com apenas Email, Senha e Nome
E devo receber um email de confirmação
E ser redirecionado para o dashboard após confirmar
```

**US-002: Como usuário, quero conectar minha conta Meta Ads facilmente**
```gherkin
DADO que estou logado no dashboard
QUANDO clico em "Conectar Meta Ads"
ENTÃO devo ser redirecionado para o OAuth do Facebook
E após autorizar, devo ver minhas contas de anúncios disponíveis
E poder selecionar quais contas quero gerenciar
```

**US-003: Como usuário, quero ver um checklist de setup**
```gherkin
DADO que sou um novo usuário
QUANDO acesso o dashboard pela primeira vez
ENTÃO devo ver um checklist:
  - [ ] Conectar Meta Ads
  - [ ] Conectar Google Ads
  - [ ] Conectar Instagram
  - [ ] Gerar primeiro relatório
E cada item deve ter um link direto para a ação
```

### 2.2 Relatórios Manuais

**US-004: Como gestor de tráfego, quero gerar relatório de Meta Ads por data**
```gherkin
DADO que tenho uma conta Meta Ads conectada
QUANDO acesso "Relatórios > Novo Relatório"
E seleciono:
  - Plataforma: Meta Ads
  - Tipo: Por Data Personalizada
  - Data Início: 01/01/2026
  - Data Fim: 31/01/2026
E clico em "Gerar Relatório"
ENTÃO devo ver um loading com estimativa de tempo
E após 20-30 segundos, ver o relatório completo com:
  - Resumo de métricas (cards): Gastos, Impressões, Cliques, CTR, CPC
  - Gráfico de gastos por dia
  - Tabela de campanhas com métricas detalhadas
E ter opção de "Exportar PDF"
```

**US-005: Como social media, quero comparar desempenho com período anterior**
```gherkin
DADO que estou visualizando um relatório de Meta Ads de Jan/2026
QUANDO ativo o toggle "Comparar com período anterior"
ENTÃO devo ver:
  - Métricas de Dez/2025 ao lado de Jan/2026
  - Variação percentual (ex: +15% ou -8%)
  - Indicador visual (verde para positivo, vermelho para negativo)
  - Gráfico com duas linhas (atual vs anterior)
```

**US-006: Como gestor, quero filtrar relatório por objetivo de campanha**
```gherkin
DADO que estou criando um relatório de Meta Ads
QUANDO seleciono "Filtrar por Objetivo"
E escolho "Conversões (E-commerce)"
ENTÃO devo ver apenas campanhas com objetivo de conversão
E as métricas devem incluir:
  - ROAS (Return on Ad Spend)
  - Valor de Conversão
  - Custo por Conversão
  - Taxa de Conversão
```

### 2.3 Dashboard Principal

**US-007: Como usuário, quero ver visão geral de todas as contas**
```gherkin
DADO que tenho Meta Ads e Google Ads conectados
QUANDO acesso o Dashboard
ENTÃO devo ver:
  - Cards de resumo com gastos totais dos últimos 30 dias
  - Gráfico de tendência de gastos (Meta vs Google)
  - Lista de "Top 5 Campanhas" por performance
  - Últimos relatórios gerados (com link para visualizar)
```

**US-008: Como gestor, quero personalizar período de visualização**
```gherkin
DADO que estou no Dashboard
QUANDO clico no filtro de data
E seleciono "Últimos 90 dias"
ENTÃO todos os cards e gráficos devem atualizar
E mostrar dados dos últimos 90 dias
E salvar minha preferência para próxima visita
```

### 2.4 Exportação e Compartilhamento

**US-009: Como freelancer, quero exportar relatório em PDF com meu logo**
```gherkin
DADO que tenho um relatório de Meta Ads aberto
QUANDO clico em "Exportar PDF"
ENTÃO devo ver modal com opções:
  - [ ] Incluir gráficos
  - [ ] Incluir tabela de campanhas
  - [ ] Adicionar logo personalizado (upload)
  - [ ] Adicionar notas/comentários
E após confirmar, baixar PDF profissional
```

**US-010: Como usuário, quero acessar histórico de relatórios**
```gherkin
DADO que já gerei 5 relatórios
QUANDO acesso "Relatórios > Histórico"
ENTÃO devo ver uma lista com:
  - Nome do relatório
  - Plataforma
  - Período
  - Data de geração
  - Ações: Visualizar, Baixar PDF, Deletar
E poder filtrar por plataforma e data
```

---

## 3. USER STORIES - FASE 2 (Automação)

### 3.1 Relatórios Automáticos

**US-011: Como gestor, quero agendar relatório semanal automático**
```gherkin
DADO que estou em "Automações > Nova Automação"
QUANDO configuro:
  - Nome: "Relatório Semanal de Meta Ads"
  - Plataforma: Meta Ads
  - Tipo: Por Data Personalizada (últimos 7 dias)
  - Frequência: Toda segunda-feira às 8h
  - Enviar email para: maria@exemplo.com
E clico em "Ativar Automação"
ENTÃO devo ver a automação ativa na lista
E receber o primeiro relatório na próxima segunda às 8h
E receber email com PDF anexado + link para dashboard
```

**US-012: Como social media, quero receber alertas de performance**
```gherkin
DADO que tenho campanhas de Meta Ads ativas
QUANDO configuro alerta:
  - Métrica: CPL (Custo por Lead)
  - Condição: Aumentar mais de 30%
  - Comparado com: Semana anterior
E uma campanha atende a condição
ENTÃO devo receber notificação:
  - Email imediato
  - Badge no dashboard
  - Detalhes: "Campanha X teve CPL de R$15 → R$22 (+47%)"
```

**US-013: Como usuário, quero pausar/retomar automação temporariamente**
```gherkin
DADO que tenho uma automação semanal ativa
QUANDO clico no toggle "Pausar"
ENTÃO a automação deve parar de executar
E eu devo ver o status "Pausada" na lista
E quando clicar em "Retomar", ela deve voltar ao cronograma normal
```

### 3.2 Relatórios por Objetivo

**US-014: Como gestor de e-commerce, quero relatório focado em ROAS**
```gherkin
DADO que estou criando relatório de Meta Ads
QUANDO seleciono "Objetivo: Conversões (E-commerce)"
ENTÃO o dashboard deve destacar:
  - ROAS total (card principal)
  - Gráfico de ROAS por campanha
  - Valor total de conversões
  - Produtos mais vendidos (se conectado com Shopify)
  - Recomendações: "Campanha X tem ROAS de 8.5, considere aumentar orçamento"
```

**US-015: Como gestor de leads, quero rastrear leads por canal**
```gherkin
DADO que tenho campanhas de leads (WhatsApp e Formulário)
QUANDO gero relatório de "Leads"
ENTÃO devo ver:
  - CPL médio por canal
  - Taxa de conversão (lead → cliente)
  - Gráfico de leads por dia
  - Qualidade de leads (se integrado com CRM)
```

### 3.3 Instagram Orgânico

**US-016: Como social media, quero acompanhar crescimento de seguidores**
```gherkin
DADO que conectei minha conta Instagram Business
QUANDO acesso "Relatórios > Instagram Orgânico"
ENTÃO devo ver:
  - Gráfico de crescimento de seguidores (últimos 30 dias)
  - Taxa de crescimento diária
  - Seguidores ganhos vs perdidos
  - Alcance e impressões
  - Engajamento médio por post
```

**US-017: Como criador, quero identificar melhores horários para postar**
```gherkin
DADO que tenho dados de pelo menos 30 posts
QUANDO acesso "Insights > Melhores Horários"
ENTÃO devo ver:
  - Heatmap de engajamento por hora/dia da semana
  - Recomendação: "Seus posts performam melhor às terças, 19h"
  - Comparação: posts no horário ideal vs fora do horário
```

---

## 4. USER STORIES - FASE 3 (Avançado)

### 4.1 Multi-usuário e Colaboração

**US-018: Como dona de agência, quero adicionar membros da equipe**
```gherkin
DADO que sou administradora da conta
QUANDO acesso "Configurações > Equipe"
E clico em "Convidar Membro"
E insiro email: joao@agencia.com
E seleciono permissão: "Editor"
ENTÃO João deve receber email de convite
E após aceitar, ter acesso a:
  - Visualizar todos os relatórios
  - Criar novos relatórios
  - Mas NÃO pode deletar contas conectadas
```

**US-019: Como membro da equipe, quero comentar em relatórios**
```gherkin
DADO que estou visualizando um relatório compartilhado
QUANDO clico em "Adicionar Comentário" em uma campanha específica
E escrevo: "CPL muito alto, vamos pausar esta campanha?"
ENTÃO outros membros devem ver o comentário
E o criador do relatório receber notificação
```

**US-020: Como gestor, quero criar workspaces separados por cliente**
```gherkin
DADO que gerencio 10 clientes diferentes
QUANDO acesso "Workspaces > Novo Workspace"
E crio: "Cliente A - Loja de Roupas"
E adiciono:
  - Conta Meta Ads do Cliente A
  - Conta Google Ads do Cliente A
ENTÃO devo poder alternar entre workspaces
E cada um ter dados isolados
E relatórios separados
```

### 4.2 Insights e Recomendações

**US-021: Como gestor, quero receber recomendações automáticas**
```gherkin
DADO que o sistema analisou meus dados dos últimos 30 dias
QUANDO acesso "Insights"
ENTÃO devo ver cards como:
  - "Campanha X tem CTR 50% acima da média, considere alocar mais orçamento"
  - "Seus anúncios performam melhor às terças e quartas, ajuste agendamento"
  - "CPL diminuiu 20% após mudança de criativo, continue testando variações"
```

**US-022: Como analista, quero comparar performance de campanhas A/B**
```gherkin
DADO que tenho 2 campanhas com mesmo objetivo
QUANDO acesso "Análise > Comparar Campanhas"
E seleciono:
  - Campanha A: "Criativo 1 - Vídeo"
  - Campanha B: "Criativo 2 - Imagem"
ENTÃO devo ver tabela comparativa:
  - CTR: Campanha A (3.2%) vs Campanha B (2.8%)
  - CPC: Campanha A (R$1.50) vs Campanha B (R$1.80)
  - Conversões: Campanha A (150) vs Campanha B (120)
E recomendação: "Campanha A está performando 25% melhor, considere pausar B"
```

---

## 5. FEATURES SECUNDÁRIAS (Nice to Have)

### 5.1 Personalização e White-label

**Feature:** Templates de Relatórios Customizáveis
- Permitir usuário criar layouts personalizados
- Arrastar e soltar widgets (gráficos, tabelas, cards)
- Salvar como template reutilizável
- Aplicar branding (cores, fontes, logo)

**Feature:** White-label para Agências
- Remover marca "DashX" dos relatórios
- URL personalizada (relatorios.minhaagencia.com)
- SMTP customizado para emails
- Plano Enterprise: $299/mês

### 5.2 Integrações Extras

**Feature:** Integração com CRM (RD Station, HubSpot)
- Rastrear qualidade de leads (lead → oportunidade → cliente)
- Calcular CAC (Custo de Aquisição de Cliente) real
- ROI considerando LTV (Lifetime Value)

**Feature:** Integração com E-commerce (Shopify, WooCommerce)
- Rastrear produtos mais vendidos por campanha
- ROAS em tempo real
- Alertas de estoque baixo em produtos anunciados

**Feature:** Integração com Google Analytics 4
- Comportamento de usuários no site
- Funil de conversão completo
- Atribuição multi-touch

### 5.3 Machine Learning e Previsões

**Feature:** Previsão de Performance
- Modelo ML treinado com dados históricos
- Prever gastos e conversões para próximos 7/30 dias
- Alertas: "Com orçamento atual, você atingirá 80% da meta do mês"

**Feature:** Detecção de Anomalias
- Algoritmo identifica padrões incomuns
- Alertas automáticos: "CTR caiu 60% nas últimas 6h, possível problema"
- Sugestões de ações corretivas

---

## 6. FEATURES DE INFRAESTRUTURA

### 6.1 Performance e Confiabilidade

**Feature:** Sistema de Filas (Bull/BullMQ)
- Processar relatórios pesados em background
- Retry automático em caso de falha
- Priorização de jobs (manual > automático)

**Feature:** Cache Inteligente (Redis)
- Cachear dados de APIs por 15 minutos
- Invalidação automática quando dados mudam
- Reduzir 80% das chamadas para Meta/Google APIs

**Feature:** Monitoring e Logs
- Sentry para error tracking
- Logs estruturados (Winston/Pino)
- Dashboard de saúde do sistema (Uptime, tempo de resposta)

### 6.2 Segurança

**Feature:** Auditoria de Ações
- Log de todas as ações críticas:
  - Login/Logout
  - Conexão/Desconexão de contas
  - Criação/Deleção de relatórios
  - Mudanças de permissões
- Disponível para administradores

**Feature:** 2FA (Two-Factor Authentication)
- Autenticação em dois fatores opcional
- Via app (Google Authenticator) ou SMS
- Obrigatório para contas Enterprise

**Feature:** IP Whitelisting (Enterprise)
- Permitir acesso apenas de IPs específicos
- Proteção extra para dados sensíveis

---

## 7. FLUXOS DE UX CRÍTICOS

### 7.1 Onboarding (Primeira Sessão)

```
1. Usuário se cadastra (email + senha)
   ↓
2. Recebe email de confirmação
   ↓
3. Confirma email → Redirecionado para Dashboard
   ↓
4. Ve modal de boas-vindas:
   "Bem-vindo ao DashX! Vamos conectar sua primeira conta."
   ↓
5. Checklist interativo:
   [ ] Conectar Meta Ads (botão destacado)
   [ ] Conectar Google Ads
   [ ] Gerar primeiro relatório
   ↓
6. Clica em "Conectar Meta Ads"
   ↓
7. OAuth Flow → Autoriza no Facebook
   ↓
8. Retorna ao DashX → Ve contas de anúncios disponíveis
   ↓
9. Seleciona contas → Clica em "Salvar"
   ↓
10. Ve mensagem de sucesso + próximo passo do checklist
    ↓
11. Clica em "Gerar Primeiro Relatório"
    ↓
12. Ve formulário simplificado (pré-preenchido com padrões):
    - Plataforma: Meta Ads ✓
    - Período: Últimos 7 dias ✓
    - Botão grande: "Gerar Meu Relatório"
    ↓
13. Loading 20-30s com mensagens motivacionais
    ↓
14. DASHBOARD COMPLETO! 🎉
    - Métricas destacadas
    - Gráficos coloridos
    - CTA: "Agendar este relatório para toda semana"
```

### 7.2 Geração de Relatório (Usuário Experiente)

```
1. Usuário acessa Dashboard
   ↓
2. Clica em "Novo Relatório" (botão flutuante no canto)
   ↓
3. Modal com atalhos:
   - "Relatório Meta Ads - Últimos 7 dias" [Mais usado]
   - "Relatório Google Ads - Mês atual"
   - "Instagram Orgânico - Últimos 30 dias"
   - "Personalizado..." (abre formulário completo)
   ↓
4. Clica em atalho → Gera imediatamente
   OU
   Clica em "Personalizado" → Formulário avançado
   ↓
5. Loading com opção de "Continuar navegando" (relatório em background)
   ↓
6. Notificação: "Seu relatório está pronto!" (com badge)
   ↓
7. Clica na notificação → Abre relatório
   ↓
8. Ve dashboard completo + opções:
   - Exportar PDF
   - Agendar automação
   - Compartilhar com equipe
```

---

## 8. WIREFRAMES CONCEITUAIS (Descrições)

### 8.1 Dashboard Principal

```
┌─────────────────────────────────────────────────────────┐
│  DashX Logo    [Dashboard] [Relatórios] [Automações]   │
│                                         [Avatar] [⚙️]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Bem-vindo, Maria! 👋                                   │
│  Últimos 30 dias ▼                      [+ Novo Relatório]│
│                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ Gastos     │ │ Impressões │ │ Cliques    │          │
│  │ R$ 15.320  │ │ 2.3M       │ │ 45.6k      │          │
│  │ +12% ▲    │ │ +8% ▲     │ │ -3% ▼     │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │ Gastos por Plataforma                       │       │
│  │ [Gráfico de linhas: Meta Ads vs Google]     │       │
│  │                                             │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  Top 5 Campanhas                                       │
│  ┌─────────────────────────────────────────────┐       │
│  │ 1. Campanha Black Friday - ROAS: 8.5 🔥      │       │
│  │ 2. Leads WhatsApp - CPL: R$12.50            │       │
│  │ 3. Engajamento Instagram - CTR: 4.2%        │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Tela de Criação de Relatório

```
┌─────────────────────────────────────────────────────────┐
│  Novo Relatório                            [X Fechar]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Plataforma *                                           │
│  ( ) Meta Ads  ( ) Google Ads  ( ) Instagram Orgânico   │
│                                                         │
│  Tipo de Relatório *                                    │
│  [Por Data Personalizada ▼]                            │
│                                                         │
│  Período *                                              │
│  [01/01/2026] até [31/01/2026]                         │
│  Atalhos: [7 dias] [30 dias] [Este mês] [Mês passado]  │
│                                                         │
│  Objetivo de Campanha (opcional)                        │
│  [Todos ▼]                                             │
│                                                         │
│  Métricas a Incluir                                     │
│  [x] Impressões    [x] Cliques      [x] Gastos          │
│  [x] CTR           [x] CPC          [x] Conversões      │
│  [ ] ROAS          [ ] CPL          [ ] Engajamento     │
│                                                         │
│  [ ] Comparar com período anterior                      │
│                                                         │
│         [Cancelar]        [Gerar Relatório →]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 8.3 Dashboard de Relatório Gerado

```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar    Relatório Meta Ads - Janeiro 2026          │
│              [Exportar PDF] [Agendar Automação] [...]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Resumo Executivo                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │Gastos│ │Impres│ │Clique│ │ CTR  │ │ CPC  │          │
│  │R$5.2k│ │850k  │ │18.5k │ │2.18% │ │R$0.28│          │
│  │+15%▲ │ │+12%▲ │ │-3%▼  │ │-13%▼ │ │+18%▲ │          │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                         │
│  Performance ao Longo do Tempo                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ [Gráfico de linha: Gastos/Cliques/Conversões]│       │
│  │                                             │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  Campanhas Detalhadas                                   │
│  [Buscar...] [Filtrar por objetivo ▼]                  │
│  ┌─────────────────────────────────────────────┐       │
│  │ Nome         │ Gastos │ Cliques │ CTR │ CPC  │       │
│  ├─────────────────────────────────────────────┤       │
│  │ Black Friday │ R$2.1k │ 8.5k   │3.2% │R$0.25│ [📊]  │
│  │ Leads WhatsApp│ R$1.5k│ 5.2k   │2.8% │R$0.29│ [📊]  │
│  │ ...                                         │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. PRIORIZAÇÃO DE FEATURES (MoSCoW)

### MUST HAVE (Essencial para MVP)
- ✅ Autenticação (login/cadastro)
- ✅ Conectar Meta Ads via OAuth
- ✅ Conectar Google Ads via OAuth
- ✅ Gerar relatório Meta Ads por data
- ✅ Gerar relatório Google Ads por data
- ✅ Dashboard com visão geral
- ✅ Exportar relatório em PDF
- ✅ Histórico de relatórios

### SHOULD HAVE (Importante, mas pode esperar)
- ⚠️ Conectar Instagram para dados orgânicos
- ⚠️ Relatórios por objetivo de campanha
- ⚠️ Comparação com período anterior
- ⚠️ Filtros avançados (por campanha, ad set)
- ⚠️ Gráficos interativos (zoom, tooltips)

### COULD HAVE (Bom ter, não urgente)
- 💡 Templates de relatórios
- 💡 Comentários em relatórios
- 💡 Compartilhar via link público
- 💡 Dark mode
- 💡 Notificações push

### WON'T HAVE (Não para MVP, futuro)
- ❌ Automações programadas → Fase 2
- ❌ Multi-usuário/workspaces → Fase 3
- ❌ White-label → Fase 3
- ❌ Integrações CRM/E-commerce → Fase 3
- ❌ Machine Learning → Fase 3+

---

## 10. CRITÉRIOS DE ACEITAÇÃO (QA)

### Para cada User Story, validar:

**Funcionalidade:**
- [ ] Feature funciona conforme especificado
- [ ] Edge cases tratados (ex: período sem dados)
- [ ] Mensagens de erro claras e acionáveis

**Performance:**
- [ ] Relatório gerado em <30 segundos
- [ ] Dashboard carrega em <3 segundos
- [ ] Gráficos renderizam suavemente (60fps)

**UX:**
- [ ] Fluxo intuitivo, sem fricção
- [ ] Loading states em todas as ações assíncronas
- [ ] Feedback visual em ações (sucesso/erro)
- [ ] Responsivo (mobile, tablet, desktop)

**Segurança:**
- [ ] Tokens OAuth armazenados criptografados
- [ ] Validação de inputs no frontend e backend
- [ ] Rate limiting em endpoints sensíveis
- [ ] HTTPS obrigatório

**Acessibilidade:**
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] Navegação por teclado funcional
- [ ] Labels em inputs para screen readers
- [ ] Textos alternativos em gráficos

---

## 11. MÉTRICAS DE SUCESSO POR FEATURE

### Autenticação
- **Meta:** 80% dos usuários completam onboarding em <5 minutos
- **Métrica:** Tempo médio de cadastro → conectar primeira conta

### Relatórios Manuais
- **Meta:** Usuário gera 3+ relatórios na primeira semana
- **Métrica:** Número de relatórios gerados/usuário/semana

### Dashboard
- **Meta:** 70% dos usuários acessam dashboard diariamente
- **Métrica:** DAU (Daily Active Users) / MAU (Monthly Active Users)

### Automações (Fase 2)
- **Meta:** 50% dos usuários ativam pelo menos 1 automação
- **Métrica:** Taxa de adoção de automações

### Exportação PDF
- **Meta:** 60% dos relatórios são exportados
- **Métrica:** Downloads de PDF / Relatórios gerados

---

## 12. NEXT STEPS (Ações Práticas)

### Antes de Desenvolver:
1. **Validar com 5 usuários beta:**
   - Mostrar wireframes
   - Perguntar sobre dores e necessidades
   - Ajustar features conforme feedback

2. **POC Técnico (1 semana):**
   - [ ] Testar OAuth Meta Ads no N8N
   - [ ] Criar workflow N8N que busca dados de campanha
   - [ ] Testar webhook N8N → Next.js
   - [ ] Validar geração de PDF com bibliotecas (ex: Puppeteer)

3. **Criar PRD Final:**
   - Usar este brainstorm + análise de viabilidade
   - Detalhar cada feature do MVP
   - Definir cronograma sprint por sprint

### Sprint 0 (Setup):
- [ ] Criar repositório Git
- [ ] Setup Next.js + TypeScript
- [ ] Setup PostgreSQL + Prisma
- [ ] Setup N8N (cloud ou self-hosted)
- [ ] Configurar CI/CD básico

---

**Documento complementar a:** `FEASIBILITY_ANALYSIS.md`
**Próximo documento:** `PRD.md` (Product Requirements Document)
