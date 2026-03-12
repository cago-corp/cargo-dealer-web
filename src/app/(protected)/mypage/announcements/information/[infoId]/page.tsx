import { DealerAnnouncementInfoPage } from "@/features/mypage/dealer-announcement-info-page";

type MypageAnnouncementInfoRoutePageProps = {
  params: Promise<{
    infoId: string;
  }>;
};

export default async function MypageAnnouncementInfoRoutePage({
  params,
}: MypageAnnouncementInfoRoutePageProps) {
  const { infoId } = await params;

  return <DealerAnnouncementInfoPage infoId={infoId} />;
}
