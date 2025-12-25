import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, AppRole } from '@/types/ticket';
import { useAuth } from '@/hooks/useAuth';

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRoles((data as unknown as UserRole[]) || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: AppRole, eventId?: string): boolean => {
    return roles.some(r => 
      r.role === role && 
      (eventId ? r.event_id === eventId || r.event_id === null : true)
    );
  };

  const isAdmin = () => hasRole('admin');
  const isPromoter = () => hasRole('promoter');
  const isStaff = (eventId?: string) => hasRole('staff', eventId) || isAdmin() || isPromoter();
  const isScanner = (eventId?: string) => hasRole('scanner', eventId) || isStaff(eventId);

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isPromoter,
    isStaff,
    isScanner,
    refetch: fetchRoles,
  };
}
