import { redirect } from "next/navigation";
import { appRoutes } from "@/shared/config/routes";

export default function DashboardLegacyRoutePage() {
  redirect(appRoutes.home());
}
