import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Trash2, Shield, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppRole } from '@/types/ticket';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserWithRoles extends Profile {
  roles: AppRole[];
}

interface AdminUserListProps {
  users: UserWithRoles[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminUserList({ users, onRefresh, isLoading }: AdminUserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      // First delete user roles
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Then delete profile (profiles.id = user_id)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      toast.success('Utilisateur supprimé');
      onRefresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleAssignRole = async (userId: string, role: AppRole) => {
    setAssigningRole(userId);
    try {
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .maybeSingle();

      if (existingRole) {
        toast.info('L\'utilisateur a déjà ce rôle');
        setAssigningRole(null);
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      if (error) throw error;
      toast.success(`Rôle ${role} assigné`);
      onRefresh();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Erreur lors de l\'assignation du rôle');
    } finally {
      setAssigningRole(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      toast.success(`Rôle ${role} retiré`);
      onRefresh();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Erreur lors du retrait du rôle');
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'promoter': return 'secondary';
      case 'staff': return 'outline';
      case 'scanner': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Gestion des utilisateurs ({users.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</p>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || 'Sans nom'}</p>
                      <p className="text-sm text-muted-foreground">{user.email || 'Email non renseigné'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge 
                          key={role} 
                          variant={getRoleBadgeVariant(role)}
                          className="cursor-pointer"
                          onClick={() => handleRemoveRole(user.id, role)}
                        >
                          {role}
                          <span className="ml-1 text-xs">×</span>
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Aucun rôle</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select 
                      onValueChange={(value) => handleAssignRole(user.id, value as AppRole)}
                      disabled={assigningRole === user.id}
                    >
                      <SelectTrigger className="w-32">
                        <Shield className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="promoter">Promoteur</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="scanner">Scanner</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={deletingUserId === user.id}>
                          {deletingUserId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action supprimera définitivement le profil de {user.full_name || user.email}.
                            Les données associées seront également supprimées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                          Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
