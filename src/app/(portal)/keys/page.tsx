import { ApiKeysPanel } from "@/components/ApiKeysPanel";
import { requireAdmin } from "@/lib/auth";
import { serializeApiToken } from "@/lib/api-tokens";
import { connectDB } from "@/lib/db";
import { ApiToken } from "@/models/ApiToken";

export default async function ApiKeysPage() {
  const admin = await requireAdmin();
  await connectDB();
  const keys = await ApiToken.find({ adminId: admin.id, revokedAt: null }).sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">API keys</p>
        <h1 className="serif mt-2 text-4xl gradient-text">Your keys</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Generate a key, copy it once, and paste it in your product. That is all this page is for.
        </p>
      </div>

      <section className="panel rounded-[28px] p-6">
        <ApiKeysPanel initialKeys={keys.map((key) => serializeApiToken(key))} />
      </section>
    </div>
  );
}
