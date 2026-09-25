import { HistoryDetail } from "@/components/history";
import { donationConfig } from "@/lib/config/donation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Hasil tersimpan",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HistoryDetail id={id} donation={donationConfig()} />;
}
