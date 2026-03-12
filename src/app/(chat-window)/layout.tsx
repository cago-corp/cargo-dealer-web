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
      <div className="h-screen overflow-hidden bg-slate-100/80 px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-[1680px] min-h-0 flex-col">
          {children}
        </div>
      </div>
    </ChatRailProvider>
  );
}
