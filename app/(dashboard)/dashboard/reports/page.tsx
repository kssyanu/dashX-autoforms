import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Relatórios | DashX",
  description: "Gerencie seus relatórios de marketing",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e gere relatórios de suas campanhas
          </p>
        </div>
        <Link href="/dashboard/reports/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo relatório
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Em desenvolvimento</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A página de relatórios estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
