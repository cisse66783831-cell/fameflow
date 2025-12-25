import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Trash2, Loader2, UserCog, ScanLine, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

interface StaffMember {
  id: string;
  user_id: string;
  role: 'staff' | 'scanner';
  email?: string;
  created_at: string;
}

export function ManageRolesModal({ isOpen, onClose, event }: ManageRolesModalProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'staff' | 'scanner'>('scanner');

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen, event.id]);

  const fetchStaff = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('event_id', event.id)
      .in('role', ['staff', 'scanner']);

    if (error) {
      console.error('Error fetching staff:', error);
      toast.error('Erreur lors du chargement');
    } else {
      // Get emails for staff members
      const staffWithEmails: StaffMember[] = [];
      for (const member of data || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', member.user_id)
          .maybeSingle();
        
        staffWithEmails.push({
          ...member,
          email: profile?.email || 'Email inconnu',
        } as StaffMember);
      }
      setStaff(staffWithEmails);
    }
    setIsLoading(false);
  };

  const handleAddStaff = async () => {
    if (!newEmail.trim()) {
      toast.error('Veuillez entrer un email');
      return;
    }

    setIsAdding(true);

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', newEmail.trim().toLowerCase())
      .maybeSingle();

    if (profileError || !profile) {
      toast.error('Utilisateur non trouvé. L\'utilisateur doit d\'abord créer un compte.');
      setIsAdding(false);
      return;
    }

    // Check if already has this role
    const existing = staff.find(s => s.user_id === profile.id);
    if (existing) {
      toast.error('Cet utilisateur a déjà un rôle pour cet événement');
      setIsAdding(false);
      return;
    }

    // Add role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: profile.id,
        role: newRole,
        event_id: event.id,
      });

    setIsAdding(false);

    if (error) {
      console.error('Error adding staff:', error);
      toast.error('Erreur lors de l\'ajout');
    } else {
      toast.success(`${newRole === 'scanner' ? 'Scanner' : 'Staff'} ajouté avec succès`);
      setNewEmail('');
      fetchStaff();
    }
  };

  const handleRemoveStaff = async (memberId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing staff:', error);
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Membre supprimé');
      setStaff(staff.filter(s => s.id !== memberId));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'scanner':
        return <ScanLine className="w-4 h-4" />;
      case 'staff':
        return <UserCog className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'scanner':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'staff':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Gérer le staff
          </DialogTitle>
          <DialogDescription>
            Ajoutez des scanners et du staff pour "{event.title}"
          </DialogDescription>
        </DialogHeader>

        {/* Add Staff Form */}
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email de l'utilisateur</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="w-32 space-y-2">
              <Label>Rôle</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as 'staff' | 'scanner')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scanner">Scanner</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleAddStaff} 
            disabled={isAdding}
            className="w-full"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Ajouter
          </Button>
        </div>

        {/* Staff List */}
        <div className="space-y-3">
          <Label className="text-muted-foreground">Membres actuels</Label>
          
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Chargement...
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Aucun staff ajouté
            </div>
          ) : (
            <div className="space-y-2">
              {staff.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 ${getRoleColor(member.role)}`}
                    >
                      {getRoleIcon(member.role)}
                      {member.role === 'scanner' ? 'Scanner' : 'Staff'}
                    </Badge>
                    <span className="text-sm">{member.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStaff(member.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
