'use client';

import { useEffect, useState } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import {
  isProfilePictureContentUrl,
  resolveProfilePictureFetchPath,
} from '@/lib/profile-picture-url';
import { useAuthStore } from '@/store/auth-store';

type UserAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  initialsClassName?: string;
};

export function UserAvatar({ name, imageUrl, className, initialsClassName }: UserAvatarProps) {
  const label = name?.trim() || 'User';
  const initials = getInitials(label);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [displayUrl, setDisplayUrl] = useState<string | null>(
    imageUrl && !isProfilePictureContentUrl(imageUrl) ? imageUrl : null
  );

  useEffect(() => {
    if (!imageUrl) {
      setDisplayUrl(null);
      return;
    }

    if (!isProfilePictureContentUrl(imageUrl)) {
      setDisplayUrl(imageUrl);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const path = resolveProfilePictureFetchPath(imageUrl);
        const { data } = await apiClient.get<Blob>(path, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(data);
        if (!cancelled) {
          setDisplayUrl(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setDisplayUrl(null);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl, accessToken]);

  if (displayUrl) {
    return (
      <img
        src={displayUrl}
        alt={label}
        className={cn('h-9 w-9 shrink-0 rounded-full object-cover', className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-medium text-brand-primary-dark',
        className,
        initialsClassName
      )}
      aria-hidden={!name}
    >
      {initials}
    </div>
  );
}
