import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Search, RefreshCw, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  ticket_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  status: string;
  created_at: string;
}

interface AdminTransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminTransactionList({ transactions, onRefresh, isLoading }: AdminTransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.ticket_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredTransactions
    .filter(tx => tx.status === 'completed')
    .reduce((acc, tx) => acc + (tx.amount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/20 text-green-400">Complété</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-400">En attente</Badge>;
      case 'failed': return <Badge variant="destructive">Échoué</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Ticket ID', 'Montant', 'Devise', 'Méthode', 'Statut', 'Date'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.ticket_id,
      tx.amount,
      tx.currency,
      tx.payment_method || 'N/A',
      tx.status,
      new Date(tx.created_at).toLocaleString('fr-FR')
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              Historique des transactions ({transactions.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total complété : <span className="font-semibold text-success">{totalAmount.toLocaleString()} XOF</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
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
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune transaction trouvée</p>
            ) : (
              filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{tx.amount.toLocaleString()} {tx.currency}</p>
                      <p className="text-xs text-muted-foreground font-mono">{tx.id.slice(0, 8)}...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(tx.status)}
                    <Badge variant="outline">{tx.payment_method || 'N/A'}</Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
