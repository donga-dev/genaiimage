import type { Metadata } from "next";
import { ApiDocs } from "@/components/ApiDocs";
import { AppShell } from "@/components/AppShell";
import { PublicHeader } from "@/components/PublicHeader";
import { getCurrentAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `API docs — ${BRAND.name}`,
  description: "Generate image and check workspace credits with your API key.",
};

export default async function DocsPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    return (
      <AppShell admin={admin}>
        <ApiDocs />
      </AppShell>
    );
  }

  return (
    <div className="min-h-dvh">
      <PublicHeader active="docs" />
      <main className="px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-12 lg:py-10">
        <ApiDocs />
      </main>
    </div>
  );
}
