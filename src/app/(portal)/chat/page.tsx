import { ChatWindow } from "@/components/ChatWindow";
import { requireAdmin } from "@/lib/auth";

export default async function ChatPage() {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatWindow firstName={admin.name.trim().split(/\s+/)[0] ?? ""} credits={admin.credits} />
    </div>
  );
}
