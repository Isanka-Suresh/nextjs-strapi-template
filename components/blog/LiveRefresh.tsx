"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface LiveRefreshProps {
  slug: string;
  initialUpdatedAt: string;
}

export function LiveRefresh({ slug, initialUpdatedAt }: LiveRefreshProps) {
  const router = useRouter();
  const currentUpdatedAt = useRef(initialUpdatedAt);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await fetch(`/api/check-update?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) return;

        const data = await res.json();
        
        // If the timestamp from the server is different from what we currently have rendered,
        // it means the post was updated in Strapi.
        if (data.updatedAt && data.updatedAt !== currentUpdatedAt.current) {
          console.log("[LiveRefresh] New content detected. Auto-refreshing...");
          // Update the ref so we don't infinitely refresh
          currentUpdatedAt.current = data.updatedAt;
          // Trigger a soft reload to fetch the new Server Component payload
          router.refresh();
        }
      } catch (err) {
        console.error("[LiveRefresh] Failed to check for updates", err);
      }
    };

    // Poll every 10 seconds
    const interval = setInterval(checkUpdate, 8640000);
    return () => clearInterval(interval);
  }, [slug, router]);

  // This component doesn't render anything visually
  return null;
}
