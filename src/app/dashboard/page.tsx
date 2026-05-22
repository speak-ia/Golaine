import DashboardHome from "@features/dashboard/components/DashboardHome";
import { loadDashboardHomeData } from "@features/dashboard/data/loadDashboardHomeData";

export default async function DashboardPage() {
  const data = await loadDashboardHomeData();
  return <DashboardHome data={data} />;
}
