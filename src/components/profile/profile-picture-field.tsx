'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Link2, Trash2 } from 'lucide-react';
import { profilePictureApi } from '@/lib/api/profile-picture';
import { getApiErrorMessage, isTimeoutError } from '@/lib/api/integration-helpers';
import { withProfilePictureCacheBust } from '@/lib/profile-picture-url';
import { useAuthStore } from '@/store/auth-store';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

type ProfilePictureFieldProps = {
  fullName?: string;
  profilePictureUrl?: string | null;
  onUpdated?: (url: string | null) => void;
  labels?: {
    title?: string;
    urlLabel?: string;
    urlPlaceholder?: string;
    upload?: string;
    saveUrl?: string;
    remove?: string;
    error?: string;
  };
};

export function ProfilePictureField({
  fullName,
  profilePictureUrl,
  onUpdated,
  labels,
}: ProfilePictureFieldProps) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(profilePictureUrl ?? '');
  const [currentUrl, setCurrentUrl] = useState(profilePictureUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUrl(profilePictureUrl ?? null);
    setUrl(profilePictureUrl ?? '');
  }, [profilePictureUrl]);

  const applyUrl = (next: string | null, cacheBust = false) => {
    const resolved =
      next && cacheBust ? withProfilePictureCacheBust(next) : next;
    setCurrentUrl(resolved);
    setUrl(resolved ?? '');
    updateUser({ profilePictureUrl: resolved ?? undefined });
    onUpdated?.(resolved);
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await profilePictureApi.upload(file);
      applyUrl(result.profilePictureUrl ?? null, true);
    } catch (err) {
      if (isTimeoutError(err)) {
        try {
          const pic = await profilePictureApi.get();
          if (pic.profilePictureUrl) {
            applyUrl(pic.profilePictureUrl, true);
            return;
          }
        } catch {
          /* fall through to timeout message */
        }
      }
      setError(getApiErrorMessage(err) ?? labels?.error ?? 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await profilePictureApi.setUrl(url.trim());
      applyUrl(result.profilePictureUrl ?? null, true);
    } catch {
      setError(labels?.error ?? 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);
    try {
      await profilePictureApi.remove();
      applyUrl(null);
    } catch {
      setError(labels?.error ?? 'Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {labels?.title && <p className="text-sm font-medium text-brand-primary-dark">{labels.title}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <UserAvatar name={fullName} imageUrl={currentUrl} className="h-16 w-16 text-base" />
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            loading={loading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {labels?.upload ?? 'Upload photo'}
          </Button>
          {currentUrl && (
            <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => void handleRemove()} disabled={loading}>
              <Trash2 className="h-4 w-4" />
              {labels?.remove ?? 'Remove'}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-picture-url">{labels?.urlLabel ?? 'Or paste image URL'}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="profile-picture-url"
            type="url"
            placeholder={labels?.urlPlaceholder ?? 'https://…'}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="button" variant="secondary" size="sm" className="gap-2 shrink-0" onClick={() => void handleSaveUrl()} loading={loading} disabled={!url.trim()}>
            <Link2 className="h-4 w-4" />
            {labels?.saveUrl ?? 'Use URL'}
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
