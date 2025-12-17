import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useStorage = () => {
  const { user } = useAuth();

  const uploadImage = async (file: File, folder: string = 'frames'): Promise<string | null> => {
    if (!user) {
      console.error('User must be logged in to upload');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('campaign-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    if (!user) return false;

    // Extract path from URL
    const bucketUrl = supabase.storage.from('campaign-images').getPublicUrl('').data.publicUrl;
    const path = url.replace(bucketUrl, '');

    if (!path) return false;

    const { error } = await supabase.storage
      .from('campaign-images')
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  };

  return {
    uploadImage,
    deleteImage,
  };
};
