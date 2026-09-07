import { Logo } from "@/components/Logo";
import { ChatPreview } from "@/components/ChatPreview";
import { BRAND } from "@/lib/brand";

const capabilities = ["Image generate"];

export function AuthLanding({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      <header className="relative z-10 flex items-center justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-12">
        <Logo />
        <p className="hidden text-sm text-muted sm:block">Buy AI credits in one workspace</p>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-88px)] max-w-7xl items-center gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:pb-16">
        <section className="hidden lg:block">
          <p className="text-sm uppercase tracking-[0.22em] text-brass">Image generate</p>
          <h1 className="serif mt-4 max-w-xl text-6xl leading-[1.05]">
            Think. Generate.
            <br />
            <span className="gradient-text">Pay as you create.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted">
            {BRAND.name} is where your company buys credits. Sign in, purchase a pack, and every
            image generate uses one credit.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {capabilities.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-10 max-w-xl">
            <ChatPreview />
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            <Mini stat="1 credit" label="per image generate" />
            <Mini stat="Razorpay" label="secure checkout" />
            <Mini stat="No lock-in" label="packs, not plans" />
          </div>
        </section>

        <section className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
          <div className="mb-6 lg:hidden">
            <p className="text-sm uppercase tracking-[0.22em] text-brass">Image generate</p>
            <h1 className="serif mt-2 text-3xl">
              <span className="gradient-text">{title}</span>
            </h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>
          <div className="panel rounded-[22px] p-5 sm:rounded-[28px] sm:p-7 md:p-8">
            <div className="mb-6 hidden lg:block">
              <h2 className="serif text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
            </div>
            {children}
            <div className="mt-6 space-y-2 border-t border-line pt-5 text-xs leading-5 text-muted">
              <p>After you sign in, this is where you purchase AI credits for your company.</p>
              <p>1 image generate = 1 credit. Unused credits stay on the workspace.</p>
              <p>Payments are processed by Razorpay. No monthly subscription.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="relative z-10 border-t border-line px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-12 lg:py-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <Step n="01" title="Create a workspace" text="One account for your company. Invite your product to use it." />
          <Step n="02" title="Buy credit packs" text="Starter, Growth, or Bulk. Larger packs cost less per generation." />
          <Step n="03" title="Generate images" text="Each image generate deducts one credit." />
        </div>
      </section>
    </div>
  );
}

function Mini({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
      <p className="serif text-lg">{stat}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="panel rounded-3xl p-5">
      <p className="font-mono text-xs text-brass">{n}</p>
      <p className="serif mt-2 text-xl">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
