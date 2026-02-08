// app/(dashboard)/layout.tsx
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content - add padding for mobile header and bottom nav */}
      <main className="flex-1 bg-zinc-900 text-white overflow-hidden pt-14 pb-16 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
