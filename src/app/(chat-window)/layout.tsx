import { requireDealerActiveSession } from "@/shared/auth/require-dealer-session";
import { ChatRailProvider } from "@/shared/ui/chat-rail-provider";

type ChatWindowLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function ChatWindowLayout({
  children,
}: ChatWindowLayoutProps) {
  await requireDealerActiveSession();

  return (
    <ChatRailProvider>
      <div className="min-h-screen bg-slate-100/80 px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1680px] flex-col">
          {children}
        </div>
      </div>
    </ChatRailProvider>
  );
}
