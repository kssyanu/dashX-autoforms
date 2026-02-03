import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Integrações | DashX",
  description: "Gerencie suas contas conectadas",
};

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte suas contas do Meta Ads e Google Ads
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meta Ads</CardTitle>
            <CardDescription>
              Conecte sua conta do Facebook/Instagram Ads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Conectar Meta Ads
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Ads</CardTitle>
            <CardDescription>
              Conecte sua conta do Google Ads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Conectar Google Ads
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
