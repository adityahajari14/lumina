"use client";

import { trackPageView } from "@/lib/meta-pixel";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  const search = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    if (!pathname) return;

    const url = `${pathname}${search ? `?${search}` : ""}`;
    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;

    trackPageView();
  }, [pathname, search]);

  return null;
}
