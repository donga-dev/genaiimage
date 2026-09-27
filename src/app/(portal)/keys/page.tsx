import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiKeysPanel } from "@/components/ApiKeysPanel";
import { getSessionPayload, requireAdmin } from "@/lib/auth";
import { listWorkspaceKeys } from "@/lib/portal-cache";

export default async function ApiKeysPage() {
  const session = await getSessionPayload();
  if (!session) redirect("/login");
  const [, keys] = await Promise.all([requireAdmin(), listWorkspaceKeys(session.adminId)]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-brass sm:text-sm">API keys</p>
        <h1 className="serif mt-2 text-3xl gradient-text md:text-4xl">Your keys</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
          Generate a key, copy it once, and paste it in your product. Endpoints are on{" "}
          <Link href="/docs" className="text-brass hover:underline">
            API docs
          </Link>
          .
        </p>
      </div>

      <section className="panel rounded-[22px] p-4 md:rounded-[28px] md:p-6">
        <ApiKeysPanel initialKeys={keys} />
      </section>
    </div>
  );
}
