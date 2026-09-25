import { CurrentResult } from "@/components/current-result";
import { donationConfig } from "@/lib/config/donation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Hasil refleksi",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CurrentResult donation={donationConfig()} />;
}
