import { Ticket } from "@/models/Ticket";

export function isTicketRequest(text: string) {
  return /\b(support ticket|raise (a )?ticket|create (a )?ticket|generat\w* (a )?(support )?ticket|open (a )?ticket|make (a )?ticket|file (a )?ticket)\b/i.test(
    text,
  );
}

export async function createSupportTicket(adminId: string, message: string) {
  const subject = message.replace(/\s+/g, " ").trim().slice(0, 80) || "Workspace help";
  const ticket = await Ticket.create({
    adminId,
    code: `LU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    subject,
    message: message.trim(),
    status: "open",
  });

  return ticket;
}
