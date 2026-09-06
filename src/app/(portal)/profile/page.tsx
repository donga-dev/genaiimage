import { CopyField } from "@/components/CopyField";
import { ProfileForm } from "@/components/ProfileForm";
import { requireAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-brass">Workspace</p>
        <h1 className="serif mt-2 text-4xl gradient-text">Company profile</h1>
        <p className="mt-2 text-muted">
          This is your {BRAND.name} workspace. Credits you buy stay on this account.
        </p>
      </div>

      <section className="panel grid gap-4 rounded-[28px] p-6 md:grid-cols-2">
        <CopyField label="Workspace ID" value={admin.id} />
        <CopyField label="Workspace email" value={admin.email} />
        <Info label="Last purchase" value={admin.lastPurchaseDate ? formatDate(admin.lastPurchaseDate) : "—"} />
        <Info label="Current pack" value={admin.currentPlan?.name ?? "None"} />
      </section>

      <section className="panel rounded-[28px] p-6">
        <h2 className="serif mb-5 text-2xl">Edit details</h2>
        <ProfileForm admin={admin} />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 break-all">{value}</p>
    </div>
  );
}
