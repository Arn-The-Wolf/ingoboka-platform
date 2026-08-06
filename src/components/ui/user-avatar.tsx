'use client';

import { cn, getInitials } from '@/lib/utils';

type UserAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  initialsClassName?: string;
};

export function UserAvatar({ name, imageUrl, className, initialsClassName }: UserAvatarProps) {
  const label = name?.trim() || 'User';
  const initials = getInitials(label);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
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
