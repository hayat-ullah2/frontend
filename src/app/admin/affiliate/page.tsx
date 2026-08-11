import AffiliateManager from "@/components/admin/AffiliateManager";
import Topbar from "@/components/admin/Topbar";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiAffiliateLink } from "@/lib/models";

export default async function AdminAffiliatePage() {
  const links = await apiServerSafe<ApiAffiliateLink[]>("/affiliate-links?all=1", []);
  const totalClicks = links.reduce((s, l) => s + (l.clicks ?? 0), 0);
  const totalEarnings = links.reduce((s, l) => s + (l.earnings ?? 0), 0);

  return (
    <>
      <Topbar
        title="Affiliate tools"
        subtitle={`${links.length} tools · ${totalClicks} tracked clicks · $${totalEarnings} logged`}
      />
      <AffiliateManager initial={links} />
    </>
  );
}
