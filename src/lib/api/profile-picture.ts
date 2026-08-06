import { apiClient } from './client';

export interface ProfilePictureResult {
  profilePictureUrl: string | null;
}

export const profilePictureApi = {
  async get(): Promise<ProfilePictureResult> {
    const { data } = await apiClient.get<{ profilePictureUrl?: string | null }>(
      '/users/me/profile-picture'
    );
    return { profilePictureUrl: data.profilePictureUrl ?? null };
  },

  async setUrl(profilePictureUrl: string): Promise<ProfilePictureResult> {
    const { data } = await apiClient.put<{ profilePictureUrl?: string | null }>(
      '/users/me/profile-picture',
      { profilePictureUrl }
    );
    return { profilePictureUrl: data.profilePictureUrl ?? null };
  },

  async upload(file: File): Promise<ProfilePictureResult> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await apiClient.post<{ profilePictureUrl?: string | null }>(
      '/users/me/profile-picture',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return { profilePictureUrl: data.profilePictureUrl ?? null };
  },

  async remove(): Promise<ProfilePictureResult> {
    const { data } = await apiClient.delete<{ profilePictureUrl?: string | null }>(
      '/users/me/profile-picture'
    );
    return { profilePictureUrl: data.profilePictureUrl ?? null };
  },
};
