"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAuthenticatedMediaBlobUrl, getProfileImageUrl } from "@/lib/media";

type UserAvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: "small" | "medium" | "large";
  className?: string;
};

const sizes = {
  small: "h-9 w-9 rounded-xl text-sm",
  medium: "h-12 w-12 rounded-2xl text-base",
  large: "h-20 w-20 rounded-[1.5rem] text-2xl",
};

export function UserAvatar({
  name,
  src,
  size = "medium",
  className = "",
}: UserAvatarProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(() => getProfileImageUrl(src));
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getInitials(name), [name]);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    Promise.resolve().then(() => {
      if (!active) return;
      setFailed(false);
      setImageSrc(getProfileImageUrl(src));
    });

    fetchAuthenticatedMediaBlobUrl(src)
      .then((url) => {
        if (!active) return;
        if (url?.startsWith("blob:")) objectUrl = url;
        setImageSrc(url);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (imageSrc && !failed) {
    return (
      // Authenticated backend media is loaded as a blob URL, so a native img is used here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={name || "Utilisateur Gansekou"}
        className={`${sizes[size]} bg-white object-cover shadow-sm ring-2 ring-white ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center bg-[#082f1f] font-black text-[#f6c445] shadow-sm ring-2 ring-white ${className}`}
      aria-label={name || "Utilisateur Gansekou"}
    >
      {initials}
    </div>
  );
}

function getInitials(name?: string | null) {
  const parts = (name || "Gansekou")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "G";
}
