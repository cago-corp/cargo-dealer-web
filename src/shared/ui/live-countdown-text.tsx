"use client";

import { useEffect, useState } from "react";

type LiveCountdownTextProps = {
  className?: string;
  expiredLabel?: string;
  targetAt: string;
};

export function LiveCountdownText({
  className,
  expiredLabel = "00:00:00",
  targetAt,
}: LiveCountdownTextProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [targetAt]);

  const targetTimestamp = new Date(targetAt).getTime();
  const remainingMilliseconds = Number.isNaN(targetTimestamp)
    ? -1
    : targetTimestamp - now;

  return (
    <span className={className}>
      {formatCountdownClock(remainingMilliseconds, expiredLabel)}
    </span>
  );
}

function formatCountdownClock(remainingMilliseconds: number, expiredLabel: string) {
  if (remainingMilliseconds <= 0) {
    return expiredLabel;
  }

  const totalSeconds = Math.floor(remainingMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}
