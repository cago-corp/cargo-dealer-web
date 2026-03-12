export function formatRemainingTime(deadlineAt: string) {
  const diffMilliseconds = new Date(deadlineAt).getTime() - Date.now();

  if (diffMilliseconds <= 0) {
    return "마감";
  }

  const totalMinutes = Math.floor(diffMilliseconds / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}일 ${hours}시간`;
  }

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  return `${minutes}분`;
}
