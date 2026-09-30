import type { Metadata } from "next";
import { AccountTabs } from "@/components/layout/AccountTabs";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-8 sm:py-12">
      <AccountTabs />
      {children}
    </div>
  );
}
