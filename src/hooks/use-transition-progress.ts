import { startProgress, stopProgress } from "next-nprogress-bar";
import { useEffect, useTransition } from "react";

export default function useTransitionProgress() {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isPending) {
      startProgress();
    } else {
      stopProgress();
    }
  }, [isPending]);

  return { isPending, startTransition };
}