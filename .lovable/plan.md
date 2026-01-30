
# Plan de restauration : Upload et Validation des campagnes vidéo

## Diagnostic des problèmes

| Probleme | Actuel | Attendu |
|----------|--------|---------|
| Structure upload | Modal simplifie sans zones photo/IA | Modal detaille comme CreateEventModal avec onglets |
| Validation video admin | Inexistante (infos dans description) | Panneau dedie avec statuts et actions |
| Base de donnees | Pas de colonnes payment | Colonnes dediees pour tracking |

## Architecture de la solution

```text
FLUX CREATION CAMPAGNE VIDEO:

Utilisateur                   Base de donnees                    Admin
    |                              |                              |
    |--[1. Configure cadre]------->|                              |
    |--[2. Paye + entre code]----->|                              |
    |                              |--[Statut: PENDING]---------->|
    |                              |                              |
    |                              |<--[3. Valide paiement]-------|
    |<--[4. Email notification]----|                              |
    |                              |--[Statut: APPROVED]          |
    |--[5. Campagne active]------->|                              |
```

## Modifications a effectuer

### 1. Migration SQL - Nouvelles colonnes

Ajouter des colonnes dediees a la table `campaigns` :

```sql
ALTER TABLE public.campaigns
ADD COLUMN payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'approved', 'rejected')),
ADD COLUMN transaction_code TEXT,
ADD COLUMN payment_country TEXT,
ADD COLUMN payment_amount INTEGER DEFAULT 0;
```

- `payment_status`: 'free' pour Photo, 'pending'/'approved'/'rejected' pour Video
- `transaction_code`: Code de transaction Mobile Money
- `payment_country`: Code pays (BF, CI, ML, OTHER)
- `payment_amount`: Montant paye en FCFA

### 2. Refonte de CreateCampaignModal.tsx

Restaurer la structure complete avec onglets :

**Onglet 1 - Details :**
- Type (Photo gratuit / Video payant)
- Titre et description
- Upload image du cadre via ImageUploader existant

**Onglet 2 - Zone Photo (optionnel) :**
- Integration de PhotoZoneEditor comme dans CreateEventModal
- Permet de definir ou placer la photo du participant

**Onglet 3 - Paiement (Video seulement) :**
- Selecteur de pays
- Instructions de paiement dynamiques (numero + USSD pour BF)
- Champ code de transaction
- Message explicatif sur la validation

**Logique de soumission :**
- Si Photo : `payment_status = 'free'`, creation immediate
- Si Video : `payment_status = 'pending'`, creation en attente

### 3. Nouveau composant AdminVideoCampaignValidation.tsx

Panneau dedie dans SuperAdmin pour gerer les campagnes video en attente :

```typescript
interface PendingCampaign {
  id: string;
  title: string;
  frame_image: string;
  transaction_code: string;
  payment_country: string;
  payment_amount: number;
  owner_name: string;
  created_at: string;
}
```

**Fonctionnalites :**
- Liste des campagnes avec `payment_status = 'pending'`
- Affichage du code transaction et pays
- Boutons Valider / Rejeter
- Envoi email automatique apres validation (via Edge Function)

### 4. Mise a jour de AdminCampaignList.tsx

Ajouter des badges visuels pour le statut de paiement :
- Badge vert "Actif" pour `approved` ou `free`
- Badge orange "En attente" pour `pending`
- Badge rouge "Rejete" pour `rejected`

Filtrer pour afficher uniquement les campagnes actives par defaut.

### 5. Mise a jour de SuperAdmin.tsx

Ajouter un nouvel onglet "Validations Video" :

```typescript
<TabsTrigger value="video-validation">
  Validations Video
  {pendingCount > 0 && <Badge>{pendingCount}</Badge>}
</TabsTrigger>

<TabsContent value="video-validation">
  <AdminVideoCampaignValidation
    campaigns={pendingVideoCampaigns}
    onRefresh={fetchCampaigns}
    isLoading={isLoadingData}
  />
</TabsContent>
```

### 6. Edge Function pour email de notification (optionnel)

Creer `supabase/functions/notify-campaign-approval/index.ts` :
- Declenche apres validation par l'admin
- Envoie email a l'utilisateur avec lien vers sa campagne

## Fichiers a modifier/creer

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer - nouvelles colonnes payment |
| src/components/CreateCampaignModal.tsx | Modifier - structure avec onglets + PhotoZoneEditor |
| src/components/admin/AdminVideoCampaignValidation.tsx | Creer - nouveau panneau validation |
| src/components/admin/AdminCampaignList.tsx | Modifier - badges statut + filtres |
| src/pages/SuperAdmin.tsx | Modifier - ajouter onglet validation |
| src/types/campaign.ts | Modifier - ajouter types payment |
| src/hooks/useCampaigns.ts | Modifier - mapper nouvelles colonnes |

## Resultat attendu

1. **Createur** : Interface claire avec onglets (Details > Zone Photo > Paiement)
2. **Admin** : Panneau dedie pour valider les paiements video avec toutes les infos
3. **Tracking** : Colonnes dediees au lieu d'injecter dans la description
4. **Visibilite** : Campagnes video "pending" non visibles publiquement jusqu'a validation
