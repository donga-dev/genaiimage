import { CopyField } from "@/components/CopyField";
import { ProfileForm } from "@/components/ProfileForm";
import { requireAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6 md:space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-brass sm:text-sm">Workspace</p>
        <h1 className="serif mt-2 text-3xl gradient-text md:text-4xl">Company profile</h1>
        <p className="mt-2 text-sm leading-6 text-muted md:text-base">
          This is your {BRAND.name} workspace. Credits you buy stay on this account.
        </p>
      </div>

      <section className="panel grid gap-4 rounded-[22px] p-4 md:grid-cols-2 md:rounded-[28px] md:p-6">
        <CopyField label="Workspace ID" value={admin.id} />
        <CopyField label="Workspace email" value={admin.email} />
        <Info label="Last purchase" value={admin.lastPurchaseDate ? formatDate(admin.lastPurchaseDate) : "—"} />
        <Info label="Current pack" value={admin.currentPlan?.name ?? "None"} />
      </section>

      <section className="panel rounded-[22px] p-4 md:rounded-[28px] md:p-6">
        <h2 className="serif mb-5 text-xl md:text-2xl">Edit details</h2>
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
