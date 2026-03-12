import { DealerAnnouncementDetailPage } from "@/features/mypage/dealer-announcement-detail-page";

type MypageAnnouncementDetailRoutePageProps = {
  params: Promise<{
    noticeId: string;
  }>;
};

export default async function MypageAnnouncementDetailRoutePage({
  params,
}: MypageAnnouncementDetailRoutePageProps) {
  const { noticeId } = await params;

  return <DealerAnnouncementDetailPage noticeId={noticeId} />;
}
