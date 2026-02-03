import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | DashX",
  description: "Visão geral das suas campanhas de marketing",
};

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get campaign data summary
  const { data: campaignData } = await supabase
    .from('campaign_data')
    .select('*')
    .eq('user_id', user?.id);

  // Calculate metrics
  const totalSpend = campaignData?.reduce((sum, item) => sum + Number(item.spend || 0), 0) || 0;
  const totalClicks = campaignData?.reduce((sum, item) => sum + Number(item.clicks || 0), 0) || 0;
  const totalImpressions = campaignData?.reduce((sum, item) => sum + Number(item.impressions || 0), 0) || 0;
  const totalConversions = campaignData?.reduce((sum, item) => sum + Number(item.conversions || 0), 0) || 0;

  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;

  // Get connected accounts
  const { data: credentials } = await supabase
    .from('platform_credentials')
    .select('*')
    .eq('user_id', user?.id)
    .eq('is_active', true);

  const hasMetaAccount = credentials?.some(c => c.platform === 'meta');
  const hasGoogleAccount = credentials?.some(c => c.platform === 'google');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho das suas campanhas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar dados
          </Button>
          <Link href="/dashboard/reports/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo relatório
            </Button>
          </Link>
        </div>
      </div>

      {/* Connected Accounts Status */}
      {(!hasMetaAccount || !hasGoogleAccount) && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h3 className="font-semibold">Configure suas integrações</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {!hasMetaAccount && !hasGoogleAccount && "Conecte suas contas do Meta Ads e Google Ads para começar a visualizar dados."}
                {!hasMetaAccount && hasGoogleAccount && "Conecte sua conta do Meta Ads para visualizar dados completos."}
                {hasMetaAccount && !hasGoogleAccount && "Conecte sua conta do Google Ads para visualizar dados completos."}
              </p>
            </div>
            <Link href="/dashboard/accounts">
              <Button size="sm">Conectar contas</Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Investimento Total"
          value={totalSpend}
          format="currency"
          description="Total investido em campanhas"
          trend={0}
        />
        <MetricCard
          title="Cliques"
          value={totalClicks}
          format="number"
          description="Total de cliques recebidos"
          trend={0}
        />
        <MetricCard
          title="CTR Médio"
          value={avgCTR}
          format="percentage"
          description="Taxa de cliques média"
          trend={0}
        />
        <MetricCard
          title="CPC Médio"
          value={avgCPC}
          format="currency"
          description="Custo por clique médio"
          trend={0}
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
        {campaignData && campaignData.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Você tem {campaignData.length} registros de campanha no sistema.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum dado de campanha ainda.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Conecte suas contas e sincronize os dados para começar.
            </p>
            <Link href="/dashboard/accounts" className="mt-4">
              <Button>Conectar contas</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
