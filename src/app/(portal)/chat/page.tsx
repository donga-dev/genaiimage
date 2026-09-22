import { ChatWindow } from "@/components/ChatWindow";
import { requireAdmin } from "@/lib/auth";

export default async function ChatPage() {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatWindow
        firstName={admin.name.trim().split(/\s+/)[0] ?? ""}
        creditsV1={admin.creditsV1}
        creditsV2={admin.creditsV2}
        creditsV3={admin.creditsV3}
      />
    </div>
  );
}
