import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AppShell admin={admin}>{children}</AppShell>;
}
