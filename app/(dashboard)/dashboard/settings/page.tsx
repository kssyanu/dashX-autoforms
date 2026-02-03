import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações | DashX",
  description: "Configure sua conta e preferências",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Em desenvolvimento</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A página de configurações estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
